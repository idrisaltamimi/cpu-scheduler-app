import { motion } from 'framer-motion';
import type { ProcessMetrics } from '../types';
import { getProcessColor } from '../lib/colors';

interface ResultsTableProps {
  metrics: ProcessMetrics[];
  allPids: string[];
}

export function ResultsTable({ metrics, allPids }: ResultsTableProps) {
  if (metrics.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Process Metrics
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Detailed timing information for each process
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Process</th>
              <th className="table-header text-center">Arrival</th>
              <th className="table-header text-center">Burst</th>
              <th className="table-header text-center">Priority</th>
              <th className="table-header text-center">Completion</th>
              <th className="table-header text-center">
                <div className="flex flex-col items-center">
                  <span>Waiting</span>
                  <span className="font-normal text-gray-400 dark:text-gray-500 text-[10px]">
                    (CT - AT - BT)
                  </span>
                </div>
              </th>
              <th className="table-header text-center">
                <div className="flex flex-col items-center">
                  <span>Turnaround</span>
                  <span className="font-normal text-gray-400 dark:text-gray-500 text-[10px]">
                    (CT - AT)
                  </span>
                </div>
              </th>
              <th className="table-header text-center">
                <div className="flex flex-col items-center">
                  <span>Response</span>
                  <span className="font-normal text-gray-400 dark:text-gray-500 text-[10px]">
                    (First Start - AT)
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((proc, index) => {
              const color = getProcessColor(proc.pid, allPids);
              return (
                <motion.tr
                  key={proc.pid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${color.bg}`}
                      />
                      <span className="font-mono font-medium text-gray-900 dark:text-white">
                        {proc.pid}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell text-center font-mono">
                    {proc.arrivalTime}
                  </td>
                  <td className="table-cell text-center font-mono">
                    {proc.burstTime}
                  </td>
                  <td className="table-cell text-center font-mono">
                    {proc.priority}
                  </td>
                  <td className="table-cell text-center font-mono">
                    {proc.completionTime}
                  </td>
                  <td className="table-cell text-center">
                    <span
                      className={`font-mono px-2 py-0.5 rounded ${
                        proc.waitingTime === 0
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}
                    >
                      {proc.waitingTime}
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    <span className="font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {proc.turnaroundTime}
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    <span
                      className={`font-mono px-2 py-0.5 rounded ${
                        proc.responseTime === 0
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}
                    >
                      {proc.responseTime}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 dark:bg-gray-700/50 font-medium">
              <td colSpan={5} className="table-cell text-right text-gray-600 dark:text-gray-400">
                Averages:
              </td>
              <td className="table-cell text-center font-mono text-blue-600 dark:text-blue-400">
                {(metrics.reduce((sum, p) => sum + p.waitingTime, 0) / metrics.length).toFixed(2)}
              </td>
              <td className="table-cell text-center font-mono text-amber-600 dark:text-amber-400">
                {(metrics.reduce((sum, p) => sum + p.turnaroundTime, 0) / metrics.length).toFixed(2)}
              </td>
              <td className="table-cell text-center font-mono text-purple-600 dark:text-purple-400">
                {(metrics.reduce((sum, p) => sum + p.responseTime, 0) / metrics.length).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Formulas Legend */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Formulas
        </h3>
        <div className="grid gap-2 text-xs text-gray-600 dark:text-gray-400 sm:grid-cols-3">
          <div>
            <span className="font-medium">Waiting Time</span> = Completion - Arrival - Burst
          </div>
          <div>
            <span className="font-medium">Turnaround Time</span> = Completion - Arrival
          </div>
          <div>
            <span className="font-medium">Response Time</span> = First CPU Start - Arrival
          </div>
        </div>
      </div>
    </motion.div>
  );
}
