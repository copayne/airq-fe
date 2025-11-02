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
  id: string;
  children: React.ReactNode;
}

// Dashboard component
const DashboardCanvas = memo(() => {
  // Get sensor data for dynamic sensor card widgets
  const { sensors } = useSensorData();

  // Widget types enum - memoized to prevent recreation
  const WIDGET_TYPES = useMemo(() => ({
    TABLE: 'TABLE',
    TEMPERATURE_CHART: 'TEMPERATURE_CHART',
    CO2_CHART: 'CO2_CHART',
    HUMIDITY_CHART: 'HUMIDITY_CHART',
    MULTI_METRIC_CHART: 'MULTI_METRIC_CHART',
    METRICS_CARD: 'METRICS_CARD',
    SENSOR_CARD: 'SENSOR_CARD',
    RING_SNAPSHOT: 'RING_SNAPSHOT',
  }), []);

  // Dynamic widget component imports for code splitting - memoized
  const WIDGET_COMPONENTS = useMemo(() => ({
    [WIDGET_TYPES.TABLE]: React.lazy(() =>
      import('./widgets/wrappers/SensorReadingTableWrapper')
    ),
    [WIDGET_TYPES.TEMPERATURE_CHART]: React.lazy(() => import('./widgets/wrappers/TemperatureChartWrapper')),
    [WIDGET_TYPES.CO2_CHART]: React.lazy(() => import('./widgets/wrappers/CO2ChartWrapper')),
    [WIDGET_TYPES.MULTI_METRIC_CHART]: React.lazy(() => import('./widgets/wrappers/MultiMetricChartWrapper')),
    [WIDGET_TYPES.METRICS_CARD]: React.lazy(() => import('./widgets/wrappers/MetricsCardWrapper')),
    [WIDGET_TYPES.SENSOR_CARD]: React.lazy(() => import('./widgets/wrappers/SensorCardWrapper')),
    [WIDGET_TYPES.RING_SNAPSHOT]: React.lazy(() => import('./widgets/wrappers/RingSnapshotWrapper')),
    // [WIDGET_TYPES.HUMIDITY_CHART]: React.lazy(() => import('./widgets/charts/HumidityChart')),
  }), [WIDGET_TYPES]);

  // Widget loading skeleton component
  const WidgetLoadingSkeleton: React.FC<{ type: string }> = ({ type }) => {
    const skeletonConfig = {
      [WIDGET_TYPES.TABLE]: { 
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

  // Widget renderer with error boundary and suspense
  const WidgetRenderer: React.FC<{ widget: Widget }> = ({ widget }) => {
    const WidgetComponent = WIDGET_COMPONENTS[widget.type as keyof typeof WIDGET_COMPONENTS];
    
    if (!WidgetComponent) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-50 border-2 border-red-200">
          <p className="text-red-600">Unknown widget type: {widget.type}</p>
        </div>
      );
    }
    
    return (
      <Suspense fallback={<WidgetLoadingSkeleton type={widget.type} />}>
        <WidgetComponent
          {...(widget.props ?? {} as Record<string, unknown>)}
        />
      </Suspense>
    );
  };

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
    const sensorCardLayouts = {
      lg: [] as Layout[],
      md: [] as Layout[],
      sm: [] as Layout[],
    };

    // Generate sensor card layouts (4 columns wide, 2 rows tall each on doubled grid)
    for (let i = 0; i < sensorCount; i++) {
      // lg: 24 columns, 6 sensors per row
      sensorCardLayouts.lg.push({
        i: `sensor-${i}`,
        x: (i % 6) * 4,
        y: Math.floor(i / 6) * 2,
        w: 4,
        h: 1,
        minW: 4,
        minH: 2,
      });

      // md: 16 columns, 4 sensors per row
      sensorCardLayouts.md.push({
        i: `sensor-${i}`,
        x: (i % 4) * 4,
        y: Math.floor(i / 4) * 2,
        w: 4,
        h: 1,
        minW: 4,
        minH: 2,
      });

      // sm: 12 columns, 2 sensors per row
      sensorCardLayouts.sm.push({
        i: `sensor-${i}`,
        x: (i % 2) * 6,
        y: Math.floor(i / 2) * 2,
        w: 6,
        h: 1,
        minW: 4,
        minH: 2,
      });
    }

    const sensorRowsMd = Math.ceil(sensorCount / 4) * 2;
    const sensorRowsSm = Math.ceil(sensorCount / 2) * 2;

    return {
      lg: [
        ...sensorCardLayouts.lg,
        // Metrics widget (left side, below sensor cards)
        { i: 'widget-1', x: 0, y: 2, w: 4, h: 4, isResizable: false },
        // CO2 chart (top-middle)
        { i: 'widget-3', x: 4, y: 0, w: 10, h: 5, minW: 6, minH: 4 },
        // Temperature chart (top-right)
        { i: 'widget-4', x: 14, y: 0, w: 10, h: 5, minW: 6, minH: 4 },
        // Latest readings table (bottom)
        { i: 'widget-2', x: 0, y: 6, w: 14, h: 6, minW: 8, minH: 4, maxH: 6 },
        // Ring snapshot (right side, below temperature chart)
        { i: 'widget-5', x: 14, y: 6, w: 10, h: 6, minW: 6, minH: 4 },
      ],
      md: [
        ...sensorCardLayouts.md,
        // Metrics widget
        { i: 'widget-1', x: 0, y: sensorRowsMd, w: 4, h: 4, isResizable: false },
        // CO2 chart
        { i: 'widget-3', x: 4, y: sensorRowsMd, w: 6, h: 5, minW: 4, minH: 4 },
        // Temperature chart
        { i: 'widget-4', x: 10, y: sensorRowsMd, w: 6, h: 5, minW: 4, minH: 4 },
        // Table
        { i: 'widget-2', x: 0, y: sensorRowsMd + 6, w: 12, h: 6, minW: 6, minH: 4, maxH: 6 },
        // Ring snapshot (below temperature chart)
        { i: 'widget-5', x: 8, y: sensorRowsMd + 6, w: 8, h: 6, minW: 6, minH: 4 },
      ],
      sm: [
        ...sensorCardLayouts.sm,
        // Metrics widget
        { i: 'widget-1', x: 0, y: sensorRowsSm, w: 12, h: 4, isResizable: false },
        // CO2 chart
        { i: 'widget-3', x: 0, y: sensorRowsSm + 4, w: 12, h: 5, minW: 8, minH: 4 },
        // Temperature chart
        { i: 'widget-4', x: 0, y: sensorRowsSm + 10, w: 12, h: 5, minW: 8, minH: 4 },
        // Table
        { i: 'widget-2', x: 0, y: sensorRowsSm + 16, w: 12, h: 6, minW: 8, minH: 4, maxH: 6 },
        // Ring snapshot (below table)
        { i: 'widget-5', x: 0, y: sensorRowsSm + 22, w: 12, h: 6, minW: 8, minH: 4 },
      ],
    };
  }, [sensors]);

  // Generate initial widgets dynamically based on sensors
  const generateInitialWidgets = useMemo(() => {
    const sensorWidgets: Widget[] = (sensors ?? []).map((sensor, index) => ({
      id: `sensor-${index}`,
      title: sensor.currentLocation.name.toLowerCase(),
      type: WIDGET_TYPES.SENSOR_CARD,
      config: {},
      props: {
        sensorId: sensor.id,
      },
    }));

    return [
      ...sensorWidgets,
      {
        id: 'widget-1',
        title: 'Metrics',
        type: WIDGET_TYPES.METRICS_CARD,
        config: {}
      },
      {
        id: 'widget-2',
        title: 'Latest Readings',
        type: WIDGET_TYPES.TABLE,
        config: { limit: 10 },
        props: {
          display: false,
        },
      },
      {
        id: 'widget-3',
        title: 'CO2 Trends',
        type: WIDGET_TYPES.CO2_CHART,
        config: { timeRange: '24h' }
      },
      {
        id: 'widget-4',
        title: 'Temperature Trends',
        type: WIDGET_TYPES.TEMPERATURE_CHART,
        config: { timeRange: '24h' }
      },
      {
        id: 'widget-5',
        title: 'Ring Camera',
        type: WIDGET_TYPES.RING_SNAPSHOT,
        config: {},
        props: {},
      },
    ];
  }, [sensors, WIDGET_TYPES]);

  // State
  const [layouts, setLayouts] = useState<Layouts>(generateDefaultLayouts);
  const [widgets, setWidgets] = useState<Widget[]>(generateInitialWidgets);

  // Update widgets and layouts when sensors change
  useEffect(() => {
    setWidgets(generateInitialWidgets);
    setLayouts(generateDefaultLayouts);
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
  const handleLayoutChange = useCallback((_currentLayout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
  }, []);

  // Remove a widget - memoized callback
  const removeWidget = useCallback((id: string) => {
    setWidgets(widgets.filter(widget => widget.id !== id));
    
    // Remove from layouts
    const newLayouts = { ...layouts };
    Object.keys(newLayouts).forEach((breakpoint: string) => {
      if (newLayouts[breakpoint]) {
        newLayouts[breakpoint] = newLayouts[breakpoint].filter((item: Layout) => item.i !== id);
      }
    });
    
    setLayouts(newLayouts);
  }, [widgets, layouts]);

  // Widget wrapper component
  const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ id, children }) => {
    const widget = widgets.find(w => w.id === id);
    
    if (!widget) return null;
    
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
              onClick={() => removeWidget(id)}
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
  };

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
        isDraggable={true}
        isResizable={true}
        resizeHandles={['se']}
        draggableHandle=".widget-drag-handle"
        compactType="vertical"
        preventCollision={false}
      >
        {widgets.map(widget => (
          <div key={widget.id}>
            <WidgetWrapper id={widget.id}>
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