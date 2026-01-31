# Hudson Air Quality Dashboard - Working Plan

## Project Status Overview

The Hudson Air Quality Dashboard is a production-ready React/Next.js application with a solid foundation. This working plan focuses on practical improvements and completion of essential features, avoiding overengineered solutions.

---

## ✅ COMPLETED PHASES

### Phase 1-3: Core Infrastructure ✅ COMPLETED
- **Next.js 14 Framework**: Production-ready with TypeScript
- **Apollo Client**: Sophisticated GraphQL caching and error handling
- **Component Architecture**: Well-structured widget system with lazy loading
- **Performance Optimizations**: Bundle reduced to 169KB, code splitting implemented
- **Data Layer**: Advanced hooks, context management, and type safety
- **Basic Dashboard**: Sensor cards, data tables, responsive grid layout

---

## 🔧 IMMEDIATE FIXES REQUIRED

### Critical Issues ⚠️ HIGH PRIORITY
1. **CSS Syntax Error** - Line 7 in `src/styles/globals.css` has invalid CSS that breaks builds
2. **Bundle Analysis Setup** - Verify build tools are working correctly

---

## 📊 PHASE 4: Data Visualization (NEXT PRIORITY)

### 4.1 Essential Chart Components
**Goal**: Complete the commenting-out chart widgets to provide basic trend visualization

**Implementation**:
- ✅ Chart infrastructure exists (commented out components)
- [ ] **IN PROGRESS**: Uncomment and implement `TemperatureChart` widget
- [ ] **PENDING**: Implement `CO2Chart` widget  
- [ ] **PENDING**: Implement `HumidityChart` widget

**Technical Approach**:
- Use Chart.js or Recharts (lightweight, proven)
- Simple time-series line charts
- Real-time data updates via existing Apollo hooks
- Responsive design with existing grid system

**Success Criteria**:
- Charts display current sensor data trends
- Real-time updates work with polling system
- Mobile responsive
- Performance impact < 50KB bundle increase

### 4.2 Practical Alert System
**Goal**: Simple threshold-based alerts without complex notification infrastructure

**Implementation**:
- [ ] **PENDING**: Visual alert indicators in sensor cards
- [ ] **PENDING**: Browser notification API integration
- [ ] **PENDING**: Local storage for alert preferences

**Technical Approach**:
- Extend existing `SensorCard` components
- Use browser notifications (no server-side infrastructure needed)
- Simple threshold checks in existing data hooks
- Local storage for persistence

---

## 🛠️ PHASE 5: User Experience and Authentication (FUTURE)

### 5.1 User Authentication System
**Goal**: JWT-based authentication to integrate with backend authentication

**Implementation**:
- [ ] **PENDING**: JWT token management and storage
- [ ] **PENDING**: Login/logout functionality
- [ ] **PENDING**: Protected route handling
- [ ] **PENDING**: Token refresh mechanism
- [ ] **PENDING**: User session management

**Technical Approach**:
- NextAuth.js or custom JWT implementation
- Token storage (httpOnly cookies or secure localStorage)
- Apollo Client authentication headers
- Route protection with Next.js middleware
- Integration with existing context system

### 5.2 Dashboard Customization
**Goal**: Basic widget management without complex personalization

**Implementation**:
- [ ] **PENDING**: Add/remove widgets from dashboard
- [ ] **PENDING**: Save/load dashboard layouts (user-specific when auth is ready)
- [ ] **PENDING**: Widget configuration panels

**Technical Approach**:
- Extend existing `react-grid-layout` implementation
- Local storage initially, backend storage after auth implementation
- Simple widget configuration modals

### 5.3 Basic Data Export
**Goal**: Simple export functionality for compliance needs

**Implementation**:
- [ ] **PENDING**: CSV export for sensor readings
- [ ] **PENDING**: PDF reports for compliance
- [ ] **PENDING**: Date range filtering for exports

---

## 📈 PHASE 6: Advanced Features (LOW PRIORITY)

### 6.1 Advanced Reporting System
**Goal**: Comprehensive reporting capabilities for compliance and analysis

**Implementation**:
- [ ] **PENDING**: Scheduled report generation
- [ ] **PENDING**: Custom report templates
- [ ] **PENDING**: Automated compliance reports
- [ ] **PENDING**: Historical trend analysis reports
- [ ] **PENDING**: Multi-format exports (PDF, Excel, CSV)

**Technical Approach**:
- Report builder interface
- Template system for different report types
- Integration with charting for visual reports
- Scheduling system for automated reports

### 6.2 Advanced Filtering and Search
**Goal**: Enhanced data exploration beyond basic context filtering

**Implementation**:
- [ ] **PENDING**: Advanced date range filtering with presets
- [ ] **PENDING**: Multi-sensor comparison tools
- [ ] **PENDING**: Location-based filtering and grouping
- [ ] **PENDING**: Saved filter configurations
- [ ] **PENDING**: Advanced search functionality

