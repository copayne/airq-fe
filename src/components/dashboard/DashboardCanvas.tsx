import React, { Suspense, memo, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider, type Layout, type Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDashboardLayoutContext } from '~/context/DashboardLayoutContext';
import type { DashboardLayoutData, GridItemLayout, WidgetState } from '~/types/dashboard';
import { getDefaultWidgetConfig } from '~/types/widgetConfig';
import { getWidgetDefinition } from '~/config/widgetRegistry';
import LayoutMenu from './LayoutMenu';
import WidgetMenu from './WidgetMenu';
import WidgetConfigPanel from './WidgetConfigPanel';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Types
interface Widget {
  id: string;
  title: string;
  type: string;
  config: Record<string, unknown>;
  props?: Record<string, unknown>;
}

interface WidgetWrapperProps {
  widget: Widget;
  children: React.ReactNode;
  onRemove: (id: string) => void;
  onConfigChange: (widgetId: string, config: Record<string, unknown>) => void;
}

interface WidgetRendererProps {
  widget: Widget;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  widgetComponents: Record<string, React.LazyExoticComponent<React.ComponentType<any>>>;
}

// Helper to get widget title from type
const getWidgetTitle = (type: string): string => {
  const titles: Record<string, string> = {
    'TABLE': 'Sensor Readings',
    'MULTI_METRIC_CHART': 'Multi-Metric Chart',
    'AIR_QUALITY_DISTRIBUTION': 'Air Quality Distribution',
    'AIR_QUALITY_HEATMAP': 'Air Quality Heatmap',
    'METRICS_CARD': 'Metrics',
    'SENSOR_COMPARISON': 'Sensor Comparison',
  };
  return titles[type] ?? type;
};

// Helper to convert GridItemLayout to Layout
const toLayout = (item: GridItemLayout): Layout => ({
  i: item.i,
  x: item.x,
  y: item.y,
  w: item.w,
  h: item.h,
  minW: item.minW,
  minH: item.minH,
  maxW: item.maxW,
  maxH: item.maxH,
});

// Helper to compare widget configs by value (not reference)
const areConfigsEqual = (prevConfig: Record<string, unknown>, nextConfig: Record<string, unknown>): boolean => {
  const keys = new Set([...Object.keys(prevConfig), ...Object.keys(nextConfig)]);
  for (const key of keys) {
    const prevVal = prevConfig[key];
    const nextVal = nextConfig[key];
    // Handle arrays specially - compare by stringified value
    if (Array.isArray(prevVal) && Array.isArray(nextVal)) {
      if (JSON.stringify(prevVal) !== JSON.stringify(nextVal)) return false;
    } else if (prevVal !== nextVal) {
      return false;
    }
  }
  return true;
};

// Widget loading skeleton - defined outside to prevent recreation
const WidgetLoadingSkeleton: React.FC<{ type: string }> = memo(({ type }) => {
  const isTable = type === 'TABLE';
  return (
    <div
      className="w-full animate-pulse bg-gray-100"
      style={{ height: isTable ? '400px' : '150px' }}
    >
      <div className="p-4">
        {isTable ? (
          <>
            <div className="h-6 bg-gray-300 rounded mb-4 w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          </>
        ) : (
          <div className="h-4 bg-gray-300 rounded"></div>
        )}
      </div>
    </div>
  );
});
WidgetLoadingSkeleton.displayName = 'WidgetLoadingSkeleton';

