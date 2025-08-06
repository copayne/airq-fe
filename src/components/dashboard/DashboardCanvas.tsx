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
    SENSOR_CARD: 'SENSOR_CARD',
    TABLE: 'TABLE',
    TEMPERATURE_CHART: 'TEMPERATURE_CHART',
    CO2_CHART: 'CO2_CHART',
    HUMIDITY_CHART: 'HUMIDITY_CHART',
  }), []);

  // Dynamic widget component imports for code splitting - memoized
  const WIDGET_COMPONENTS = useMemo(() => ({
    [WIDGET_TYPES.SENSOR_CARD]: React.lazy(() => 
      import('./widgets/wrappers/SensorCardWrapper')
    ),
    [WIDGET_TYPES.TABLE]: React.lazy(() => 
      import('./widgets/wrappers/SensorReadingTableWrapper')
    ),
    // [WIDGET_TYPES.TEMPERATURE_CHART]: React.lazy(() => import('./widgets/charts/TemperatureChart')),
    // [WIDGET_TYPES.CO2_CHART]: React.lazy(() => import('./widgets/charts/CO2Chart')),
    // [WIDGET_TYPES.HUMIDITY_CHART]: React.lazy(() => import('./widgets/charts/HumidityChart')),
  }), [WIDGET_TYPES]);

  // Widget loading skeleton component
  const WidgetLoadingSkeleton: React.FC<{ type: string }> = ({ type }) => {
    const skeletonConfig = {
      [WIDGET_TYPES.SENSOR_CARD]: { 
        height: '200px', 
        content: (
          <>
            <div className="h-4 bg-gray-300 rounded mb-2 w-1/3"></div>
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="flex justify-between">
              <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/4"></div>
            </div>
          </>
        )
      },
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
  const defaultLayouts = {
    lg: [
      { i: 'widget-1', x: 0, y: 0, w: 2, h: 1, isResizable: false },
      { i: 'widget-2', x: 4, y: 0, w: 10, h: 6, minW: 4, minH: 4 },
      { i: 'widget-3', x: 0, y: 3, w: 6, h: 4, minW: 2, minH: 2 },
      { i: 'widget-4', x: 6, y: 3, w: 6, h: 4, minW: 2, minH: 2 },
    ],
    md: [
      { i: 'widget-1', x: 0, y: 0, w: 2, h: 1, isResizable: false },
      { i: 'widget-2', x: 4, y: 0, w: 8, h: 3, minW: 2, minH: 2 },
      { i: 'widget-3', x: 0, y: 3, w: 4, h: 4, minW: 2, minH: 2 },
      { i: 'widget-4', x: 4, y: 3, w: 4, h: 4, minW: 2, minH: 2 },
    ],
    sm: [
      { i: 'widget-1', x: 0, y: 0, w: 6, h: 1, isResizable: false },
      { i: 'widget-2', x: 0, y: 3, w: 12, h: 4, minW: 2, minH: 2 },
      { i: 'widget-3', x: 0, y: 6, w: 6, h: 4, minW: 2, minH: 2 },
      { i: 'widget-4', x: 0, y: 10, w: 6, h: 4, minW: 2, minH: 2 },
    ],
  };

  // Initial widgets data
  const initialWidgets = [
    { 
      id: 'widget-1',
      title: 'Sensor', 
      type: WIDGET_TYPES.SENSOR_CARD,
      config: { showOffline: true },
      props: {
        sensorId: "3",
      }
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
    // { 
    //   id: 'widget-3', 
    //   title: 'Temperature Trends', 
    //   type: WIDGET_TYPES.TEMPERATURE_CHART,
    //   config: { timeRange: '24h' }
    // },
    // { 
    //   id: 'widget-4', 
    //   title: 'CO2 Levels', 
    //   type: WIDGET_TYPES.CO2_CHART,
    //   config: { timeRange: '24h' }
    // },
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
      <div className="h-full w-full border-black border-[1px] shadow-default-dark shadow-card flex flex-col overflow-hidden">
        <div className="bg-default-dark text-default-textLight px-2 py-1 flex justify-between items-center border-b-[1px] border-default-dark">
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
              className="text-default-textLight hover:text-default-light focus:outline-none"
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

  console.log(layouts);
  console.log(widgets);

  return (
    <div className="h-full">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
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