**Technical Approach**:
- Enhanced filter UI components
- URL-based filter persistence
- Saved filter backend integration
- Complex query building interface

---

## 🚀 PHASE 7: Production Readiness (FUTURE)

### 7.1 Testing and Quality Assurance
**Goal**: Ensure production stability

**Implementation**:
- [ ] **PENDING**: Unit tests for critical components
- [ ] **PENDING**: Integration tests for data flows
- [ ] **PENDING**: E2E tests for dashboard functionality
- [ ] **PENDING**: Authentication flow testing

### 7.2 Performance Monitoring
**Goal**: Maintain performance standards

**Implementation**:
- [ ] **PENDING**: Performance monitoring setup
- [ ] **PENDING**: Bundle size tracking
- [ ] **PENDING**: Core Web Vitals monitoring
- [ ] **PENDING**: Authentication performance tracking

---

## 🎛️ PHASE 8: Control Panel & Settings 🚧 HIGH PRIORITY
*Timeline: 1-2 weeks*

### 8.1 Control Panel Navigation & Layout
**Goal**: Add settings/control panel area accessible from header

**Implementation**:
- [ ] **PENDING**: Add "Settings" link to Header component
- [ ] **PENDING**: Create `/settings` page as control panel hub
- [ ] **PENDING**: Sub-navigation for Locations, Sensors, Assignments
- [ ] **PENDING**: Protect with authentication (require 'user' role minimum)

**Routes**:
```
/settings              - Control panel overview/hub
/settings/locations    - Location management (list, create, edit)
/settings/sensors      - Sensor management (list, create, edit)
/settings/assignments  - Sensor-location assignments
```

**Technical Approach**:
- Use existing Layout component
- Sub-navigation with active state highlighting
- Breadcrumb navigation for nested routes
- Responsive design (mobile-friendly tables/forms)

---

### 8.2 Location Management UI
**Goal**: CRUD interface for managing locations

**Components**:
```
src/components/settings/
├── locations/
│   ├── LocationList.tsx       - Table with all locations + actions
│   ├── LocationForm.tsx       - Create/Edit form (modal or inline)
│   ├── LocationCard.tsx       - Individual location display
│   └── DeleteLocationModal.tsx - Confirmation dialog
├── SettingsLayout.tsx         - Layout with sub-navigation
└── SettingsNav.tsx            - Settings navigation component
```

**Implementation**:
- [ ] **PENDING**: Create `LocationList` component with data table
  - Columns: Name, Description, Current Sensors, Actions
  - Actions: Edit, Delete
  - "Add Location" button
- [ ] **PENDING**: Create `LocationForm` component
  - Fields: Name (required), Description (optional)
  - Validation: Name required, max 100 chars
  - Submit handlers for create/update mutations
- [ ] **PENDING**: Create `DeleteLocationModal` component
  - Show warning if sensors currently assigned
  - Confirm/cancel actions
- [ ] **PENDING**: Add GraphQL mutations and hooks
  - `useCreateLocation`, `useUpdateLocation`, `useDeleteLocation`

**GraphQL Operations**:
```typescript
// mutations/locations.ts
const CREATE_LOCATION = gql`
  mutation CreateLocation($input: CreateLocationInput!) {
    createLocation(input: $input) {
      location { id name description }
      success
      message
      errors
    }
  }
`;
// Similar for update/delete
```

---

### 8.3 Sensor Management UI
**Goal**: CRUD interface for managing sensors

**Components**:
```
src/components/settings/
├── sensors/
│   ├── SensorList.tsx         - Table with all sensors + actions
│   ├── SensorForm.tsx         - Create/Edit form
│   ├── SensorCard.tsx         - Individual sensor display
│   ├── SensorStatusBadge.tsx  - Active/Inactive indicator
│   └── DeleteSensorModal.tsx  - Confirmation dialog
```

**Implementation**:
- [ ] **PENDING**: Create `SensorList` component
  - Columns: Name, Model, Status, Current Location, Last Reading, Actions
  - Filter by active/inactive
  - Actions: Edit, Toggle Active, Delete (if no readings)
- [ ] **PENDING**: Create `SensorForm` component
  - Fields: Name (required), Model (required), Installation Date
  - Active toggle
- [ ] **PENDING**: Create `SensorStatusBadge` component
  - Green/Red indicator for active/inactive
  - Show "Unassigned" if no current location
- [ ] **PENDING**: Add GraphQL mutations and hooks
  - `useCreateSensor`, `useUpdateSensor`, `useDeleteSensor`, `useToggleSensorActive`

---

### 8.4 Sensor-Location Assignment UI
**Goal**: Interface to assign sensors to locations and track history

**Components**:
```
src/components/settings/
├── assignments/
│   ├── AssignmentList.tsx     - Current assignments overview
│   ├── AssignSensorModal.tsx  - Assign sensor to location
│   ├── MoveSensorModal.tsx    - Move sensor to different location
│   ├── AssignmentHistory.tsx  - Historical location tracking
│   └── UnassignedSensors.tsx  - List sensors without locations
```

