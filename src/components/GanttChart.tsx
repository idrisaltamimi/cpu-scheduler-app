import { useState, useEffect, useMemo, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GanttSegment } from '../types';
import { getProcessHexColor } from '../lib/colors';

interface GanttChartProps {
  segments: GanttSegment[];
  allPids: string[];
  totalTime: number;
}

interface TooltipData {
  segment: GanttSegment;
  x: number;
  y: number;
}

export function GanttChart({ segments, allPids, totalTime }: GanttChartProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const prevSegmentsRef = useRef<GanttSegment[]>([]);

  // Animation speed (ms per time unit)
  const SPEED = 200;

  // Reset animation when segments change (using ref comparison)
  useEffect(() => {
    if (prevSegmentsRef.current !== segments) {
      prevSegmentsRef.current = segments;
      setAnimationProgress(0);
      setIsPlaying(false);
    }
  }, [segments]);

  // Compute current segment index from progress (derived state, no useEffect)
  const currentSegmentIndex = useMemo(() => {
    if (animationProgress === 0) return -1;
    const idx = segments.findIndex(
      (seg) => animationProgress >= seg.start && animationProgress < seg.end
    );
    return idx !== -1 ? idx : segments.length - 1;
  }, [animationProgress, segments]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || segments.length === 0) return;

    const interval = setInterval(() => {
      setAnimationProgress((prev) => {
        const newProgress = prev + 0.1;
        if (newProgress >= totalTime) {
          setIsPlaying(false);
          return totalTime;
        }
        return newProgress;
      });
    }, SPEED / 10);

    return () => clearInterval(interval);
  }, [isPlaying, totalTime, segments.length]);

  const handlePlay = () => {
    if (animationProgress >= totalTime) {
      setAnimationProgress(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStep = () => {
    setIsPlaying(false);
    const nextSegment = segments[currentSegmentIndex + 1];
    if (nextSegment) {
      setAnimationProgress(nextSegment.start);
    } else if (segments.length > 0) {
      setAnimationProgress(totalTime);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setAnimationProgress(0);
  };

  // Generate time markers
  const timeMarkers = useMemo(() => {
    const markers: number[] = [];
    const step = totalTime <= 20 ? 1 : totalTime <= 50 ? 5 : 10;
    for (let i = 0; i <= totalTime; i += step) {
      markers.push(i);
    }
    if (markers[markers.length - 1] !== totalTime) {
      markers.push(totalTime);
    }
    return markers;
  }, [totalTime]);

  const getSegmentColor = (pid: string | null): string => {
    if (pid === null) {
      return '#9ca3af'; // gray-400
    }
    return getProcessHexColor(pid, allPids);
  };

  const handleMouseEnter = (
    e: React.MouseEvent<SVGRectElement>,
    segment: GanttSegment
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      segment,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  if (segments.length === 0) {
    return null;
  }

  const chartHeight = 80;
  const chartPadding = 40;
  const segmentHeight = 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gantt Chart
          </h2>
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handlePlay}
                className="btn-secondary flex items-center gap-1 text-sm py-1.5 px-3"
                title="Play animation"
              >
                <Play className="w-4 h-4" />
                Play
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="btn-secondary flex items-center gap-1 text-sm py-1.5 px-3"
                title="Pause animation"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            )}
            <button
              onClick={handleStep}
              className="btn-secondary flex items-center gap-1 text-sm py-1.5 px-3"
              title="Step forward"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="btn-secondary flex items-center gap-1 text-sm py-1.5 px-3"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 overflow-x-auto">
        <svg
          width={Math.max(600, totalTime * 30 + chartPadding * 2)}
          height={chartHeight + chartPadding}
          className="block"
        >
          {/* Time axis */}
          <line
            x1={chartPadding}
            y1={segmentHeight + 15}
            x2={chartPadding + totalTime * 30}
            y2={segmentHeight + 15}
            stroke="currentColor"
            className="text-gray-300 dark:text-gray-600"
            strokeWidth="2"
          />

          {/* Time markers */}
          {timeMarkers.map((time) => (
            <g key={time}>
              <line
                x1={chartPadding + time * 30}
                y1={segmentHeight + 10}
                x2={chartPadding + time * 30}
                y2={segmentHeight + 20}
                stroke="currentColor"
                className="text-gray-400 dark:text-gray-500"
                strokeWidth="1"
              />
              <text
                x={chartPadding + time * 30}
                y={segmentHeight + 35}
                textAnchor="middle"
                className="fill-gray-500 dark:fill-gray-400 text-xs"
              >
                {time}
              </text>
            </g>
          ))}

          {/* Segments */}
          {segments.map((segment, index) => {
            const x = chartPadding + segment.start * 30;
            const width = (segment.end - segment.start) * 30;
            const isActive = index === currentSegmentIndex;
            const isCompleted =
              animationProgress > 0 &&
              (index < currentSegmentIndex ||
                (index === currentSegmentIndex && animationProgress >= segment.end));
            const isIdle = segment.pid === null;

            return (
              <g key={`${segment.pid}-${segment.start}-${index}`}>
                {/* Segment background */}
                <rect
                  x={x}
                  y={5}
                  width={width}
                  height={segmentHeight}
                  rx={4}
                  fill={isCompleted || !isPlaying ? getSegmentColor(segment.pid) : '#e5e7eb'}
                  className={`transition-all duration-200 cursor-pointer ${
                    isActive && isPlaying ? 'animate-pulse-soft' : ''
                  }`}
                  style={{
                    opacity: isIdle ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => handleMouseEnter(e, segment)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Progress fill during animation */}
                {isActive && isPlaying && (
                  <rect
                    x={x}
                    y={5}
                    width={Math.max(0, (animationProgress - segment.start) * 30)}
                    height={segmentHeight}
                    rx={4}
                    fill={getSegmentColor(segment.pid)}
                    style={{
                      opacity: isIdle ? 0.5 : 1,
                    }}
                  />
                )}

                {/* Segment label */}
                {width >= 30 && (
                  <text
                    x={x + width / 2}
                    y={5 + segmentHeight / 2 + 5}
                    textAnchor="middle"
                    className="fill-white text-sm font-medium pointer-events-none"
                    style={{
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    {isIdle ? 'IDLE' : segment.pid}
                  </text>
                )}

                {/* Border */}
                <rect
                  x={x}
                  y={5}
                  width={width}
                  height={segmentHeight}
                  rx={4}
                  fill="none"
                  stroke={isActive && isPlaying ? '#3b82f6' : 'transparent'}
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Current time indicator */}
          {isPlaying && animationProgress > 0 && (
            <line
              x1={chartPadding + animationProgress * 30}
              y1={0}
              x2={chartPadding + animationProgress * 30}
              y2={segmentHeight + 10}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="4,2"
            />
          )}
        </svg>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          {allPids.map((pid) => (
            <div key={pid} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getProcessHexColor(pid, allPids) }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{pid}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded opacity-50"
              style={{ backgroundColor: '#9ca3af' }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">IDLE</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="fixed z-50 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y - 10,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-medium">
              {tooltip.segment.pid || 'IDLE'}
            </div>
            <div className="text-gray-300 text-xs">
              Start: {tooltip.segment.start} | End: {tooltip.segment.end}
            </div>
            <div className="text-gray-300 text-xs">
              Duration: {tooltip.segment.end - tooltip.segment.start} units
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
