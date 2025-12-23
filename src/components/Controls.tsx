import { Play, RotateCcw, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Algorithm } from '../types';

interface ControlsProps {
  algorithm: Algorithm;
  quantum: number;
  onAlgorithmChange: (algorithm: Algorithm) => void;
  onQuantumChange: (quantum: number) => void;
  onRun: () => void;
  onReset: () => void;
  canRun: boolean;
  hasResults: boolean;
}

const ALGORITHMS: { value: Algorithm; label: string; description: string }[] = [
  {
    value: 'FCFS',
    label: 'First Come First Served (FCFS)',
    description: 'Processes executed in arrival order',
  },
  {
    value: 'SJF',
    label: 'Shortest Job First (SJF)',
    description: 'Non-preemptive, shortest burst time first',
  },
  {
    value: 'Priority',
    label: 'Priority Scheduling',
    description: 'Non-preemptive, lower priority number = higher priority',
  },
  {
    value: 'RoundRobin',
    label: 'Round Robin (RR)',
    description: 'Preemptive with time quantum',
  },
];

export function Controls({
  algorithm,
  quantum,
  onAlgorithmChange,
  onQuantumChange,
  onRun,
  onReset,
  canRun,
  hasResults,
}: ControlsProps) {
  const selectedAlgorithm = ALGORITHMS.find((a) => a.value === algorithm);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card p-4"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Algorithm Selection
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Algorithm Dropdown */}
        <div className="sm:col-span-2">
          <label htmlFor="algorithm" className="label">
            Scheduling Algorithm
          </label>
          <div className="relative">
            <select
              id="algorithm"
              value={algorithm}
              onChange={(e) => onAlgorithmChange(e.target.value as Algorithm)}
              className="select pr-10"
            >
              {ALGORITHMS.map((algo) => (
                <option key={algo.value} value={algo.value}>
                  {algo.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {selectedAlgorithm && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {selectedAlgorithm.description}
            </p>
          )}
        </div>

        {/* Time Quantum (only for Round Robin) */}
        <div className={algorithm !== 'RoundRobin' ? 'opacity-50' : ''}>
          <label htmlFor="quantum" className="label">
            Time Quantum
          </label>
          <input
            id="quantum"
            type="number"
            min="1"
            value={quantum}
            onChange={(e) => onQuantumChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
            disabled={algorithm !== 'RoundRobin'}
            className="input"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {algorithm === 'RoundRobin'
              ? 'Time slice for each process'
              : 'Only used for Round Robin'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-end gap-2">
          <button
            onClick={onRun}
            disabled={!canRun}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Run Simulation
          </button>
          {hasResults && (
            <button
              onClick={onReset}
              className="btn-secondary flex items-center justify-center gap-2 px-3"
              title="Reset results"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Algorithm Info Cards */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {ALGORITHMS.map((algo) => (
          <button
            key={algo.value}
            onClick={() => onAlgorithmChange(algo.value)}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              algorithm === algo.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div
              className={`text-sm font-medium ${
                algorithm === algo.value
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {algo.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {algo.value === 'RoundRobin' ? 'Preemptive' : 'Non-preemptive'}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
