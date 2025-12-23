import { useState } from 'react';
import { Plus, Trash2, Upload, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Process } from '../types';
import { validateProcess, getExampleProcesses } from '../lib/scheduler';
import { getProcessColor } from '../lib/colors';

interface ProcessTableProps {
  processes: Process[];
  onProcessesChange: (processes: Process[]) => void;
  disabled?: boolean;
}

interface EditingCell {
  index: number;
  field: 'pid' | 'arrivalTime' | 'burstTime' | 'priority';
}

export function ProcessTable({
  processes,
  onProcessesChange,
  disabled = false,
}: ProcessTableProps) {
  const [errors, setErrors] = useState<Map<number, string[]>>(new Map());
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

  const allPids = processes.map((p) => p.pid);

  const addProcess = () => {
    const newPid = `P${processes.length + 1}`;
    const newProcess: Process = {
      pid: newPid,
      arrivalTime: 0,
      burstTime: 1,
      priority: 1,
      insertionOrder: processes.length,
    };
    onProcessesChange([...processes, newProcess]);
  };

  const updateProcess = (index: number, field: keyof Process, value: string | number) => {
    const updated = [...processes];
    if (field === 'pid') {
      updated[index] = { ...updated[index], [field]: value as string };
    } else {
      const numValue = typeof value === 'string' ? parseInt(value, 10) || 0 : value;
      updated[index] = { ...updated[index], [field]: numValue };
    }

    // Validate
    const validation = validateProcess(updated[index]);
    const newErrors = new Map(errors);
    if (!validation.valid) {
      newErrors.set(index, validation.errors);
    } else {
      newErrors.delete(index);
    }
    setErrors(newErrors);

    onProcessesChange(updated);
  };

  const deleteProcess = (index: number) => {
    const updated = processes.filter((_, i) => i !== index);
    // Update insertion orders
    const reordered = updated.map((p, i) => ({ ...p, insertionOrder: i }));
    onProcessesChange(reordered);

    // Clear errors for deleted process
    const newErrors = new Map(errors);
    newErrors.delete(index);
    setErrors(newErrors);
  };

  const loadExample = () => {
    onProcessesChange(getExampleProcesses());
    setErrors(new Map());
  };

  const clearAll = () => {
    onProcessesChange([]);
    setErrors(new Map());
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    field: 'pid' | 'arrivalTime' | 'burstTime' | 'priority'
  ) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      setEditingCell(null);
    }
    if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Process Input
          </h2>
          <div className="flex gap-2">
            <button
              onClick={loadExample}
              disabled={disabled}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Upload className="w-4 h-4" />
              Load Example
            </button>
            <button
              onClick={clearAll}
              disabled={disabled || processes.length === 0}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={addProcess}
              disabled={disabled}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Process
            </button>
          </div>
        </div>
      </div>

      {processes.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p className="mb-2">No processes added yet.</p>
          <p className="text-sm">
            Click "Add Process" to create a new process, or "Load Example" to use sample data.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header w-12">#</th>
                <th className="table-header">Process ID</th>
                <th className="table-header">Arrival Time</th>
                <th className="table-header">Burst Time</th>
                <th className="table-header">Priority</th>
                <th className="table-header w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {processes.map((process, index) => {
                  const color = getProcessColor(process.pid, allPids);
                  const hasErrors = errors.has(index);

                  return (
                    <motion.tr
                      key={process.pid + index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`group hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        hasErrors ? 'bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                    >
                      <td className="table-cell">
                        <div
                          className={`w-6 h-6 rounded-full ${color.bg} flex items-center justify-center text-white text-xs font-medium`}
                        >
                          {index + 1}
                        </div>
                      </td>
                      <td className="table-cell">
                        {editingCell?.index === index && editingCell?.field === 'pid' ? (
                          <input
                            type="text"
                            value={process.pid}
                            onChange={(e) => updateProcess(index, 'pid', e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'pid')}
                            className="input py-1 text-sm"
                            autoFocus
                            disabled={disabled}
                          />
                        ) : (
                          <button
                            onClick={() => setEditingCell({ index, field: 'pid' })}
                            className="font-mono font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                            disabled={disabled}
                          >
                            {process.pid}
                          </button>
                        )}
                      </td>
                      <td className="table-cell">
                        {editingCell?.index === index && editingCell?.field === 'arrivalTime' ? (
                          <input
                            type="number"
                            min="0"
                            value={process.arrivalTime}
                            onChange={(e) => updateProcess(index, 'arrivalTime', e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'arrivalTime')}
                            className="input py-1 text-sm w-20"
                            autoFocus
                            disabled={disabled}
                          />
                        ) : (
                          <button
                            onClick={() => setEditingCell({ index, field: 'arrivalTime' })}
                            className="font-mono hover:text-blue-600 dark:hover:text-blue-400"
                            disabled={disabled}
                          >
                            {process.arrivalTime}
                          </button>
                        )}
                      </td>
                      <td className="table-cell">
                        {editingCell?.index === index && editingCell?.field === 'burstTime' ? (
                          <input
                            type="number"
                            min="1"
                            value={process.burstTime}
                            onChange={(e) => updateProcess(index, 'burstTime', e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'burstTime')}
                            className="input py-1 text-sm w-20"
                            autoFocus
                            disabled={disabled}
                          />
                        ) : (
                          <button
                            onClick={() => setEditingCell({ index, field: 'burstTime' })}
                            className="font-mono hover:text-blue-600 dark:hover:text-blue-400"
                            disabled={disabled}
                          >
                            {process.burstTime}
                          </button>
                        )}
                      </td>
                      <td className="table-cell">
                        {editingCell?.index === index && editingCell?.field === 'priority' ? (
                          <input
                            type="number"
                            min="0"
                            value={process.priority}
                            onChange={(e) => updateProcess(index, 'priority', e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'priority')}
                            className="input py-1 text-sm w-20"
                            autoFocus
                            disabled={disabled}
                          />
                        ) : (
                          <button
                            onClick={() => setEditingCell({ index, field: 'priority' })}
                            className="font-mono hover:text-blue-600 dark:hover:text-blue-400"
                            disabled={disabled}
                          >
                            {process.priority}
                          </button>
                        )}
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => deleteProcess(index)}
                          disabled={disabled}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          aria-label={`Delete process ${process.pid}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Error display */}
      {errors.size > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Validation Errors:</p>
              <ul className="mt-1 list-disc list-inside">
                {Array.from(errors.entries()).map(([index, errs]) =>
                  errs.map((err, i) => (
                    <li key={`${index}-${i}`}>
                      {processes[index]?.pid || `Process ${index + 1}`}: {err}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Hint */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tip: Click on any value to edit it. Priority: lower number = higher priority.
        </p>
      </div>
    </motion.div>
  );
}
