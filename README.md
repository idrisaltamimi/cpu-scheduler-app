# CPU Scheduling Simulator

A visually polished web application that simulates classic Operating System CPU scheduling algorithms. Built with React, TypeScript, and Tailwind CSS.

![CPU Scheduling Simulator](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue)

## Features

- **Interactive Process Input**: Add, edit, and delete processes with validation
- **Multiple Scheduling Algorithms**: FCFS, SJF, Priority, and Round Robin
- **Visual Gantt Chart**: Animated timeline with play/pause/step controls
- **Comprehensive Metrics**: Waiting time, turnaround time, response time, CPU utilization
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## Algorithms Included

### 1. First Come First Served (FCFS)
- **Type**: Non-preemptive
- **Description**: Processes are executed in the order they arrive
- **Characteristics**: Simple but can lead to convoy effect

### 2. Shortest Job First (SJF)
- **Type**: Non-preemptive
- **Description**: Selects the process with the shortest burst time among arrived processes
- **Tie-breaking**: Arrival time, then insertion order

### 3. Priority Scheduling
- **Type**: Non-preemptive
- **Description**: Selects the process with the highest priority (lower number = higher priority)
- **Tie-breaking**: Arrival time, then insertion order

### 4. Round Robin (RR)
- **Type**: Preemptive
- **Description**: Each process gets a fixed time quantum, then goes to the back of the queue
- **Configurable**: Time quantum can be adjusted

## Definitions

### Timing Metrics

| Metric | Definition | Formula |
|--------|------------|---------|
| **Completion Time (CT)** | Time when process finishes execution | - |
| **Turnaround Time (TAT)** | Total time from arrival to completion | `CT - Arrival Time` |
| **Waiting Time (WT)** | Time spent waiting in ready queue | `TAT - Burst Time` |
| **Response Time (RT)** | Time from arrival to first CPU execution | `First Start Time - Arrival Time` |
| **CPU Utilization** | Percentage of time CPU was busy | `(Busy Time / Total Time) x 100` |

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later

### Installation

```bash
# Navigate to the project directory
cd cpu-scheduler-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

### Run Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run
```

## Example Input & Output

### Input Processes

| PID | Arrival Time | Burst Time | Priority |
|-----|--------------|------------|----------|
| P1  | 0            | 5          | 2        |
| P2  | 1            | 3          | 1        |
| P3  | 2            | 8          | 4        |
| P4  | 3            | 6          | 3        |
| P5  | 4            | 4          | 2        |

### Expected Output (FCFS Algorithm)

**Gantt Chart:**
```
| P1 (0-5) | P2 (5-8) | P3 (8-16) | P4 (16-22) | P5 (22-26) |
```

**Process Metrics:**

| PID | Completion | Turnaround | Waiting | Response |
|-----|------------|------------|---------|----------|
| P1  | 5          | 5          | 0       | 0        |
| P2  | 8          | 7          | 4       | 4        |
| P3  | 16         | 14         | 6       | 6        |
| P4  | 22         | 19         | 13      | 13       |
| P5  | 26         | 22         | 18      | 18       |

**Averages:**
- Average Waiting Time: 8.20 units
- Average Turnaround Time: 13.40 units
- Average Response Time: 8.20 units
- CPU Utilization: 100%

## Project Structure

```
cpu-scheduler-app/
├── src/
│   ├── components/
│   │   ├── Header.tsx         # App header with dark mode toggle
│   │   ├── ProcessTable.tsx   # Process input table
│   │   ├── Controls.tsx       # Algorithm selection & run controls
│   │   ├── GanttChart.tsx     # Animated Gantt chart visualization
│   │   ├── MetricsCards.tsx   # KPI cards for averages
│   │   ├── ResultsTable.tsx   # Detailed per-process metrics
│   │   └── index.ts           # Component exports
│   ├── lib/
│   │   ├── scheduler.ts       # Core scheduling algorithms
│   │   └── colors.ts          # Color utilities for processes
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── __tests__/
│   │   └── scheduler.test.ts  # Unit tests for algorithms
│   ├── App.tsx                # Main application component
│   ├── main.tsx               # Application entry point
│   └── index.css              # Tailwind CSS styles
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Vitest** - Testing framework

## Usage Tips

1. **Load Example**: Click "Load Example" to populate sample data
2. **Edit Values**: Click on any cell to edit it inline
3. **Validation**: The app validates inputs and shows errors
4. **Animation**: Use Play/Pause/Step to animate the Gantt chart
5. **Dark Mode**: Toggle dark mode using the sun/moon icon in the header

## License

This project is for educational purposes as part of an Operating Systems fundamentals course.
