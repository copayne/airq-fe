// Dashboard.tsx
import React, { Suspense, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Responsive, WidthProvider, type Layout, type Layouts } from 'react-grid-layout';
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
  // Widget types enum - memoized to prevent recreation
  const WIDGET_TYPES = useMemo(() => ({
    TABLE: 'TABLE',
    TEMPERATURE_CHART: 'TEMPERATURE_CHART',
    CO2_CHART: 'CO2_CHART',
    HUMIDITY_CHART: 'HUMIDITY_CHART',
    MULTI_METRIC_CHART: 'MULTI_METRIC_CHART',
    METRICS_CARD: 'METRICS_CARD',
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

  // RESPONSIVE SQUARE LAYOUT - Table and chart positioned optimally for each screen size
  const defaultLayouts = {
    // Large screens (1100px+, 12 columns) - Side-by-side square widgets
    lg: [
      // Metrics widget - top full width (2 rows tall)
      { i: 'widget-1', x: 0, y: 0, w: 2, h: 2, isResizable: false },
      // Latest readings table - left square (perfect square ratio)
      { i: 'widget-2', x: 0, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
      // CO2 & Temperature chart - right square (perfect square ratio)
      { i: 'widget-3', x: 6, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
    ],

    // Medium screens (900px-1099px, 8 columns) - Side-by-side square widgets
    md: [
      // Metrics widget - top full width (2 rows tall)
      { i: 'widget-1', x: 0, y: 0, w: 2, h: 2, minW: 4, minH: 2, isResizable: false },
      // Table - left square (perfect square ratio)
      { i: 'widget-2', x: 0, y: 2, w: 4, h: 4, minW: 3, minH: 3 },
      // Chart - right square (perfect square ratio)
      { i: 'widget-3', x: 4, y: 2, w: 4, h: 4, minW: 3, minH: 3 },
    ],

    // Small screens (768px-899px, 6 columns) - Vertical stacking
    sm: [
      // Metrics widget - top full width (2 rows tall)
      { i: 'widget-1', x: 0, y: 0, w: 2, h: 2, minW: 4, minH: 2, isResizable: false },
      // Chart first on mobile for quick trend viewing (wider, less tall)
      { i: 'widget-3', x: 0, y: 2, w: 6, h: 3, minW: 4, minH: 2 },
      // Table below on mobile (wider, accommodates more data)
      { i: 'widget-2', x: 0, y: 5, w: 6, h: 4, minW: 4, minH: 3 },
    ],
  };

  // Initial widgets data
  const initialWidgets = [
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
      title: 'CO2 & Temperature Trends',
      type: WIDGET_TYPES.MULTI_METRIC_CHART,
      config: { timeRange: '24h' }
    },
  ];

  // State
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);

  // Load saved layouts on component mount
  useEffect(() => {
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    const savedWidgets = localStorage.getItem('dashboard-widgets');
    
    if (savedLayouts) {
      try {
        setLayouts(JSON.parse(savedLayouts) as Layouts);
      } catch (e) {
        console.error('Error loading saved layouts:', e);
      }
    }
    
    if (savedWidgets) {
      try {
        setWidgets(JSON.parse(savedWidgets) as Widget[]);
      } catch (e) {
        console.error('Error loading saved widgets:', e);
      }
    }
  }, []);

  // Save layouts and widgets when they change
  useEffect(() => {
    localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
  }, [layouts]);
  
  useEffect(() => {
    localStorage.setItem('dashboard-widgets', JSON.stringify(widgets));
  }, [widgets]);

  // Handle layout change - memoized callback
  const handleLayoutChange = useCallback((currentLayout: Layout[], allLayouts: Layouts) => {
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
    <div className="flex-1 h-full p-4">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1100, md: 900, sm: 768 }}
        cols={{ lg: 12, md: 8, sm: 6 }}
        rowHeight={150}
        margin={[16, 16]}
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        resizeHandles={['se']}
        draggableHandle=".widget-drag-handle"
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