import { useState, useEffect, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Header,
  ProcessTable,
  Controls,
  GanttChart,
  MetricsCards,
  ResultsTable
} from "./components"
import { simulateSchedule } from "./lib/scheduler"
import type { Process, Algorithm, SimulationResult } from "./types"

function App() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode")
      if (saved !== null) {
        return JSON.parse(saved)
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    return false
  })

  // Process list state
  const [processes, setProcesses] = useState<Process[]>([])

  // Algorithm state
  const [algorithm, setAlgorithm] = useState<Algorithm>("FCFS")
  const [quantum, setQuantum] = useState(2)

  // Simulation results
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
  }, [darkMode])

  // Custom handler for process changes that also clears results when needed
  const handleProcessesChange = (newProcesses: Process[]) => {
    setProcesses(newProcesses)
    // Clear results if all processes are removed
    if (newProcesses.length === 0 && result !== null) {
      setResult(null)
    }
  }

  // Get all PIDs for color mapping
  const allPids = useMemo(() => processes.map((p) => p.pid), [processes])

  // Check if we can run the simulation
  const canRun = useMemo(() => {
    return (
      processes.length > 0 &&
      processes.every(
        (p) =>
          p.pid.trim() !== "" && p.arrivalTime >= 0 && p.burstTime > 0 && p.priority >= 0
      )
    )
  }, [processes])

  // Run the simulation
  const handleRun = () => {
    if (!canRun) return

    setIsRunning(true)

    // Small delay for visual feedback
    setTimeout(() => {
      const simulationResult = simulateSchedule(processes, algorithm, quantum)
      setResult(simulationResult)
      setIsRunning(false)
    }, 300)
  }

  // Reset results
  const handleReset = () => {
    setResult(null)
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev: boolean) => !prev)
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
      <Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

      <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Process Input Section */}
          <ProcessTable
            processes={processes}
            onProcessesChange={handleProcessesChange}
            disabled={isRunning}
          />

          {/* Controls Section */}
          <Controls
            algorithm={algorithm}
            quantum={quantum}
            onAlgorithmChange={setAlgorithm}
            onQuantumChange={setQuantum}
            onRun={handleRun}
            onReset={handleReset}
            canRun={canRun && !isRunning}
            hasResults={result !== null}
          />

          {/* Loading indicator */}
          <AnimatePresence>
            {isRunning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-8"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-600 rounded-full border-t-transparent animate-spin" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Running simulation...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Section */}
          <AnimatePresence>
            {result && !isRunning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Metrics Cards */}
                <MetricsCards result={result} />

                {/* Gantt Chart */}
                <GanttChart
                  segments={result.ganttChart}
                  allPids={allPids}
                  totalTime={result.totalTime}
                />

                {/* Results Table */}
                <ResultsTable metrics={result.processMetrics} allPids={allPids} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!result && !isRunning && processes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full dark:bg-blue-900/30">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Get Started
              </h3>
              <p className="max-w-md mx-auto text-gray-500 dark:text-gray-400">
                Add processes to the table above, select a scheduling algorithm, and click
                "Run Simulation" to visualize the CPU scheduling.
              </p>
            </motion.div>
          )}

          {/* Ready to run state */}
          {!result && !isRunning && processes.length > 0 && canRun && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center"
            >
              <p className="text-gray-500 dark:text-gray-400">
                Click "Run Simulation" to start the scheduling algorithm.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-sm text-center text-gray-500 dark:text-gray-400">
            <p>CPU Scheduling Simulator - OS Fundamentals Demo</p>
            <p className="mt-1">Algorithms: FCFS | SJF | Priority | Round Robin</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
