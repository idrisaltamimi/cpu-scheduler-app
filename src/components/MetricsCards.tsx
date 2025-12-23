import { Clock, Timer, Zap, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SimulationResult } from '../types';

interface MetricsCardsProps {
  result: SimulationResult;
}

export function MetricsCards({ result }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Avg Waiting Time',
      value: result.averageWaitingTime.toFixed(2),
      unit: 'units',
      icon: Clock,
      color: 'blue',
      description: 'Average time processes spend waiting in ready queue',
    },
    {
      title: 'Avg Turnaround Time',
      value: result.averageTurnaroundTime.toFixed(2),
      unit: 'units',
      icon: Timer,
      color: 'emerald',
      description: 'Average time from arrival to completion',
    },
    {
      title: 'Avg Response Time',
      value: result.averageResponseTime.toFixed(2),
      unit: 'units',
      icon: Zap,
      color: 'amber',
      description: 'Average time from arrival to first CPU execution',
    },
    {
      title: 'CPU Utilization',
      value: result.cpuUtilization.toFixed(1),
      unit: '%',
      icon: Cpu,
      color: 'purple',
      description: 'Percentage of time CPU was busy',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; text: string }> = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        icon: 'text-blue-600 dark:text-blue-400',
        text: 'text-blue-600 dark:text-blue-400',
      },
      emerald: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        icon: 'text-emerald-600 dark:text-emerald-400',
        text: 'text-emerald-600 dark:text-emerald-400',
      },
      amber: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        icon: 'text-amber-600 dark:text-amber-400',
        text: 'text-amber-600 dark:text-amber-400',
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        icon: 'text-purple-600 dark:text-purple-400',
        text: 'text-purple-600 dark:text-purple-400',
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const colors = getColorClasses(card.color);
        const Icon = card.icon;

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="card p-4"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${colors.text}`}>
                  {card.value}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {card.unit}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                {card.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {card.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
