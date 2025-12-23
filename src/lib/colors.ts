import { PROCESS_COLORS, PROCESS_HEX_COLORS, type ProcessColor } from '../types';

/**
 * Get a consistent color for a process based on its PID
 */
export function getProcessColor(pid: string, allPids: string[]): ProcessColor {
  const index = allPids.indexOf(pid);
  return PROCESS_COLORS[index % PROCESS_COLORS.length];
}

/**
 * Get a hex color for a process (for charts)
 */
export function getProcessHexColor(pid: string, allPids: string[]): string {
  const index = allPids.indexOf(pid);
  return PROCESS_HEX_COLORS[index % PROCESS_HEX_COLORS.length];
}

/**
 * Get the idle segment color
 */
export function getIdleColor(): ProcessColor {
  return {
    bg: 'bg-gray-300 dark:bg-gray-600',
    border: 'border-gray-400 dark:border-gray-500',
    text: 'text-gray-500 dark:text-gray-400',
  };
}

/**
 * Generate a color map for all processes
 */
export function generateColorMap(pids: string[]): Map<string, string> {
  const map = new Map<string, string>();
  pids.forEach((pid, index) => {
    map.set(pid, PROCESS_HEX_COLORS[index % PROCESS_HEX_COLORS.length]);
  });
  return map;
}
