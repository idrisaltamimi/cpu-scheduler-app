import type {
  Process,
  Algorithm,
  GanttSegment,
  ProcessMetrics,
  SimulationResult
} from "../types"

/**
 * Main simulation function that dispatches to the appropriate algorithm
 */
export function simulateSchedule(
  processes: Process[],
  algorithm: Algorithm,
  quantum: number = 2
): SimulationResult {
  if (processes.length === 0) {
    return {
      ganttChart: [],
      processMetrics: [],
      averageWaitingTime: 0,
      averageTurnaroundTime: 0,
      averageResponseTime: 0,
      cpuUtilization: 0,
      totalTime: 0
    }
  }

  // Create deep copy to avoid modifying original processes
  const procs = processes.map((p) => ({ ...p }))

  let ganttChart: GanttSegment[]

  switch (algorithm) {
    case "FCFS":
      ganttChart = scheduleFCFS(procs)
      break
    case "SJF":
      ganttChart = scheduleSJF(procs)
      break
    case "Priority":
      ganttChart = schedulePriority(procs)
      break
    case "RoundRobin":
      ganttChart = scheduleRoundRobin(procs, quantum)
      break
    default:
      throw new Error(`Unknown algorithm: ${algorithm}`)
  }

  // Compute metrics
  return computeMetrics(procs, ganttChart)
}

/**
 * First Come First Served (FCFS) - Non-preemptive
 * Processes are executed in order of arrival time
 */
function scheduleFCFS(processes: Process[]): GanttSegment[] {
  // Sort by arrival time, then by insertion order (for stability)
  const sorted = [...processes].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) {
      return a.arrivalTime - b.arrivalTime
    }
    return a.insertionOrder - b.insertionOrder
  })

  const gantt: GanttSegment[] = []
  let currentTime = 0

  for (const proc of sorted) {
    // Handle idle time if no process has arrived yet
    if (currentTime < proc.arrivalTime) {
      gantt.push({
        pid: null,
        start: currentTime,
        end: proc.arrivalTime
      })
      currentTime = proc.arrivalTime
    }

    // Execute the process
    gantt.push({
      pid: proc.pid,
      start: currentTime,
      end: currentTime + proc.burstTime
    })
    currentTime += proc.burstTime
  }

  return gantt
}

/**
 * Shortest Job First (SJF) - Non-preemptive
 * Choose the process with the smallest burst time among arrived processes
 */
function scheduleSJF(processes: Process[]): GanttSegment[] {
  const gantt: GanttSegment[] = []
  const remaining = [...processes]
  let currentTime = 0

  while (remaining.length > 0) {
    // Find processes that have arrived
    const available = remaining.filter((p) => p.arrivalTime <= currentTime)

    if (available.length === 0) {
      // No process has arrived yet, find the next arrival
      const nextArrival = Math.min(...remaining.map((p) => p.arrivalTime))
      gantt.push({
        pid: null,
        start: currentTime,
        end: nextArrival
      })
      currentTime = nextArrival
      continue
    }

    // Select the one with shortest burst time
    // Tie-break: arrival time, then insertion order
    available.sort((a, b) => {
      if (a.burstTime !== b.burstTime) {
        return a.burstTime - b.burstTime
      }
      if (a.arrivalTime !== b.arrivalTime) {
        return a.arrivalTime - b.arrivalTime
      }
      return a.insertionOrder - b.insertionOrder
    })

    const selected = available[0]
    const index = remaining.findIndex((p) => p.pid === selected.pid)
    remaining.splice(index, 1)

    gantt.push({
      pid: selected.pid,
      start: currentTime,
      end: currentTime + selected.burstTime
    })
    currentTime += selected.burstTime
  }

  return gantt
}

/**
 * Priority Scheduling - Non-preemptive
 * Lower priority number = higher priority
 */
function schedulePriority(processes: Process[]): GanttSegment[] {
  const gantt: GanttSegment[] = []
  const remaining = [...processes]
  let currentTime = 0

  while (remaining.length > 0) {
    // Find processes that have arrived
    const available = remaining.filter((p) => p.arrivalTime <= currentTime)

    if (available.length === 0) {
      // No process has arrived yet
      const nextArrival = Math.min(...remaining.map((p) => p.arrivalTime))
      gantt.push({
        pid: null,
        start: currentTime,
        end: nextArrival
      })
      currentTime = nextArrival
      continue
    }

    // Select the one with highest priority (lowest number)
    // Tie-break: arrival time, then insertion order
    available.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      if (a.arrivalTime !== b.arrivalTime) {
        return a.arrivalTime - b.arrivalTime
      }
      return a.insertionOrder - b.insertionOrder
    })

    const selected = available[0]
    const index = remaining.findIndex((p) => p.pid === selected.pid)
    remaining.splice(index, 1)

    gantt.push({
      pid: selected.pid,
      start: currentTime,
      end: currentTime + selected.burstTime
    })
    currentTime += selected.burstTime
  }

  return gantt
}

/**
 * Round Robin - Preemptive
 * Each process gets a time quantum, then goes to the back of the queue
 */
