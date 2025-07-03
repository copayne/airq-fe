# CLAUDE.md

# Development Partnership
We're building production-quality code together. Your role is to create maintainable, efficient solutions while catching potential issues early.

When you seem stuck or overly complex, I'll redirect you - my guidance helps you stay on track.

## 🚨 AUTOMATED CHECKS ARE MANDATORY
**ALL hook issues are BLOCKING - EVERYTHING must be ✅ GREEN!**  
No errors. No formatting issues. No linting problems. Zero tolerance.  
These are not suggestions. Fix ALL issues before continuing.

## CRITICAL WORKFLOW - ALWAYS FOLLOW THIS!

### Research → Plan → Implement
**NEVER JUMP STRAIGHT TO CODING!** Always follow this sequence:
1. **Research**: Explore the codebase, understand existing patterns
2. **Plan**: Create a detailed implementation plan and verify it with me  
3. **Implement**: Execute the plan with validation checkpoints

When asked to implement any feature, you'll first say: "Let me research the codebase and create a plan before implementing."

For complex architectural decisions or challenging problems, use **"ultrathink"** to engage maximum reasoning capacity. Say: "Let me ultrathink about this architecture before proposing a solution."

### USE MULTIPLE AGENTS!
*Leverage subagents aggressively* for better results:

* Spawn agents to explore different parts of the codebase in parallel
* Use one agent to write tests while another implements features
* Delegate research tasks: "I'll have an agent investigate the database schema while I analyze the API structure"
* For complex refactors: One agent identifies changes, another implements them

Say: "I'll spawn agents to tackle different aspects of this problem" whenever a task has multiple independent parts.

### Reality Checkpoints
**Stop and validate** at these moments:
- After implementing a complete feature
- Before starting a new major component  
- When something feels wrong
- Before declaring "done"

Your code must be 100% clean. No exceptions.

### When context gets long:
- Re-read this CLAUDE.md file
- Summarize progress in a PROGRESS.md file
- Document current state before major changes

### Maintain TODO.md:
```
## Current Task
- [ ] What we're doing RIGHT NOW

## Completed  
- [x] What's actually done and tested

## Next Steps
- [ ] What comes next
```

## Go-Specific Rules

### FORBIDDEN - NEVER DO THESE:
- **NO** keeping old and new code together
- **NO** custom error struct hierarchies
- **NO** TODOs in final code

### Required Standards:
- **Delete** old code when replacing it
- **Meaningful names**: `userID` not `id`
- **Early returns** to reduce nesting
- **Table-driven tests** for complex logic

## Implementation Standards

### Our code is complete when:
- ? All linters pass with zero issues
- ? All tests pass  
- ? Feature works end-to-end
- ? Old code is deleted
- ? Godoc on all exported symbols

### Testing Strategy
- Complex business logic ? Write tests first
- Simple CRUD ? Write tests after

## Problem-Solving Together

When you're stuck or confused:
1. **Stop** - Don't spiral into complex solutions
2. **Delegate** - Consider spawning agents for parallel investigation
3. **Ultrathink** - For complex problems, say "I need to ultrathink through this challenge" to engage deeper reasoning
4. **Step back** - Re-read the requirements
5. **Simplify** - The simple solution is usually correct
6. **Ask** - "I see two approaches: [A] vs [B]. Which do you prefer?"

My insights on better approaches are valued - please ask for them!

## Performance & Security

### **Measure First**:
- No premature optimization
- Benchmark before claiming something is faster
- Use pprof for real bottlenecks

### **Security Always**:
- Validate all inputs
- Prepared statements for SQL (never concatenate!)

## Communication Protocol

### Progress Updates:
```
✓ Implemented authentication (all tests passing)
✓ Added rate limiting  
✗ Found issue with token expiration - investigating
```

### Suggesting Improvements:
"The current approach works, but I notice [observation].
Would you like me to [specific improvement]?"

## Working Together

- This is always a feature branch - no backwards compatibility needed
- When in doubt, we choose clarity over cleverness
- **REMINDER**: If this file hasn't been referenced in 30+ minutes, RE-READ IT!

Avoid complex abstractions or "clever" code. The simple, obvious solution is probably better, and my guidance helps you stay focused on what matters.

## Specific Project Overview

This is the Hudson Air Quality Frontend - a React/Next.js dashboard for monitoring air quality data from IoT sensors. Built with the T3 Stack, it uses Apollo Client for GraphQL data fetching and Tailwind CSS for styling.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Data Flow
- **Apollo Client**: GraphQL client configured in `src/lib/apolloClient.ts` with hardcoded backend endpoint `http://10.201.1.115:5000/graphql`
- **Context**: Global state management via `SensorDataContext` for filtering criteria and fetch state
- **Hooks**: Custom hooks (`useSensorData`, `useSensorReadingData`, `useDebouncedRefetch`) abstract data fetching logic

### Component Structure
- **Layout**: `src/components/layout/` contains `Layout` and `Header` components
- **Dashboard**: Main dashboard uses `react-grid-layout` for draggable/resizable widgets
- **Widgets**: Modular widget system in `src/components/dashboard/widgets/`
  - Cards: `SensorCard`, `SensorGrid` 
  - Tables: `SensorReadingTable`
- **Pages**: Next.js pages in `src/pages/` with main dashboard at `/`

### Key Technologies
- **Next.js 14**: React framework with TypeScript
- **Apollo Client**: GraphQL client with InMemoryCache
- **React Grid Layout**: Responsive, draggable dashboard grid
- **Tailwind CSS**: Utility-first CSS framework
- **T3 Env**: Environment variable validation with Zod
- **Tanstack Table**: Table component library

### Data Models
GraphQL schema defines:
- `SensorReading`: Main data entity with sensor, location, and measurement data
- `Sensor`: Device information (id, name, model)
- `Location`: Physical location data (id, name, description)
- Measurement types: `CO2Reading`, `TemperatureReading`, `HumidityReading`

### State Management
- **SensorDataContext**: Global filtering criteria and fetch state
- **LocalStorage**: Dashboard layouts and widget configurations persisted locally
- **Apollo Cache**: Automatic GraphQL query caching

## Key Files
- `src/lib/apolloClient.ts`: GraphQL client configuration
- `src/context/SensorDataContext.tsx`: Global state management
- `src/components/dashboard/DashboardCanvas.tsx`: Main dashboard with grid layout
- `src/env.js`: Environment variable validation
- `src/pages/_app.tsx`: App setup with providers
