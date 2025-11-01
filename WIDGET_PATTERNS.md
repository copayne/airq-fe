# AirQ Frontend - Widget Pattern Analysis

## Overview
The airq-fe is a **Next.js 14 + TypeScript + Tailwind CSS** dashboard built with the T3 Stack. It uses Apollo Client for GraphQL data fetching and react-grid-layout for a responsive, draggable widget system.

---

## 1. Directory Structure - Widget Locations

```
/src/components/dashboard/
├── AirQualityDashboard.tsx          # Main dashboard container
├── DashboardCanvas.tsx               # Grid layout engine with widget management
└── widgets/
    ├── cards/
    │   ├── SensorCard.tsx            # Individual sensor metric card
    │   └── SensorGrid.tsx            # Grid of SensorCards
    ├── charts/
    │   ├── TemperatureChart.tsx      # Single metric line chart
    │   ├── CO2Chart.tsx              # Single metric line chart
    │   └── MultiMetricChart.tsx      # Dual-axis chart (CO2 + Temp)
    ├── tables/
    │   └── SensorReadingTable.tsx    # Tanstack Table with sensor readings
    └── wrappers/
        ├── SensorCardWrapper.tsx
        ├── TemperatureChartWrapper.tsx
        ├── CO2ChartWrapper.tsx
        └── MultiMetricChartWrapper.tsx
```

### Key File Paths
- **Main Dashboard**: `/home/copayne/dev/airq/airq-fe/src/components/dashboard/`
- **Widgets**: `/home/copayne/dev/airq/airq-fe/src/components/dashboard/widgets/`
- **Hooks**: `/home/copayne/dev/airq/airq-fe/src/hooks/`
- **GraphQL Queries**: `/home/copayne/dev/airq/airq-fe/src/graphql/`

---

## 2. Existing Widgets - Types & Examples

### A. Sensor Cards (`SensorCard.tsx`)
**Purpose**: Display latest sensor reading with status indicator

**Features**:
- Status indicator (green=online, red=offline)
- Last reading timestamp
- Color-coded metric display (green/yellow/red based on thresholds)
- Three metrics in footer: CO2 PPM, Temperature (F/C), Humidity %

**Code Example** - `/home/copayne/dev/airq/airq-fe/src/components/dashboard/widgets/cards/SensorCard.tsx`:
```tsx
const SensorCard: React.FC<SensorCardProps> = memo(({ sensorId }) => {
  const { sensors } = useSensorData();
  const sensor = useMemo(() => sensors?.find(s => s.id === sensorId), [sensorId, sensors]);

  return !!sensor && (
    <div className="h-full w-full border-black border-[1px] shadow-airq-dark shadow-card flex flex-col overflow-hidden">
      {/* Header with ID and status */}
      <div className="bg-airq-dark text-airq-light px-2 py-1 flex justify-between items-center border-b-[1px] border-airq-dark">
        <div className="text-xs underline">id#{sensor.id}</div>
        <StatusIndicator isActive={isActive ?? false} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col justify-between h-full bg-airq-light">
          <div className="py-2 px-2">
            <h3 className="text-lg font-medium text-airq-dark">{currentLocation}</h3>
          </div>
          
          {/* Footer with metrics */}
          <div className="flex justify-evenly border-t-[1px] border-airq-dark">
            {/* CO2 section with dynamic background color */}
            <div className={`rounded-bl-sm flex justify-center items-center flex-grow 
              ${co2 <= 800 ? 'bg-airq-primary text-airq-light' : ''} 
              ${(co2 > 800 && co2 < 1000) ? 'bg-airq-secondary text-airq-dark' : ''} 
              ${co2 >= 1000 ? 'bg-airq-tertiary' : ''}`}>
              <p className="text-md">{co2}ppm</p>
            </div>
            {/* Similar dividers and sections for temp and humidity */}
          </div>
        </div>
      </div>
    </div>
  )
});
```

### B. Charts - MultiMetricChart (`MultiMetricChart.tsx`)
**Purpose**: Visualize trends over time with dual-axis support

**Features**:
- Dual Y-axis (CO2 and Temperature)
- Time-series X-axis using chartjs-adapter-date-fns
- Interactive legend
- Responsive sizing
- Loading/error states

