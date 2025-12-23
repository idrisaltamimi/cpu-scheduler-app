import { describe, it, expect } from 'vitest';
import { simulateSchedule, validateProcess, getExampleProcesses } from '../lib/scheduler';
import type { Process } from '../types';

describe('simulateSchedule', () => {
  describe('FCFS (First Come First Served)', () => {
    it('should schedule processes in arrival order', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 1, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 2, burstTime: 3, priority: 1, insertionOrder: 1 },
        { pid: 'P3', arrivalTime: 4, burstTime: 2, priority: 1, insertionOrder: 2 },
      ];

      const result = simulateSchedule(processes, 'FCFS');

      expect(result.ganttChart).toEqual([
        { pid: 'P1', start: 0, end: 5 },
        { pid: 'P2', start: 5, end: 8 },
        { pid: 'P3', start: 8, end: 10 },
      ]);
    });

    it('should handle idle time when first process arrives late', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 3, burstTime: 4, priority: 1, insertionOrder: 0 },
      ];

      const result = simulateSchedule(processes, 'FCFS');

      expect(result.ganttChart).toEqual([
        { pid: null, start: 0, end: 3 },
        { pid: 'P1', start: 3, end: 7 },
      ]);
    });

    it('should handle multiple processes arriving at the same time (insertion order)', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 3, priority: 1, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 0, burstTime: 2, priority: 1, insertionOrder: 1 },
        { pid: 'P3', arrivalTime: 0, burstTime: 4, priority: 1, insertionOrder: 2 },
      ];

      const result = simulateSchedule(processes, 'FCFS');

      expect(result.ganttChart).toEqual([
        { pid: 'P1', start: 0, end: 3 },
        { pid: 'P2', start: 3, end: 5 },
        { pid: 'P3', start: 5, end: 9 },
      ]);
    });

    it('should calculate correct metrics', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 1, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, insertionOrder: 1 },
      ];

      const result = simulateSchedule(processes, 'FCFS');

      // P1: CT=5, TAT=5-0=5, WT=5-5=0, RT=0-0=0
      // P2: CT=8, TAT=8-1=7, WT=7-3=4, RT=5-1=4
      expect(result.processMetrics.find((m) => m.pid === 'P1')).toMatchObject({
        completionTime: 5,
        turnaroundTime: 5,
        waitingTime: 0,
        responseTime: 0,
      });
      expect(result.processMetrics.find((m) => m.pid === 'P2')).toMatchObject({
        completionTime: 8,
        turnaroundTime: 7,
        waitingTime: 4,
        responseTime: 4,
      });
    });
  });

  describe('SJF (Shortest Job First)', () => {
    it('should select process with shortest burst time', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 7, priority: 1, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 0, burstTime: 4, priority: 1, insertionOrder: 1 },
        { pid: 'P3', arrivalTime: 0, burstTime: 1, priority: 1, insertionOrder: 2 },
      ];

      const result = simulateSchedule(processes, 'SJF');

      // Should be ordered by burst time: P3(1), P2(4), P1(7)
      expect(result.ganttChart).toEqual([
        { pid: 'P3', start: 0, end: 1 },
        { pid: 'P2', start: 1, end: 5 },
        { pid: 'P1', start: 5, end: 12 },
      ]);
    });

    it('should only consider arrived processes', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 7, priority: 1, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 2, burstTime: 3, priority: 1, insertionOrder: 1 },
        { pid: 'P3', arrivalTime: 5, burstTime: 1, priority: 1, insertionOrder: 2 },
      ];

      const result = simulateSchedule(processes, 'SJF');

      // At t=0: only P1 available, runs to completion
      // At t=7: P2 and P3 available, P3 is shorter
      expect(result.ganttChart).toEqual([
        { pid: 'P1', start: 0, end: 7 },
        { pid: 'P3', start: 7, end: 8 },
        { pid: 'P2', start: 8, end: 11 },
      ]);
    });

    it('should tie-break by arrival time, then insertion order', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 3, priority: 1, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 0, burstTime: 3, priority: 1, insertionOrder: 1 },
      ];

      const result = simulateSchedule(processes, 'SJF');

      // Same burst time, same arrival, so insertion order wins
      expect(result.ganttChart[0].pid).toBe('P1');
      expect(result.ganttChart[1].pid).toBe('P2');
    });
  });

  describe('Priority Scheduling', () => {
    it('should select process with highest priority (lowest number)', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 4, priority: 3, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 0, burstTime: 3, priority: 1, insertionOrder: 1 },
        { pid: 'P3', arrivalTime: 0, burstTime: 5, priority: 2, insertionOrder: 2 },
      ];

      const result = simulateSchedule(processes, 'Priority');

      // Should be ordered by priority: P2(1), P3(2), P1(3)
      expect(result.ganttChart).toEqual([
        { pid: 'P2', start: 0, end: 3 },
        { pid: 'P3', start: 3, end: 8 },
        { pid: 'P1', start: 8, end: 12 },
      ]);
    });

    it('should tie-break by arrival time', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 2, burstTime: 3, priority: 1, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 0, burstTime: 4, priority: 1, insertionOrder: 1 },
      ];

      const result = simulateSchedule(processes, 'Priority');

      // Same priority, P2 arrived first
      expect(result.ganttChart[0].pid).toBe('P2');
    });

    it('should handle idle time correctly', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 5, burstTime: 3, priority: 1, insertionOrder: 0 },
      ];

      const result = simulateSchedule(processes, 'Priority');

      expect(result.ganttChart).toEqual([
        { pid: null, start: 0, end: 5 },
        { pid: 'P1', start: 5, end: 8 },
      ]);
    });
  });

  describe('Round Robin', () => {
    it('should preempt processes after time quantum', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 1, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 0, burstTime: 3, priority: 1, insertionOrder: 1 },
      ];

      const result = simulateSchedule(processes, 'RoundRobin', 2);

      // P1 runs for 2, P2 runs for 2, P1 runs for 2, P2 runs for 1, P1 runs for 1
      expect(result.ganttChart).toEqual([
        { pid: 'P1', start: 0, end: 2 },
        { pid: 'P2', start: 2, end: 4 },
        { pid: 'P1', start: 4, end: 6 },
        { pid: 'P2', start: 6, end: 7 },
        { pid: 'P1', start: 7, end: 8 },
      ]);
    });

    it('should complete process if remaining time < quantum', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 3, priority: 1, insertionOrder: 0 },
      ];

      const result = simulateSchedule(processes, 'RoundRobin', 5);

      expect(result.ganttChart).toEqual([{ pid: 'P1', start: 0, end: 3 }]);
    });

    it('should handle processes arriving during execution', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 4, priority: 1, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 1, burstTime: 2, priority: 1, insertionOrder: 1 },
      ];

      const result = simulateSchedule(processes, 'RoundRobin', 2);

      // P1 runs 0-2, P2 arrives at 1, added to queue
      // P2 runs 2-4, P1 runs 4-6
      expect(result.ganttChart).toEqual([
        { pid: 'P1', start: 0, end: 2 },
        { pid: 'P2', start: 2, end: 4 },
        { pid: 'P1', start: 4, end: 6 },
      ]);
    });

    it('should track response time correctly', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 4, priority: 1, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 0, burstTime: 4, priority: 1, insertionOrder: 1 },
      ];

      const result = simulateSchedule(processes, 'RoundRobin', 2);

      // P1 first starts at 0, P2 first starts at 2
      expect(result.processMetrics.find((m) => m.pid === 'P1')?.responseTime).toBe(0);
      expect(result.processMetrics.find((m) => m.pid === 'P2')?.responseTime).toBe(2);
    });

    it('should handle idle time between arrivals', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 2, priority: 1, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 5, burstTime: 3, priority: 1, insertionOrder: 1 },
      ];

      const result = simulateSchedule(processes, 'RoundRobin', 2);

      expect(result.ganttChart).toEqual([
        { pid: 'P1', start: 0, end: 2 },
        { pid: null, start: 2, end: 5 },
        { pid: 'P2', start: 5, end: 7 },
        { pid: 'P2', start: 7, end: 8 },
      ]);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty results for empty process list', () => {
      const result = simulateSchedule([], 'FCFS');

      expect(result.ganttChart).toEqual([]);
      expect(result.processMetrics).toEqual([]);
      expect(result.averageWaitingTime).toBe(0);
      expect(result.cpuUtilization).toBe(0);
    });

    it('should calculate CPU utilization correctly', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 2, burstTime: 3, priority: 1, insertionOrder: 0 },
      ];

      const result = simulateSchedule(processes, 'FCFS');

      // Total time = 5, Busy time = 3, Utilization = 60%
      expect(result.cpuUtilization).toBe(60);
    });

    it('should ensure no negative waiting times', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 1, priority: 1, insertionOrder: 0 },
      ];

      const result = simulateSchedule(processes, 'FCFS');

      expect(result.processMetrics[0].waitingTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle quantum larger than burst time', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 2, priority: 1, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 0, burstTime: 3, priority: 1, insertionOrder: 1 },
      ];

      const result = simulateSchedule(processes, 'RoundRobin', 10);

      // With quantum=10, processes run to completion
      expect(result.ganttChart).toEqual([
        { pid: 'P1', start: 0, end: 2 },
        { pid: 'P2', start: 2, end: 5 },
      ]);
    });
  });

  describe('Average Calculations', () => {
    it('should calculate correct average waiting time', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 3, priority: 1, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 0, burstTime: 3, priority: 1, insertionOrder: 1 },
      ];

      const result = simulateSchedule(processes, 'FCFS');

      // P1: WT=0, P2: WT=3 (waits for P1)
      // Avg = (0 + 3) / 2 = 1.5
      expect(result.averageWaitingTime).toBe(1.5);
    });

    it('should calculate correct average turnaround time', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 3, priority: 1, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 0, burstTime: 3, priority: 1, insertionOrder: 1 },
      ];

      const result = simulateSchedule(processes, 'FCFS');

      // P1: TAT=3, P2: TAT=6
      // Avg = (3 + 6) / 2 = 4.5
      expect(result.averageTurnaroundTime).toBe(4.5);
    });

    it('should calculate correct average response time', () => {
      const processes: Process[] = [
        { pid: 'P1', arrivalTime: 0, burstTime: 4, priority: 1, insertionOrder: 0 },
        { pid: 'P2', arrivalTime: 0, burstTime: 4, priority: 1, insertionOrder: 1 },
      ];

      const result = simulateSchedule(processes, 'RoundRobin', 2);

      // P1: first starts at 0, RT=0
      // P2: first starts at 2, RT=2
      // Avg = (0 + 2) / 2 = 1
      expect(result.averageResponseTime).toBe(1);
    });
  });
});