function scheduleRoundRobin(processes: Process[], quantum: number): GanttSegment[] {
  const gantt: GanttSegment[] = []

  // Create a copy with remaining burst time
  interface RRProcess extends Process {
    remainingBurst: number
  }

  const allProcesses: RRProcess[] = processes
    .map((p) => ({ ...p, remainingBurst: p.burstTime }))
    .sort((a, b) => {
      if (a.arrivalTime !== b.arrivalTime) {
        return a.arrivalTime - b.arrivalTime
      }
      return a.insertionOrder - b.insertionOrder
    })

  const readyQueue: RRProcess[] = []
  let currentTime = 0
  let processIndex = 0

  // Function to enqueue arriving processes
  const enqueueArrivals = (upToTime: number) => {
    while (
      processIndex < allProcesses.length &&
      allProcesses[processIndex].arrivalTime <= upToTime
    ) {
      readyQueue.push(allProcesses[processIndex])
      processIndex++
    }
  }

  // Initial enqueue at time 0
  enqueueArrivals(0)

  while (readyQueue.length > 0 || processIndex < allProcesses.length) {
    if (readyQueue.length === 0) {
      // No process ready, wait for next arrival
      const nextArrival = allProcesses[processIndex].arrivalTime
      gantt.push({
        pid: null,
        start: currentTime,
        end: nextArrival
      })
      currentTime = nextArrival
      enqueueArrivals(currentTime)
      continue
    }

    // Dequeue the next process
    const current = readyQueue.shift()!

    // Calculate execution time for this slice
    const execTime = Math.min(quantum, current.remainingBurst)

    gantt.push({
      pid: current.pid,
      start: currentTime,
      end: currentTime + execTime
    })

    currentTime += execTime
    current.remainingBurst -= execTime

    // Enqueue any processes that arrived during this execution
    enqueueArrivals(currentTime)

    // If process still has remaining time, put it back in queue
    if (current.remainingBurst > 0) {
      readyQueue.push(current)
    }
  }

  return gantt
}

/**
 * Compute all metrics from the Gantt chart
 */
function computeMetrics(
  processes: Process[],
  ganttChart: GanttSegment[]
): SimulationResult {
  const processMetrics: ProcessMetrics[] = []
  const firstStartTime = new Map<string, number>()
  const completionTime = new Map<string, number>()

  // Find first start time and completion time for each process
  for (const segment of ganttChart) {
    if (segment.pid === null) continue

    if (!firstStartTime.has(segment.pid)) {
      firstStartTime.set(segment.pid, segment.start)
    }
    completionTime.set(segment.pid, segment.end)
  }

  // Calculate metrics for each process
  for (const proc of processes) {
    const ct = completionTime.get(proc.pid) || 0
    const turnaroundTime = ct - proc.arrivalTime
    const waitingTime = turnaroundTime - proc.burstTime
    const responseTime = (firstStartTime.get(proc.pid) || 0) - proc.arrivalTime

    processMetrics.push({
      pid: proc.pid,
      arrivalTime: proc.arrivalTime,
      burstTime: proc.burstTime,
      priority: proc.priority,
      completionTime: ct,
      waitingTime: Math.max(0, waitingTime), // Ensure non-negative
      turnaroundTime,
      responseTime: Math.max(0, responseTime) // Ensure non-negative
    })
  }

  // Sort by PID for consistent display
  processMetrics.sort((a, b) => a.pid.localeCompare(b.pid))

  // Calculate averages
  const n = processMetrics.length
  const avgWaiting = processMetrics.reduce((sum, p) => sum + p.waitingTime, 0) / n
  const avgTurnaround = processMetrics.reduce((sum, p) => sum + p.turnaroundTime, 0) / n
  const avgResponse = processMetrics.reduce((sum, p) => sum + p.responseTime, 0) / n

  // Calculate CPU utilization
  const totalTime = ganttChart.length > 0 ? ganttChart[ganttChart.length - 1].end : 0
  const busyTime = ganttChart
    .filter((s) => s.pid !== null)
    .reduce((sum, s) => sum + (s.end - s.start), 0)
  const cpuUtilization = totalTime > 0 ? (busyTime / totalTime) * 100 : 0

  return {
    ganttChart,
    processMetrics,
    averageWaitingTime: avgWaiting,
    averageTurnaroundTime: avgTurnaround,
    averageResponseTime: avgResponse,
    cpuUtilization,
    totalTime
  }
}

/**
 * Validate a single process input
 */
export function validateProcess(process: Partial<Process>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!process.pid || process.pid.trim() === "") {
    errors.push("Process ID is required")
  }

  if (process.arrivalTime === undefined || process.arrivalTime < 0) {
    errors.push("Arrival time must be >= 0")
  }

  if (process.burstTime === undefined || process.burstTime <= 0) {
    errors.push("Burst time must be > 0")
  }

  if (process.priority === undefined || process.priority < 0) {
    errors.push("Priority must be >= 0")
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Example dataset for demonstration
 */
export function getExampleProcesses(): Process[] {
  return [
    { pid: "P1", arrivalTime: 0, burstTime: 5, priority: 2, insertionOrder: 0 },
    { pid: "P2", arrivalTime: 1, burstTime: 3, priority: 1, insertionOrder: 1 },
    { pid: "P3", arrivalTime: 2, burstTime: 8, priority: 4, insertionOrder: 2 },
    { pid: "P4", arrivalTime: 3, burstTime: 6, priority: 3, insertionOrder: 3 },
    { pid: "P5", arrivalTime: 4, burstTime: 4, priority: 2, insertionOrder: 4 }
  ]
}