**Code Example** - `/home/copayne/dev/airq/airq-fe/src/components/dashboard/widgets/charts/MultiMetricChart.tsx`:
```tsx
const MultiMetricChart: React.FC = memo(() => {
  const { sensorReadings, loading, error } = useSensorReadingData();

  const chartData = useMemo(() => {
    const sortedReadings = sensorReadings
      .filter(reading => 
        reading.co2Reading?.co2Ppm != null || 
        reading.temperatureReading?.temperatureCelsius != null
      )
      .sort((a, b) => new Date(`${a.readingTime}Z`).getTime() - new Date(`${b.readingTime}Z`).getTime());

    return {
      datasets: [
        {
          label: 'CO2 (PPM)',
          data: co2Data,
          borderColor: '#137547',     // airq-primary
          backgroundColor: 'rgba(19, 117, 71, 0.1)',
          yAxisID: 'yCO2',
          tension: 0.1,
          pointRadius: 2,
          pointHoverRadius: 4,
        },
        {
          label: 'Temperature (°F)',
          data: temperatureData,
          borderColor: '#2E2EAB',     // airq-contrast
          backgroundColor: 'rgba(46, 46, 171, 0.1)',
          yAxisID: 'yTemp',
          tension: 0.1,
        }
      ]
    };
  }, [sensorReadings]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'hour' as const,
          displayFormats: { hour: 'MMM d, h:mm a' },
        }
      },
      yCO2: { yAxisID: 'yCO2', position: 'left' },
      yTemp: { yAxisID: 'yTemp', position: 'right' }
    }
  }), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return <div className="h-full p-4"><Line data={chartData} options={options} /></div>;
});
```

### C. Data Tables (`SensorReadingTable.tsx`)
**Purpose**: Display tabular sensor readings with sortable columns

**Features**:
- Tanstack Table for column management
- Striped rows with alternating backgrounds
- Sticky headers
- Time/date formatting
- Sortable columns

**Code Example** - Key styling patterns:
```tsx
<table className="w-full">
  <thead>
    {headerGroup.headers.map(header => (
      <th key={header.id} className="sticky top-0 bg-airq-background text-airq-dark p-2 text-left text-sm">
        {/* header content */}
      </th>
    ))}
  </thead>
  <tbody>
    {rows.map((row, i) => (
      <tr key={row.id} className={`${i % 2 ? 'bg-airq-background/20' : 'bg-airq-light'}`}>
        {/* cells */}
      </tr>
    ))}
  </tbody>
</table>
```

---

## 3. Component Structure & Patterns

### Architecture Pattern
**Wrapper + Component Pattern** (Clean separation of concerns):

```
Widget Wrapper (props input layer)
    ↓
Widget Component (data fetching & logic)
    ↓
Presentation Component (pure JSX/styling)
```

**Example Flow**:
```
MultiMetricChartWrapper.tsx (accepts props)
    ↓
MultiMetricChart.tsx (uses useSensorReadingData hook)
    ↓
<Line /> component from react-chartjs-2 (presentation)
```

### Hooks Used - Data Fetching
| Hook | Purpose | Returns |
|------|---------|---------|
| `useSensorData()` | Get list of sensors with last reading | `{ sensors, loading, error }` |
| `useSensorReadingData()` | Get filtered sensor readings | `{ sensorReadings, loading, error, criteria, updateCriteria }` |

**Example Hook - `/home/copayne/dev/airq/airq-fe/src/hooks/useSensorReadingData.ts`**:
```tsx
export const useSensorReadingData = () => {
  const { state, updateCriteria, updateIsFetched } = useSensorDataContext();
  const queryVariables = useMemo(() => ({
    input: {
      startDate: criteria.startDate,
      endDate: criteria.endDate,
      minCo2Ppm: criteria.minCO2,
      maxCo2Ppm: criteria.maxCO2,
      // ... other filters
    }
  }), [criteria]);

  const { loading, error, data, refetch } = useQuery(GET_FILTERED_SENSOR_READINGS, {
    variables: queryVariables,
    fetchPolicy: 'cache-first',
    pollInterval: env.NEXT_PUBLIC_POLL_INTERVAL_MS,
  });

  return useMemo(() => ({
    sensorReadings: data?.filteredSensorReadings,
    loading,
    error,
    criteria,
    updateCriteria: updateCriteriaAndRefetch,
  }), [/* dependencies */]);
};
```

