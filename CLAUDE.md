# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start development server (http://localhost:5173)
npm run build        # TypeScript check + Vite production build
npm run lint         # Run ESLint
npm test             # Run Vitest in watch mode
npm run test:run     # Run tests once (CI mode)
npm run preview      # Preview production build
```

## Architecture

This is a CPU scheduling simulator built with React 19, TypeScript, and Vite. It visualizes four classic OS scheduling algorithms: FCFS, SJF, Priority, and Round Robin.

### Core Data Flow

1. **Process Input** (`src/components/ProcessTable.tsx`) - User enters processes with arrival time, burst time, and priority
2. **Simulation** (`src/lib/scheduler.ts`) - `simulateSchedule()` dispatches to algorithm-specific functions and returns a `SimulationResult`
3. **Visualization** - Results displayed via `GanttChart`, `MetricsCards`, and `ResultsTable` components

### Key Types (`src/types/index.ts`)

- `Process` - Input process with pid, arrivalTime, burstTime, priority, insertionOrder
- `GanttSegment` - Timeline segment (pid is null for IDLE periods)
- `SimulationResult` - Contains ganttChart, processMetrics, and computed averages

### Scheduling Algorithms (`src/lib/scheduler.ts`)

All non-preemptive algorithms (FCFS, SJF, Priority) follow the same pattern:
1. Sort/select from available (arrived) processes
2. Handle idle time if no process has arrived
3. Tie-break by arrival time, then insertion order

Round Robin is preemptive and maintains a ready queue with time quantum slicing.

### State Management

All state lives in `App.tsx` using React hooks:
- `processes` - Current process list
- `algorithm` / `quantum` - Selected algorithm and RR quantum
- `result` - Simulation output (null until run)
- `darkMode` - Persisted to localStorage