**Implementation**:
- [ ] **PENDING**: Create `AssignmentList` component
  - Show current sensor-location pairs
  - Actions: Move, Remove assignment
- [ ] **PENDING**: Create `AssignSensorModal` component
  - Dropdown to select unassigned sensor
  - Dropdown to select location
  - Optional start date
- [ ] **PENDING**: Create `MoveSensorModal` component
  - Show current location
  - Select new location
  - Automatic end time for old assignment
- [ ] **PENDING**: Create `AssignmentHistory` component
  - Time-series view of sensor movements
  - Filter by sensor or location
- [ ] **PENDING**: Add GraphQL mutations and hooks
  - `useAssignSensorToLocation`, `useMoveSensorToLocation`, `useRemoveSensorFromLocation`

---

### 8.5 Control Panel UX Patterns
**Goal**: Consistent, user-friendly experience

**Patterns**:
- **Optimistic UI Updates**: Show changes immediately, rollback on error
- **Loading States**: Skeleton loaders for lists, disabled buttons during mutations
- **Error Handling**: Toast notifications for success/error, inline form errors
- **Confirmation Dialogs**: For destructive actions (delete, move)
- **Empty States**: Helpful messages when no data ("No locations yet. Create one!")

**Shared Components**:
```
src/components/common/
├── DataTable.tsx          - Reusable table with sorting/pagination
├── Modal.tsx              - Reusable modal dialog
├── ConfirmDialog.tsx      - Confirmation dialog for destructive actions
├── FormField.tsx          - Standardized form field with label/error
├── Toast.tsx              - Toast notifications
└── EmptyState.tsx         - Empty state display
```

---

## ❌ REMOVED FROM INITIAL PLAN

### Overengineered Features (Not Needed)
- **Multi-Tenant Architecture**: Single organization focus for now
- **Advanced ML Analytics**: Complex, unnecessary for core functionality
- **High Availability Infrastructure**: Premature optimization
- **HVAC Integration**: Outside current scope
- **Mobile PWA**: Responsive design sufficient initially

### Redundant Features (Already Covered)
- **Bundle Optimization**: Already completed
- **Environment Configuration**: Already implemented
- **Error Boundaries**: Already implemented
- **Performance Optimization**: Already implemented

---

## 🎯 SUCCESS METRICS

### Immediate Goals (Phase 4)
- [ ] Charts display real-time sensor data
- [ ] Alert system provides useful notifications
- [ ] No performance degradation
- [ ] All existing functionality preserved

### Authentication Goals (Phase 5)
- [ ] Secure JWT token handling
- [ ] Seamless login/logout experience
- [ ] Protected routes work correctly
- [ ] Session management is reliable

### Advanced Feature Goals (Phase 6)
- [ ] Reporting system meets compliance needs
- [ ] Advanced filtering improves data exploration
- [ ] Export functionality covers all use cases

### Long-term Goals (Phase 7)
- [ ] Application stability > 99%
- [ ] Bundle size remains < 500KB
- [ ] Authentication security standards met

---

## 🔄 ONGOING MAINTENANCE

### Code Quality
- [ ] **ONGOING**: Fix linting issues as they arise
- [ ] **ONGOING**: Update dependencies quarterly
- [ ] **ONGOING**: Monitor bundle size
- [ ] **ONGOING**: Address TypeScript errors

### Security
- [ ] **ONGOING**: Security audit of authentication implementation
- [ ] **ONGOING**: Token security best practices
- [ ] **ONGOING**: Dependency vulnerability scanning

### Documentation
- [ ] **ONGOING**: Update component documentation
- [ ] **ONGOING**: Maintain deployment guides
- [ ] **ONGOING**: Authentication flow documentation

---

## 📋 NEXT ACTIONS

### Immediate (This Week) - Control Panel Priority
1. **API**: Add Location CRUD mutations to schema.py
2. **API**: Add Sensor CRUD mutations to schema.py
3. **API**: Add SensorLocation assignment mutations
4. **FE**: Create SettingsLayout and navigation structure

### Short-term (Next 2 Weeks)
1. **FE**: Implement LocationList and LocationForm components
2. **FE**: Implement SensorList and SensorForm components
3. **FE**: Add GraphQL hooks for all mutations
4. **FE**: Implement AssignmentList and modals

### Medium-term (Next Month)
1. **Complete Control Panel** with full CRUD functionality
2. **Add assignment history** view
3. **Add toast notifications** for feedback
4. **Implement first chart widget** (Temperature)

### Long-term (Next Quarter)
1. **Complete all chart widgets**
2. **Add dashboard customization features**
3. **Begin advanced reporting planning**

---

*This working plan balances immediate practical improvements with planned authentication and advanced features. User authentication and advanced reporting are included as future phases to support backend integration and enhanced user experience.*

*Last Updated: Initial working plan creation with authentication and advanced reporting included*
*Current Focus: Immediate fixes and chart implementation*