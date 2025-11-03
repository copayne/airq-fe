// Dashboard.tsx
import React, { Suspense, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Responsive, WidthProvider, type Layout, type Layouts } from 'react-grid-layout';
import { useSensorData } from '~/hooks/useSensorData';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

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
  // Get sensor data for dynamic sensor card widgets
  const { sensors } = useSensorData();

  // Widget components with lazy loading - consolidated for simplicity
  const WIDGETS = useMemo(() => ({
    TABLE: React.lazy(() => import('./widgets/tables/SensorReadingTable')),
    TEMPERATURE_CHART: React.lazy(() => import('./widgets/charts/TemperatureChart')),
    CO2_CHART: React.lazy(() => import('./widgets/charts/CO2Chart')),
    MULTI_METRIC_CHART: React.lazy(() => import('./widgets/charts/MultiMetricChart')),
    METRICS_CARD: React.lazy(() => import('./widgets/cards/MetricsCard')),
    SENSOR_CARD: React.lazy(() => import('./widgets/cards/SensorCard')),
    RING_SNAPSHOT: React.lazy(() => import('./widgets/cards/RingSnapshotCard')),
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
  const WidgetRenderer = memo<{ widget: Widget }>(({ widget }) => {
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
  });
  WidgetRenderer.displayName = 'WidgetRenderer';

  // Default layouts for different breakpoints
  
  // BACKUP - Original layouts (commented for potential revert)
  // const originalLayouts = {
  //   lg: [
  //     { i: 'widget-1', x: 0, y: 0, w: 2, h: 1, isResizable: false },
  //     { i: 'widget-2', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 1 },
  //     { i: 'widget-3', x: 0, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
  //   ],
  //   md: [
  //     { i: 'widget-1', x: 0, y: 0, w: 2, h: 1, isResizable: false },
  //     { i: 'widget-2', x: 4, y: 0, w: 3, h: 2, minW: 2, minH: 1 },
  //     { i: 'widget-3', x: 0, y: 2, w: 8, h: 4, minW: 4, minH: 3 },
  //   ],
  //   sm: [
  //     { i: 'widget-1', x: 0, y: 0, w: 2, h: 1, isResizable: false },
  //     { i: 'widget-2', x: 0, y: 2, w: 6, h: 4, minW: 2, minH: 1 },
  //     { i: 'widget-3', x: 0, y: 6, w: 6, h: 4, minW: 4, minH: 3 },
  //   ],
  // };

  // Generate layouts dynamically based on sensors
  const generateDefaultLayouts = useMemo(() => {
    const sensorCount = sensors?.length ?? 0;

    // Generate sensor layouts dynamically
    const sensorLayoutsLg = [];
    const sensorLayoutsMd = [];
    const sensorLayoutsSm = [];

    for (let i = 0; i < sensorCount; i++) {
      // lg: 24 columns, 6 sensors per row (4 columns each)
      sensorLayoutsLg.push({
        i: `sensor-${i}`,
        x: (i % 6) * 4,
        y: Math.floor(i / 6) * 2,
        w: 4,
        h: 1,
        minW: 4,
        minH: 2,
      });

      // md: 16 columns, 4 sensors per row (4 columns each)
      sensorLayoutsMd.push({
        i: `sensor-${i}`,
        x: (i % 4) * 4,
        y: Math.floor(i / 4) * 2,
        w: 4,
        h: 1,
        minW: 4,
        minH: 2,
      });

      // sm: 12 columns, 2 sensors per row (6 columns each)
      sensorLayoutsSm.push({
        i: `sensor-${i}`,
        x: (i % 2) * 6,
        y: Math.floor(i / 2) * 2,
        w: 6,
        h: 1,
        minW: 6,
        minH: 2,
      });
    }

    const sensorRowsLg = Math.ceil(sensorCount / 6) * 2;
    const sensorRowsMd = Math.ceil(sensorCount / 4) * 2;
    const sensorRowsSm = Math.ceil(sensorCount / 2) * 2;

    return {
        lg: [
        ...sensorLayoutsLg,
        // Metrics widget (left side, below sensor cards)
        { i: 'widget-1', x: 0, y: sensorRowsLg, w: 4, h: 4, isResizable: false },
        // CO2 chart (top-middle, below sensor cards)
        { i: 'widget-3', x: 4, y: sensorRowsLg, w: 10, h: 5, minW: 6, minH: 4 },
        // Temperature chart (top-right, below sensor cards)
        { i: 'widget-4', x: 14, y: sensorRowsLg, w: 10, h: 5, minW: 6, minH: 4 },
        // Latest readings table (bottom)
        { i: 'widget-2', x: 0, y: sensorRowsLg + 6, w: 14, h: 7, minW: 8, minH: 4 },
        // Ring snapshot (right side, below temperature chart)
        { i: 'widget-5', x: 14, y: sensorRowsLg + 6, w: 10, h: 7, minW: 6, minH: 4 },
      ],
      md: [
        ...sensorLayoutsMd,
        // Metrics widget
        { i: 'widget-1', x: 0, y: sensorRowsMd, w: 4, h: 4, isResizable: false },
        // CO2 chart
        { i: 'widget-3', x: 4, y: sensorRowsMd, w: 6, h: 5, minW: 4, minH: 4 },
        // Temperature chart
        { i: 'widget-4', x: 10, y: sensorRowsMd, w: 6, h: 5, minW: 4, minH: 4 },
        // Table
        { i: 'widget-2', x: 0, y: sensorRowsMd + 6, w: 12, h: 7, minW: 6, minH: 4 },
        // Ring snapshot (below temperature chart)
        { i: 'widget-5', x: 8, y: sensorRowsMd + 6, w: 8, h: 7, minW: 6, minH: 4 },
      ],
      sm: [
        ...sensorLayoutsSm,
        // Metrics widget
        { i: 'widget-1', x: 0, y: sensorRowsSm, w: 12, h: 4, isResizable: false },
        // CO2 chart
        { i: 'widget-3', x: 0, y: sensorRowsSm + 4, w: 12, h: 5, minW: 8, minH: 4 },
        // Temperature chart
        { i: 'widget-4', x: 0, y: sensorRowsSm + 10, w: 12, h: 5, minW: 8, minH: 4 },
        // Table
        { i: 'widget-2', x: 0, y: sensorRowsSm + 16, w: 12, h: 7, minW: 8, minH: 4 },
        // Ring snapshot (below table)
        { i: 'widget-5', x: 0, y: sensorRowsSm + 22, w: 12, h: 7, minW: 8, minH: 4 },
      ],
    };
  }, [sensors]);

  // Generate initial widgets dynamically based on sensors
  const generateInitialWidgets = useMemo(() => {
    const sensorWidgets: Widget[] = (sensors ?? []).map((sensor, index) => ({
      id: `sensor-${index}`,
      title: sensor.currentLocation.name.toLowerCase(),
      type: 'SENSOR_CARD',
      config: {},
      props: {
        sensor: sensor,
      },
    }));

    return [
      ...sensorWidgets,
      {
        id: 'widget-1',
        title: 'Metrics',
        type: 'METRICS_CARD',
        config: {}
      },
      {
        id: 'widget-2',
        title: 'Latest Readings',
        type: 'TABLE',
        config: { limit: 10 },
        props: {
          display: false,
        },
      },
      {
        id: 'widget-3',
        title: 'CO2 Trends',
        type: 'CO2_CHART',
        config: { timeRange: '24h' }
      },
      {
        id: 'widget-4',
        title: 'Temperature Trends',
        type: 'TEMPERATURE_CHART',
        config: { timeRange: '24h' }
      },
      {
        id: 'widget-5',
        title: 'Ring Camera',
        type: 'RING_SNAPSHOT',
        config: {},
        props: {},
      },
    ];
  }, [sensors]);

  // State
  const [layouts, setLayouts] = useState<Layouts>(generateDefaultLayouts);
  const [widgets, setWidgets] = useState<Widget[]>(generateInitialWidgets);

  // Update widgets when sensors change, and merge new sensor layouts
  useEffect(() => {
    setWidgets(generateInitialWidgets);

    // Merge new sensor layouts with existing layouts, preserving user customizations
    setLayouts(prev => {
      const newLayouts = { ...prev };
      const newDefaultLayouts = generateDefaultLayouts;

      // For each breakpoint, merge new sensor widget layouts
      (['lg', 'md', 'sm'] as const).forEach(breakpoint => {
        const existingLayouts = newLayouts[breakpoint] ?? [];
        const newSensorLayouts = (newDefaultLayouts[breakpoint] ?? []).filter((layout: Layout) =>
          layout.i.startsWith('sensor-')
        );

        // Keep existing layouts for widgets that still exist
        const existingNonSensorLayouts = existingLayouts.filter((layout: Layout) =>
          !layout.i.startsWith('sensor-')
        );

        // For sensor widgets, use existing layout if it exists, otherwise use default
        const mergedSensorLayouts = newSensorLayouts.map((newLayout: Layout) => {
          const existing = existingLayouts.find((l: Layout) => l.i === newLayout.i);
          return existing ?? newLayout;
        });

        newLayouts[breakpoint] = [...mergedSensorLayouts, ...existingNonSensorLayouts];
      });

      return newLayouts;
    });
  }, [generateInitialWidgets, generateDefaultLayouts]);

  // Load saved layouts on component mount (disabled to use dynamic layouts)
  // useEffect(() => {
  //   const savedLayouts = localStorage.getItem('dashboard-layouts');
  //   const savedWidgets = localStorage.getItem('dashboard-widgets');
  //
  //   if (savedLayouts) {
  //     try {
  //       setLayouts(JSON.parse(savedLayouts) as Layouts);
  //     } catch (e) {
  //       console.error('Error loading saved layouts:', e);
  //     }
  //   }
  //
  //   if (savedWidgets) {
  //     try {
  //       setWidgets(JSON.parse(savedWidgets) as Widget[]);
  //     } catch (e) {
  //       console.error('Error loading saved widgets:', e);
  //     }
  //   }
  // }, []);

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
          <div className="flex-1 overflow-auto">
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
    <div className="flex-1 p-4 overflow-auto">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1100, md: 900, sm: 768 }}
        cols={{ lg: 24, md: 16, sm: 12 }}
        rowHeight={75}
        margin={[16, 16]}
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