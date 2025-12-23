// Process definition
export interface Process {
  pid: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  insertionOrder: number;
}

// Scheduling algorithms
export type Algorithm = 'FCFS' | 'SJF' | 'Priority' | 'RoundRobin';

// Gantt chart segment
export interface GanttSegment {
  pid: string | null; // null for IDLE
  start: number;
  end: number;
}

// Per-process metrics
export interface ProcessMetrics {
  pid: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  completionTime: number;
  waitingTime: number;
  turnaroundTime: number;
  responseTime: number;
}

// Overall simulation results
export interface SimulationResult {
  ganttChart: GanttSegment[];
  processMetrics: ProcessMetrics[];
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  averageResponseTime: number;
  cpuUtilization: number;
  totalTime: number;
}

// Color mapping for processes
export interface ProcessColor {
  bg: string;
  border: string;
  text: string;
}

// Process colors palette
export const PROCESS_COLORS: ProcessColor[] = [
  { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-blue-600' },
  { bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-emerald-600' },
  { bg: 'bg-amber-500', border: 'border-amber-600', text: 'text-amber-600' },
  { bg: 'bg-rose-500', border: 'border-rose-600', text: 'text-rose-600' },
  { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-purple-600' },
  { bg: 'bg-cyan-500', border: 'border-cyan-600', text: 'text-cyan-600' },
  { bg: 'bg-orange-500', border: 'border-orange-600', text: 'text-orange-600' },
  { bg: 'bg-pink-500', border: 'border-pink-600', text: 'text-pink-600' },
  { bg: 'bg-indigo-500', border: 'border-indigo-600', text: 'text-indigo-600' },
  { bg: 'bg-teal-500', border: 'border-teal-600', text: 'text-teal-600' },
];

// Hex colors for charts
export const PROCESS_HEX_COLORS: string[] = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#f43f5e', // rose-500
  '#a855f7', // purple-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
];
