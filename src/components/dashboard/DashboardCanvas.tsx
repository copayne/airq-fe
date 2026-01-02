// Dashboard.tsx
import React, { Suspense, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Responsive, WidthProvider, type Layout, type Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useSensors } from '~/hooks/useSensors';

// Create a responsive grid layout with width provider
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
}

// Dashboard component
const DashboardCanvas = memo(() => {
  // Get sensor data for the basement sensor card
  const { sensors } = useSensors({ fetchPolicy: 'cache-first' });
  const basementSensor = useMemo(() =>
    sensors?.find(s => s.currentLocation.name.toLowerCase() === 'basement'),
    [sensors]
  );

  // Widget components with lazy loading - consolidated for simplicity
  const WIDGETS = useMemo(() => ({
    TABLE: React.lazy(() => import('./widgets/tables/SensorReadingTable')),
    TEMPERATURE_CHART: React.lazy(() => import('./widgets/charts/MetricChart').then(m => ({ default: m.TemperatureChart }))),
    CO2_CHART: React.lazy(() => import('./widgets/charts/MetricChart').then(m => ({ default: m.CO2Chart }))),
    MULTI_METRIC_CHART: React.lazy(() => import('./widgets/charts/MetricChart').then(m => ({ default: m.MultiMetricChart }))),
    AIR_QUALITY_DISTRIBUTION: React.lazy(() => import('./widgets/charts/AirQualityDistributionChart')),
    AIR_QUALITY_HEATMAP: React.lazy(() => import('./widgets/charts/AirQualityHeatmap')),
    METRICS_CARD: React.lazy(() => import('./widgets/cards/MetricsCard')),
    SENSOR_CARD: React.lazy(() => import('./widgets/cards/SensorCard')),
    RING_SNAPSHOT: React.lazy(() => import('./widgets/cards/RingSnapshotCard')),
    RING_CONTACT_SENSORS: React.lazy(() => import('./widgets/RingContactSensorCard')),
    RING_STATUS: React.lazy(() => import('./widgets/RingStatusCard')),
    QUICK_ACTIONS: React.lazy(() => import('./widgets/cards/QuickActionsCard')),
    RING_EVENTS: React.lazy(() => import('./widgets/cards/RingEventsCard')),
  }), []);

  type WidgetType = keyof typeof WIDGETS;

  // Widget loading skeleton component
  const WidgetLoadingSkeleton: React.FC<{ type: string }> = ({ type }) => {
    const skeletonConfig: Record<string, { height: string; content: React.ReactNode }> = {
      'TABLE': {
        height: '400px',
        content: (
          <>
            <div className="h-6 bg-gray-300 rounded mb-4 w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          </>
        )
      },
    };

    const config = skeletonConfig[type] ?? {
      height: '150px',
      content: <div className="h-4 bg-gray-300 rounded"></div>
    };

    return (
      <div
        className="w-full animate-pulse bg-gray-100"
        style={{ height: config.height }}
      >
        <div className="p-4">
          {config.content}
        </div>
      </div>
    );
  };

  // Widget renderer with error boundary and suspense - memoized to prevent unnecessary re-renders
  const WidgetRenderer = memo<{ widget: Widget }>(
    ({ widget }) => {
      const WidgetComponent = WIDGETS[widget.type as WidgetType];

      if (!WidgetComponent) {
        return (
          <div className="w-full h-full flex items-center justify-center bg-red-50 border-2 border-red-200">
            <p className="text-red-600">Unknown widget type: {widget.type}</p>
          </div>
        );
      }

      // Type assertion: We know the props match the component's expected props at runtime
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Component = WidgetComponent as React.ComponentType<any>;

      return (
        <Suspense fallback={<WidgetLoadingSkeleton type={widget.type} />}>
          <Component
            {...(widget.props ?? {} as Record<string, unknown>)}
          />
        </Suspense>
      );
    },
    (prevProps, nextProps) => {
      // Deep comparison: only re-render if widget data actually changed
      // This prevents re-renders during layout changes (resize/drag)
      return (
        prevProps.widget.id === nextProps.widget.id &&
        prevProps.widget.type === nextProps.widget.type &&
        JSON.stringify(prevProps.widget.props) === JSON.stringify(nextProps.widget.props) &&
        JSON.stringify(prevProps.widget.config) === JSON.stringify(nextProps.widget.config)
      );
    }
  );
  WidgetRenderer.displayName = 'WidgetRenderer';

  // Generate default layouts for widgets
  const generateDefaultLayouts = useMemo(() => {
    return {
      lg: [
        // Basement sensor (top-left)
        { i: 'widget-7', x: 0, y: 0, w: 5, h: 2, minW: 5, minH: 2 },
        // Metrics widget (below basement)
        { i: 'widget-1', x: 0, y: 2, w: 5, h: 5, minW: 5, minH: 5 },
        // Air Quality Distribution (bottom-left, tall)
        { i: 'widget-2', x: 0, y: 7, w: 5, h: 8, minW: 4, minH: 8 },
        // CO2 chart (top-middle)
        { i: 'widget-3', x: 5, y: 0, w: 12, h: 4, minW: 8, minH: 4 },
        // Ring snapshot (middle)
        { i: 'widget-5', x: 5, y: 4, w: 12, h: 8, minW: 8, minH: 6 },
        // Ring contact sensors (bottom-middle)
        { i: 'widget-6', x: 5, y: 12, w: 12, h: 3, minW: 10, minH: 2 },
        // Air Quality Heatmap (right, top)
        { i: 'widget-8', x: 17, y: 0, w: 7, h: 9, minW: 5, minH: 9 },
        // Ring Events (right, below heatmap)
        { i: 'widget-9', x: 17, y: 9, w: 7, h: 6, minW: 5, minH: 4 },
      ],
      md: [
        // Basement sensor (top row)
        { i: 'widget-7', x: 0, y: 0, w: 6, h: 2, minW: 5, minH: 2 },
        // Metrics widget (below basement sensor)
        { i: 'widget-1', x: 0, y: 2, w: 4, h: 5, minW: 4, minH: 5 },
        // CO2 chart (top-right)
        { i: 'widget-3', x: 4, y: 0, w: 8, h: 4, minW: 6, minH: 4 },
        // Air Quality Heatmap (right side)
        { i: 'widget-8', x: 12, y: 0, w: 4, h: 6, minW: 4, minH: 5 },
        // Air Quality Distribution (bottom-left, tall)
        { i: 'widget-2', x: 0, y: 7, w: 4, h: 7, minW: 3, minH: 7 },
        // Ring snapshot (bottom-middle)
        { i: 'widget-5', x: 4, y: 4, w: 8, h: 6, minW: 6, minH: 5 },
        // Ring contact sensors (below camera)
        { i: 'widget-6', x: 4, y: 10, w: 12, h: 3, minW: 8, minH: 2 },
        // Ring Events (bottom-right)
        { i: 'widget-9', x: 12, y: 6, w: 4, h: 7, minW: 4, minH: 4 },
      ],
      sm: [
        // Basement sensor (top)
        { i: 'widget-7', x: 0, y: 0, w: 12, h: 2, minW: 8, minH: 2 },
        // Metrics widget
        { i: 'widget-1', x: 0, y: 2, w: 12, h: 5, minW: 8, minH: 5 },
        // CO2 chart
        { i: 'widget-3', x: 0, y: 7, w: 12, h: 5, minW: 8, minH: 4 },
        // Air Quality Heatmap
        { i: 'widget-8', x: 0, y: 12, w: 12, h: 4, minW: 8, minH: 4 },
        // Air Quality Distribution (tall)
        { i: 'widget-2', x: 0, y: 18, w: 12, h: 8, minW: 8, minH: 8 },
        // Ring snapshot
        { i: 'widget-5', x: 0, y: 26, w: 12, h: 7, minW: 8, minH: 5 },
        // Ring contact sensors
        { i: 'widget-6', x: 0, y: 33, w: 12, h: 3, minW: 8, minH: 2 },
        // Ring Events
        { i: 'widget-9', x: 0, y: 36, w: 12, h: 5, minW: 8, minH: 4 },
      ],
    };
  }, []);

  // Generate initial widgets for the dashboard
  const generateInitialWidgets = useMemo(() => {
    const widgets: Widget[] = [
      {
        id: 'widget-1',
        title: 'Metrics',
        type: 'METRICS_CARD',
        config: {}
      },
      {
        id: 'widget-2',
        title: 'Air Quality Distribution',
        type: 'AIR_QUALITY_DISTRIBUTION',
        config: {},
        props: {
          showLegend: true,
          showTitle: false,
        },
      },
      {
        id: 'widget-3',
        title: 'CO2 Trends',
        type: 'CO2_CHART',
        config: { timeRange: '24h' }
      },
      {
        id: 'widget-5',
        title: 'Front Porch Camera',
        type: 'RING_SNAPSHOT',
        config: {},
        props: {
          deviceId: '59852574',
          cameraName: 'Front Porch',
        },
      },
      {
        id: 'widget-6',
        title: 'Door Sensors',
        type: 'RING_CONTACT_SENSORS',
        config: {},
        props: {},
      },
      {
        id: 'widget-7',
        title: 'Basement',
        type: 'SENSOR_CARD',
        config: {},
        props: {
          sensor: basementSensor ?? null,
        },
      },
      {
        id: 'widget-8',
        title: 'Air Quality Heatmap',
        type: 'AIR_QUALITY_HEATMAP',
        config: {},
      },
      {
        id: 'widget-9',
        title: 'Ring Events',
        type: 'RING_EVENTS',
        config: {},
      },
    ];

    return widgets;
  }, [basementSensor]);

  // State
  const [layouts, setLayouts] = useState<Layouts>(generateDefaultLayouts);
  const [widgets, setWidgets] = useState<Widget[]>(generateInitialWidgets);

  // Update widgets when sensor data loads
  useEffect(() => {
    setWidgets(generateInitialWidgets);
  }, [generateInitialWidgets]);

  // Save layouts and widgets when they change
  useEffect(() => {
    localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
  }, [layouts]);
  
  useEffect(() => {
    localStorage.setItem('dashboard-widgets', JSON.stringify(widgets));
  }, [widgets]);

  // Handle layout change - memoized callback
  // Handle layout changes only when drag/resize stops to prevent excessive updates
  const handleLayoutChange = useCallback((_currentLayout: Layout[], _allLayouts: Layouts) => {
    // This is called continuously during drag/resize - we'll use onDragStop/onResizeStop instead
  }, []);

  const handleDragOrResizeStop = useCallback((_layout: Layout[], oldItem: Layout, newItem: Layout) => {
    // Only update if position or size actually changed
    if (oldItem.x !== newItem.x || oldItem.y !== newItem.y ||
        oldItem.w !== newItem.w || oldItem.h !== newItem.h) {
      // Get current layouts from state and update
      setLayouts(prev => {
        const newLayouts = { ...prev };
        // Update each breakpoint's layout
        Object.keys(newLayouts).forEach(breakpoint => {
          const layoutForBreakpoint = newLayouts[breakpoint];
          const itemIndex = layoutForBreakpoint?.findIndex((item: Layout) => item.i === newItem.i);
          if (itemIndex !== undefined && itemIndex >= 0 && layoutForBreakpoint) {
            layoutForBreakpoint[itemIndex] = { ...layoutForBreakpoint[itemIndex], ...newItem };
          }
        });
        return newLayouts;
      });
    }
  }, []);

  // Remove a widget - memoized callback with functional updates
  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));

    setLayouts(prev => {
      const newLayouts = { ...prev };
      Object.keys(newLayouts).forEach((breakpoint: string) => {
        if (newLayouts[breakpoint]) {
          newLayouts[breakpoint] = newLayouts[breakpoint].filter((item: Layout) => item.i !== id);
        }
      });
      return newLayouts;
    });
  }, []);

  // Widget wrapper component - memoized with custom comparison to prevent unnecessary re-renders
  const WidgetWrapper = memo<WidgetWrapperProps>(
    ({ widget, children, onRemove }) => {
      return (
        <div className="h-full w-full border-black border-[1px] shadow-airq-dark shadow-card flex flex-col overflow-hidden">
          <div className="bg-airq-dark text-airq-light px-2 py-1 flex justify-between items-center border-b-[1px] border-airq-dark">
            <p className="h-[18px] text-xs font-semibold w-full align-baseline widget-drag-handle cursor-grab">{widget.title}</p>
            <div className="flex space-x-2">
              {/* <button
                onClick={() => openWidgetSettings(widget)}
                className="text-gray-300 hover:text-white focus:outline-none"
                title="Settings"
              >
                <span>⚙️  </span>
              </button> */}
              <button
                onClick={() => onRemove(widget.id)}
                className="text-airq-light hover:text-airq-light focus:outline-none"
                title="Remove"
              >
                <span>x</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      );
    },
    (prevProps, nextProps) => {
      // Only re-render if widget id or title changed
      // Children are always different but React will handle their memoization
      return prevProps.widget.id === nextProps.widget.id &&
             prevProps.widget.title === nextProps.widget.title;
    }
  );
  WidgetWrapper.displayName = 'WidgetWrapper';

  return (
    <div className="h-full w-full p-4 overflow-hidden">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1100, md: 900, sm: 768 }}
        cols={{ lg: 24, md: 16, sm: 12 }}
        rowHeight={55}
        margin={[8, 8]}
        onLayoutChange={handleLayoutChange}
        onDragStop={handleDragOrResizeStop}
        onResizeStop={handleDragOrResizeStop}
        isDraggable={true}
        isResizable={true}
        resizeHandles={['se']}
        draggableHandle=".widget-drag-handle"
        compactType="vertical"
        preventCollision={false}
      >
        {widgets.map(widget => (
          <div key={widget.id}>
            <WidgetWrapper widget={widget} onRemove={removeWidget}>
              <WidgetRenderer widget={widget} />
            </WidgetWrapper>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
});

DashboardCanvas.displayName = 'DashboardCanvas';

export default DashboardCanvas;