### Component Types
- **Functional Components**: All components use `React.FC` type
- **Memoization**: Heavy use of `React.memo()` for performance
- **Hooks**: 
  - `useMemo()` for expensive calculations (charts, data transformations)
  - `useCallback()` for event handlers (layout changes, widget removal)
  - `useEffect()` for side effects (localStorage persistence)
  - Custom hooks for data fetching

---

## 4. Styling Approach - Tailwind CSS Only

### Theme Colors (from `/home/copayne/dev/airq/airq-fe/tailwind.config.ts`)

```ts
colors: {
  'airq': {
    'background': '#999',        // Gray for alternating rows
    'dark': '#28262C',           // Dark navy (headers/borders)
    'light': '#F3F4FF',          // Light lavender (backgrounds)
    'primary': '#137547',        // Green (good values)
    'secondary': '#FFC914',      // Yellow (warning)
    'tertiary': '#ED4C4C',       // Red (critical)
    'contrast': '#2E2EAB',       // Blue (charts/accents)
  },
}
```

### Styling Patterns

**Border & Shadow Pattern**:
```tsx
className="h-full w-full border-black border-[1px] shadow-airq-dark shadow-card flex flex-col overflow-hidden"
```

**Header Styling** (Dark background with light text):
```tsx
className="bg-airq-dark text-airq-light px-2 py-1 flex justify-between items-center border-b-[1px] border-airq-dark"
```

**Metric Display with Dynamic Colors**:
```tsx
className={`rounded-bl-sm flex justify-center items-center flex-grow 
  ${co2 <= 800 ? 'bg-airq-primary text-airq-light' : ''} 
  ${(co2 > 800 && co2 < 1000) ? 'bg-airq-secondary text-airq-dark' : ''} 
  ${co2 >= 1000 ? 'bg-airq-tertiary' : ''}`}
```

**Striped Table Rows**:
```tsx
className={`${i % 2 ? 'bg-airq-background/20' : 'bg-airq-light'}`}
```

### Custom Utilities in Tailwind
```ts
boxShadow: {
  'card': '3px 3px 0 0 rgba(0, 0, 0, 1)',  // Retro card shadow
},
height: {
  'full-no-header': 'calc(100vh - 64px)',  // Dashboard height
}
```

---

## 5. Backend Data Integration

### GraphQL Query Structure
**Example - `/home/copayne/dev/airq/airq-fe/src/graphql/SensorReading.ts`**:
```ts
export const GET_FILTERED_SENSOR_READINGS = gql`
  query GetFilteredSensorReadings($input: SensorDataFilterInput!) {
    filteredSensorReadings(filters: $input) {
      ...SensorReadingComplete
    }
  }
  ${SENSOR_READING_COMPLETE_FRAGMENT}
`;
```

### Data Flow
1. **Component mounts** → Calls Apollo query hook
2. **Query executes** → Fetches from `/graphql` endpoint
3. **Data transforms** → useMemo calculates display values
4. **Renders** → Displays with Tailwind styles

### Apollo Client Configuration
- **Endpoint**: `http://10.201.1.115:5000/graphql`
- **Cache Policy**: `cache-first` (efficient for dashboards)
- **Poll Interval**: Configurable via `NEXT_PUBLIC_POLL_INTERVAL_MS` env
- **Error Policy**: `all` (show partial data on errors)

---

## 6. Visual Patterns & Design System

### Card Style (Universal Widget Container)
Every widget wrapped in consistent card style:

```tsx
// From DashboardCanvas.tsx WidgetWrapper
<div className="h-full w-full border-black border-[1px] shadow-airq-dark shadow-card flex flex-col overflow-hidden">
  {/* Dark header with title and controls */}
  <div className="bg-airq-dark text-airq-light px-2 py-1 flex justify-between items-center border-b-[1px] border-airq-dark">
    <p className="text-xs font-semibold cursor-grab">{widget.title}</p>
    <button onClick={() => removeWidget(id)}>x</button>
  </div>
  
  {/* Scrollable content area */}
  <div className="flex-1 overflow-auto">
    {children}
  </div>
</div>
```

### Status Indicators
```tsx
const StatusIndicator = ({ isActive }: { isActive: boolean }) => (
  <div 
    className={`w-[10px] h-[10px] rounded-full mr-3 relative border-airq-dark border-[1px] 
      ${isActive ? 'bg-airq-primary' : 'bg-airq-tertiary'}`}
    title={isActive ? 'online' : 'offline'}
  />
);
```

