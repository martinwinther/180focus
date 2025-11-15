'use client';

import { useState, useEffect, useRef } from 'react';
import { usePomodoroTimer } from '@/lib/focus/usePomodoroTimer';
import { logCompletedWorkSegment } from '@/lib/firestore/sessionLogs';
import type { FocusSegment } from '@/lib/types/focusPlan';

interface PomodoroTimerProps {
  userId: string;
  planId: string;
  dayId: string;
  segments: FocusSegment[];
  dailyTargetMinutes: number;
  dayIndex: number;
  date: string;
}

export function PomodoroTimer({
  userId,
  planId,
  dayId,
  segments,
  dailyTargetMinutes,
  dayIndex,
  date,
}: PomodoroTimerProps) {
  const [isLoggingError, setIsLoggingError] = useState(false);
  const segmentStartTimesRef = useRef<Map<number, Date>>(new Map());

  const handleWorkSegmentStart = (segmentIndex: number, segment: FocusSegment) => {
    segmentStartTimesRef.current.set(segmentIndex, new Date());
  };

  const handleSegmentComplete = async (segmentIndex: number, segment: FocusSegment) => {
    // Only log work segments
    if (segment.type !== 'work') return;

    const startTime = segmentStartTimesRef.current.get(segmentIndex);
    if (!startTime) return;

    const endTime = new Date();
    const actualSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    try {
      await logCompletedWorkSegment({
        userId,
        planId,
        dayId,
        segmentIndex,
        segmentType: 'work',
        plannedMinutes: segment.minutes,
        actualSeconds,
        startedAt: startTime,
        endedAt: endTime,
      });

      // Clear the start time
      segmentStartTimesRef.current.delete(segmentIndex);
      setIsLoggingError(false);
    } catch (error) {
      console.error('Error logging work segment:', error);
      setIsLoggingError(true);
    }
  };

  const { state, controls } = usePomodoroTimer({
    segments,
    autoStartFirstWorkSegment: false,
    onSegmentComplete: handleSegmentComplete,
    onWorkSegmentStart: handleWorkSegmentStart,
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSegmentStatusIcon = (index: number) => {
    if (state.completedSegments.includes(index)) {
      return (
        <svg
          className="h-5 w-5 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    }
    
    if (index === state.currentIndex) {
      return (
        <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
      );
    }
    
    return null;
  };

  const completedWorkMinutes = segments
    .filter((_, idx) => state.completedSegments.includes(idx))
    .filter((seg) => seg.type === 'work')
    .reduce((sum, seg) => sum + seg.minutes, 0);

  const totalWorkMinutes = segments
    .filter((seg) => seg.type === 'work')
    .reduce((sum, seg) => sum + seg.minutes, 0);

  const progressPercentage = (completedWorkMinutes / totalWorkMinutes) * 100;

  return (
    <div className="space-y-6">
      {/* Main Timer Display */}
      <div className="glass-card text-center">
        <div className="mb-4">
          <div className="text-sm text-white/60">
            {state.currentSegment?.type === 'work' ? 'Focus Session' : 'Break Time'}
          </div>
          <div className="mt-2 text-7xl font-bold text-white tabular-nums">
            {formatTime(state.secondsRemaining)}
          </div>
          <div className="mt-2 text-white/70">
            Segment {state.currentIndex + 1} of {segments.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white/80 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-white/60">
            {completedWorkMinutes} of {totalWorkMinutes} work minutes completed
          </div>
        </div>

        {/* Controls */}
        {!state.isFinished ? (
          <div className="flex justify-center gap-3">
            {!state.isRunning ? (
              <button
                onClick={state.currentIndex === 0 && state.secondsRemaining === segments[0]?.minutes * 60 ? controls.start : controls.resume}
                className="btn-primary"
              >
                {state.currentIndex === 0 && state.secondsRemaining === segments[0]?.minutes * 60 ? (
                  <>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Start
                  </>
                ) : (
                  <>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Resume
                  </>
                )}
              </button>
            ) : (
              <button onClick={controls.pause} className="btn-secondary">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                Pause
              </button>
            )}

            <button
              onClick={controls.skipSegment}
              className="rounded-xl bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Skip
            </button>

            <button
              onClick={controls.reset}
              className="rounded-xl bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Reset
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <svg
                  className="h-8 w-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-white">
              Great work!
            </h3>
            <p className="mb-4 text-white/70">
              You've completed all segments for today.
            </p>
            <button onClick={controls.reset} className="btn-primary">
              Reset Timer
            </button>
          </div>
        )}

        {isLoggingError && (
          <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
            Warning: Some work sessions may not have been logged properly.
          </div>
        )}
      </div>

      {/* Segment List */}
      <div className="glass-card">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Today's Segments
        </h3>
        <div className="space-y-2">
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`flex items-center justify-between rounded-xl p-4 transition-all ${
                index === state.currentIndex
                  ? 'bg-white/20 ring-2 ring-white/30'
                  : state.completedSegments.includes(index)
                  ? 'bg-white/5 opacity-60'
                  : 'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    segment.type === 'work' ? 'bg-white/20' : 'bg-white/10'
                  }`}
                >
                  {segment.type === 'work' ? (
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-white/70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="font-medium text-white">
                    {segment.type === 'work' ? 'Work Session' : 'Break'}
                  </div>
                  <div className="text-sm text-white/60">
                    {segment.minutes} minutes
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getSegmentStatusIcon(index)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/60">Day {dayIndex} Target</div>
            <div className="text-lg font-bold text-white">
              {dailyTargetMinutes} minutes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