// Widget renderer - memoized with custom comparison to only re-render when config values change
const WidgetRenderer: React.FC<WidgetRendererProps> = memo(({ widget, widgetComponents }) => {
  const WidgetComponent = widgetComponents[widget.type];

  if (!WidgetComponent) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 border-2 border-red-200">
        <p className="text-red-600">Unknown widget type: {widget.type}</p>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = WidgetComponent as React.ComponentType<any>;

  return (
    <Suspense fallback={<WidgetLoadingSkeleton type={widget.type} />}>
      <Component {...(widget.props ?? {})} config={widget.config} />
    </Suspense>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if widget id, type, or config VALUES change
  if (prevProps.widget.id !== nextProps.widget.id) return false;
  if (prevProps.widget.type !== nextProps.widget.type) return false;
  if (!areConfigsEqual(prevProps.widget.config, nextProps.widget.config)) return false;
  // Props comparison (shallow)
  if (JSON.stringify(prevProps.widget.props) !== JSON.stringify(nextProps.widget.props)) return false;
  return true;
});
WidgetRenderer.displayName = 'WidgetRenderer';

// Widget wrapper - memoized with custom comparison
const WidgetWrapper: React.FC<WidgetWrapperProps> = memo(({ widget, children, onRemove, onConfigChange }) => (
  <div className="h-full w-full border-black border-[1px] shadow-airq-dark shadow-card flex flex-col overflow-hidden">
    <div className="bg-airq-dark text-airq-light px-2 py-1 flex justify-between items-center border-b-[1px] border-airq-dark">
      <p className="h-[18px] text-xs font-semibold flex-1 align-baseline widget-drag-handle cursor-grab">
        {widget.title}
      </p>
      <div className="flex items-center gap-0.5">
        <WidgetConfigPanel
          widgetId={widget.id}
          widgetType={widget.type}
          config={widget.config}
          onConfigChange={onConfigChange}
        />
        <button
          onClick={() => onRemove(widget.id)}
          className="text-airq-light hover:text-airq-light/80 focus:outline-none p-0.5"
          title="Remove"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    <div className="flex-1 overflow-hidden">{children}</div>
  </div>
), (prevProps, nextProps) => {
  // Custom comparison: only re-render if widget id, title, type, or config VALUES change
  if (prevProps.widget.id !== nextProps.widget.id) return false;
  if (prevProps.widget.title !== nextProps.widget.title) return false;
  if (prevProps.widget.type !== nextProps.widget.type) return false;
  if (!areConfigsEqual(prevProps.widget.config, nextProps.widget.config)) return false;
  // Callback references don't matter for rendering - assume they're stable
  return true;
});
WidgetWrapper.displayName = 'WidgetWrapper';

interface DashboardCanvasProps {
  compact?: boolean;
}

const DashboardCanvas = memo(({ compact = false }: DashboardCanvasProps) => {
  // Widget components with lazy loading - stable reference
  const WIDGETS = useMemo(() => ({
    TABLE: React.lazy(() => import('./widgets/tables/SensorReadingTable')),
    MULTI_METRIC_CHART: React.lazy(() => import('./widgets/charts/MetricChart').then(m => ({ default: m.MultiMetricChart }))),
    AIR_QUALITY_DISTRIBUTION: React.lazy(() => import('./widgets/charts/AirQualityDistributionChart')),
    AIR_QUALITY_HEATMAP: React.lazy(() => import('./widgets/charts/AirQualityHeatmap')),
    METRICS_CARD: React.lazy(() => import('./widgets/cards/MetricsCard')),
    SENSOR_COMPARISON: React.lazy(() => import('./widgets/charts/SensorComparisonChart')),
  }), []);

  // Get layout data directly from context
  const {
    currentLayoutData,
    updateLayoutData,
    updateWidgetConfig,
    isLoading,
    droppingWidget,
    setDroppingWidget,
  } = useDashboardLayoutContext();

  // Derive widgets from context layout data
  // Merge default config for widgets that don't have config set
  const widgets = useMemo((): Widget[] => {
    if (!currentLayoutData?.widgets) return [];
    return currentLayoutData.widgets.map((ws: WidgetState) => {
      const defaultConfig = getDefaultWidgetConfig(ws.type);
      return {
        id: ws.instanceId,
        title: (ws.config?.displayName as string) || getWidgetTitle(ws.type),
        type: ws.type,
        config: { ...defaultConfig, ...ws.config },
        props: ws.props,
      };
    });
  }, [currentLayoutData]);

  // Derive grid layouts from context layout data
  // Always use registry min values so constraint updates apply to existing widgets
  const layouts = useMemo((): Layouts => {
    if (!currentLayoutData?.widgets) return { lg: [], md: [], sm: [], xs: [] };

    const result: Layouts = { lg: [], md: [], sm: [], xs: [] };

    currentLayoutData.widgets.forEach((ws: WidgetState) => {
      // Look up the widget's registry definition for authoritative min constraints
      const registryDef = getWidgetDefinition(ws.type);
      const registryLayouts = registryDef?.defaultLayouts;

      if (ws.layout.lg) {
        result.lg?.push({
          ...toLayout(ws.layout.lg),
          minH: registryLayouts?.lg.minH ?? ws.layout.lg.minH,
          minW: registryLayouts?.lg.minW ?? ws.layout.lg.minW,
        });
      }
      if (ws.layout.md) {
        result.md?.push({
          ...toLayout(ws.layout.md),
          minH: registryLayouts?.md.minH ?? ws.layout.md.minH,
          minW: registryLayouts?.md.minW ?? ws.layout.md.minW,
        });
      }
      if (ws.layout.sm) {
        result.sm?.push({
          ...toLayout(ws.layout.sm),
          minH: registryLayouts?.sm.minH ?? ws.layout.sm.minH,
          minW: registryLayouts?.sm.minW ?? ws.layout.sm.minW,
        });
        // xs derives from sm: full-width stacked, clamped to 6 cols
        const smLayout = ws.layout.sm;
        result.xs?.push({
          ...toLayout(smLayout),
          x: 0,
          w: 6,
          minW: Math.min(registryLayouts?.sm.minW ?? smLayout.minW ?? 6, 6),
          minH: registryLayouts?.sm.minH ?? smLayout.minH,
        });
      }
    });

    return result;
  }, [currentLayoutData]);

  // Dropping item for external drag (from widget menu)
  // Use MINIMUM dimensions so new widgets don't disrupt existing layout
  const droppingItem = useMemo((): Layout | undefined => {
    if (!droppingWidget) return undefined;
    const lgLayout = droppingWidget.defaultLayouts.lg;
    return {
      i: '__dropping-elem__',
      x: 0,
      y: 0,
      w: lgLayout.minW ?? lgLayout.w,
      h: lgLayout.minH ?? lgLayout.h,
    };
  }, [droppingWidget]);

  // Update context when layout changes (drag/resize)
  // Updates ALL widgets from the layout array to preserve positions after compaction
  const handleDragOrResizeStop = useCallback(
    (layout: Layout[], _oldItem: Layout, _newItem: Layout) => {
      if (!currentLayoutData) return;

      // Update ALL widgets' layouts from the current layout array
      // This preserves positions of widgets that were pushed by compaction
      const updatedWidgets = currentLayoutData.widgets.map((ws: WidgetState) => {
        const currentPos = layout.find(l => l.i === ws.instanceId);
        if (!currentPos) return ws;

        return {
          ...ws,
          layout: {
            ...ws.layout,
            lg: {
              i: currentPos.i,
              x: currentPos.x,
              y: currentPos.y,
              w: currentPos.w,
              h: currentPos.h,
              minW: ws.layout.lg?.minW,
              minH: ws.layout.lg?.minH,
              maxW: ws.layout.lg?.maxW,
              maxH: ws.layout.lg?.maxH,
            },
          },
        };
      });

      const newLayoutData: DashboardLayoutData = {
        ...currentLayoutData,
        widgets: updatedWidgets,
      };

      updateLayoutData(newLayoutData);
    },
    [currentLayoutData, updateLayoutData]
  );

  // Handle external drop (from widget menu)
  const handleDrop = useCallback(
    (layout: Layout[], layoutItem: Layout, _event: Event) => {
      if (!droppingWidget || !currentLayoutData) return;

      const instanceId = `widget-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Get minimum dimensions for the new widget
      const lgLayout = droppingWidget.defaultLayouts.lg;
      const mdLayout = droppingWidget.defaultLayouts.md;
      const smLayout = droppingWidget.defaultLayouts.sm;

      // Update existing widgets with their current positions from the layout array
      // This preserves where react-grid-layout placed them after compaction
      const updatedExistingWidgets = currentLayoutData.widgets.map((ws: WidgetState) => {
        const currentPos = layout.find(l => l.i === ws.instanceId);
        if (!currentPos) return ws;

        return {
          ...ws,
          layout: {
            ...ws.layout,
            lg: {
              ...ws.layout.lg!,
              x: currentPos.x,
              y: currentPos.y,
              w: currentPos.w,
              h: currentPos.h,
            },
          },
        };
      });

      // Get default config for this widget type
      const defaultConfig = getDefaultWidgetConfig(droppingWidget.id);

      // Create the new widget at the drop position with MINIMUM dimensions
      const newWidget: WidgetState = {
        instanceId,
        type: droppingWidget.id,
        config: Object.keys(defaultConfig).length > 0 ? defaultConfig : undefined,
        layout: {
          lg: {
            i: instanceId,
            x: layoutItem.x,
            y: layoutItem.y,
            w: lgLayout.minW ?? lgLayout.w,
            h: lgLayout.minH ?? lgLayout.h,
            minW: lgLayout.minW,
            minH: lgLayout.minH,
            maxW: lgLayout.maxW,
            maxH: lgLayout.maxH,
          },
          md: {
            i: instanceId,
            x: Math.min(layoutItem.x, 16 - (mdLayout.minW ?? mdLayout.w)),
            y: layoutItem.y,
            w: mdLayout.minW ?? mdLayout.w,
            h: mdLayout.minH ?? mdLayout.h,
            minW: mdLayout.minW,
            minH: mdLayout.minH,
            maxW: mdLayout.maxW,
            maxH: mdLayout.maxH,
          },
          sm: {
            i: instanceId,
            x: 0,
            y: layoutItem.y,
            w: smLayout.minW ?? smLayout.w,
            h: smLayout.minH ?? smLayout.h,
            minW: smLayout.minW,
            minH: smLayout.minH,
            maxW: smLayout.maxW,
            maxH: smLayout.maxH,
          },
        },
      };

      const newLayoutData: DashboardLayoutData = {
        ...currentLayoutData,
        widgets: [...updatedExistingWidgets, newWidget],
      };

      updateLayoutData(newLayoutData);
      setDroppingWidget(null);
    },
    [droppingWidget, currentLayoutData, updateLayoutData, setDroppingWidget]
  );

  // Remove a widget
  const removeWidget = useCallback(
    (id: string) => {
      if (!currentLayoutData) return;

      const updatedWidgets = currentLayoutData.widgets.filter(
        (ws: WidgetState) => ws.instanceId !== id
      );

      const newLayoutData: DashboardLayoutData = {
        ...currentLayoutData,
        widgets: updatedWidgets,
      };

      updateLayoutData(newLayoutData);
    },
    [currentLayoutData, updateLayoutData]
  );

  // Loading state
  if (isLoading && widgets.length === 0) {
    return (
      <div className="h-full w-full p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airq-primary mx-auto mb-4"></div>
          <p className="text-airq-dark">Loading dashboard layout...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && widgets.length === 0) {
    return (
      <div className="h-full w-full p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-airq-dark mb-4">No dashboard layout found.</p>
          <p className="text-airq-dark/70 text-sm">Use the layout menu to load or create a layout.</p>
        </div>
        <LayoutMenu />
        <WidgetMenu />
      </div>
    );
  }

  const gridPadding = compact ? 'p-2' : 'p-2 sm:p-4';
  const rowHeight = compact ? 48 : 55;
  const gridMargin: [number, number] = compact ? [6, 6] : [8, 8];

  return (
    <div className={`h-full w-full ${gridPadding} overflow-hidden`}>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1100, md: 900, sm: 768, xs: 0 }}
        cols={{ lg: 24, md: 16, sm: 12, xs: 6 }}
        rowHeight={rowHeight}
        margin={gridMargin}
        onDragStop={handleDragOrResizeStop}
        onResizeStop={handleDragOrResizeStop}
        isDraggable={true}
        isResizable={true}
        resizeHandles={['se', 'sw']}
        draggableHandle=".widget-drag-handle"
        compactType="vertical"
        preventCollision={false}
        isDroppable={true}
        droppingItem={droppingItem}
        onDrop={handleDrop}
      >
        {widgets.map(widget => (
          <div key={widget.id}>
            <WidgetWrapper widget={widget} onRemove={removeWidget} onConfigChange={updateWidgetConfig}>
              <WidgetRenderer widget={widget} widgetComponents={WIDGETS} />
            </WidgetWrapper>
          </div>
        ))}
      </ResponsiveGridLayout>

      <LayoutMenu />
      <WidgetMenu />
    </div>
  );
});

DashboardCanvas.displayName = 'DashboardCanvas';

export default DashboardCanvas;