### Typography
- Headers: `text-lg font-medium`
- Data: `text-md` (metrics), `text-xs` (labels)
- Table headers: `text-sm`, sticky positioning

### Loading States
All widgets show **spinner while loading**:
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-airq-contrast"></div>
```

### Error States
```tsx
<div className="h-full flex items-center justify-center text-airq-tertiary">
  Error loading {metric} data
</div>
```

---

## 7. How Metrics/Numbers Are Displayed

### Current Patterns

#### 1. **SensorCard - Three-column metric footer**
```tsx
// CO2 value with status color
<div className={`flex justify-center items-center flex-grow 
  ${co2 <= 800 ? 'bg-airq-primary text-airq-light' : ''} 
  ${(co2 > 800 && co2 < 1000) ? 'bg-airq-secondary text-airq-dark' : ''} 
  ${co2 >= 1000 ? 'bg-airq-tertiary' : ''}`}>
  <p className="text-md">{co2}ppm</p>
</div>
```

**Color Thresholds**:
- CO2: Green ≤800, Yellow 800-1000, Red ≥1000
- Temp: Green 20-27C, Yellow 18-20/27-30C, Red <18/>30C
- Humidity: Green 30-60%, Yellow 25-30/60-70%, Red <25/>70%

#### 2. **Charts - Line with dual Y-axis**
Multiple metrics on same chart with separate axes:
```tsx
{
  label: 'CO2 (PPM)',
  borderColor: '#137547',      // airq-primary green
  yAxisID: 'yCO2',
},
{
  label: 'Temperature (°F)',
  borderColor: '#2E2EAB',      // airq-contrast blue
  yAxisID: 'yTemp',
}
```

#### 3. **Table - Formatted with precision**
```tsx
co2Ppm: reading.co2Reading.co2Ppm.toFixed(0),           // 0 decimals
temperatureFahrenheit: ((temp * 9/5) + 32).toFixed(1),  // 1 decimal
humidityPercentage: reading.humidityReading.humidityPercentage.toFixed(0)
```

---

## 8. Grid Layout System

**Framework**: `react-grid-layout` with responsive breakpoints

**Configuration** - `/home/copayne/dev/airq/airq-fe/src/components/dashboard/DashboardCanvas.tsx`:
```tsx
const defaultLayouts = {
  // Large screens (1100px+, 12 columns)
  lg: [
    { i: 'widget-2', x: 0, y: 0, w: 6, h: 4 },  // Table left
    { i: 'widget-3', x: 6, y: 0, w: 6, h: 4 },  // Chart right
  ],
  // Medium screens (900px-1099px, 8 columns)
  md: [
    { i: 'widget-2', x: 0, y: 0, w: 4, h: 4 },
    { i: 'widget-3', x: 4, y: 0, w: 4, h: 4 },
  ],
  // Small screens (768px-899px, 6 columns)
  sm: [
    { i: 'widget-3', x: 0, y: 0, w: 6, h: 3 },  // Chart first
    { i: 'widget-2', x: 0, y: 3, w: 6, h: 4 },  // Table second
  ],
};

<ResponsiveGridLayout
  breakpoints={{ lg: 1100, md: 900, sm: 768 }}
  cols={{ lg: 12, md: 8, sm: 6 }}
  rowHeight={150}
  margin={[16, 16]}
  isDraggable={true}
  isResizable={true}
  resizeHandles={['se']}
/>
```

---

## Summary - Key Patterns to Match

When creating a new metrics widget, follow these patterns:

### Must-Have
1. **Wrapper component** in `/widgets/wrappers/` for prop handling
2. **Main component** using custom hook for data fetching
3. **Card styling** with dark header + light content
4. **Loading/Error states** with spinner and error message
5. **Tailwind only** - no CSS modules or styled-components
6. **Memo wrapped** - performance optimization

### Styling
- Dark headers: `bg-airq-dark text-airq-light`
- Content background: `bg-airq-light`
- Borders: `border-black border-[1px]`
- Shadow: `shadow-card shadow-airq-dark`
- Color thresholds for metrics (green/yellow/red)

### Data Fetching
- Use `useSensorReadingData()` or `useSensorData()`
- Return `{ data, loading, error, updateCriteria }`
- Use Apollo's `useQuery` with `cache-first` policy

### Responsive
- Use Tailwind breakpoints (md:, lg:)
- Grid layout automatically handles sizing
- Make components full height/width within grid item