describe('validateProcess', () => {
  it('should return valid for correct process', () => {
    const result = validateProcess({
      pid: 'P1',
      arrivalTime: 0,
      burstTime: 5,
      priority: 1,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject empty PID', () => {
    const result = validateProcess({
      pid: '',
      arrivalTime: 0,
      burstTime: 5,
      priority: 1,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Process ID is required');
  });

  it('should reject negative arrival time', () => {
    const result = validateProcess({
      pid: 'P1',
      arrivalTime: -1,
      burstTime: 5,
      priority: 1,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Arrival time must be >= 0');
  });

  it('should reject zero or negative burst time', () => {
    const result = validateProcess({
      pid: 'P1',
      arrivalTime: 0,
      burstTime: 0,
      priority: 1,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Burst time must be > 0');
  });

  it('should reject negative priority', () => {
    const result = validateProcess({
      pid: 'P1',
      arrivalTime: 0,
      burstTime: 5,
      priority: -1,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Priority must be >= 0');
  });
});

describe('getExampleProcesses', () => {
  it('should return valid example processes', () => {
    const examples = getExampleProcesses();

    expect(examples.length).toBeGreaterThan(0);
    examples.forEach((proc) => {
      const validation = validateProcess(proc);
      expect(validation.valid).toBe(true);
    });
  });

  it('should have unique PIDs', () => {
    const examples = getExampleProcesses();
    const pids = examples.map((p) => p.pid);
    const uniquePids = new Set(pids);

    expect(uniquePids.size).toBe(pids.length);
  });
});
