/**
 * Pure TypeScript ramp generator for 180 Focus.
 * Generates training dates, daily targets, and Pomodoro segments.
 */

export type TrainingDayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

/**
 * Custom error types for ramp generation failures
 */
export class RampValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RampValidationError';
  }
}

export class NoTrainingDaysError extends RampValidationError {
  constructor(message: string = 'No training days could be generated with the provided configuration') {
    super(message);
    this.name = 'NoTrainingDaysError';
  }
}

export interface FocusSegment {
  type: 'work' | 'break';
  minutes: number;
}

export interface FocusDayPlan {
  index: number;
  date: string;
  dailyTargetMinutes: number;
  segments: FocusSegment[];
}

export interface FocusPlanConfig {
  startDate: string;
  targetDailyMinutes: number;
  trainingDaysPerWeek: TrainingDayOfWeek[];
  startingDailyMinutes?: number;
  endDate?: string;
  trainingDaysCount?: number;
}

const DAY_MAP: Record<TrainingDayOfWeek, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/**
 * Computes all training dates between startDate and endDate (or until trainingDaysCount is reached).
 * Only includes dates that match the selected training days of the week.
 * 
 * @throws {RampValidationError} If configuration is invalid
 * @throws {NoTrainingDaysError} If no training dates can be generated
 */
export function getTrainingDates(config: FocusPlanConfig): string[] {
  const { startDate, trainingDaysPerWeek, endDate, trainingDaysCount } = config;
  
  // Validate training days per week is not empty
  if (!trainingDaysPerWeek || trainingDaysPerWeek.length === 0) {
    throw new RampValidationError('At least one training day per week must be selected');
  }
  
  const trainingDayIndices = trainingDaysPerWeek.map(day => DAY_MAP[day]);
  const start = new Date(startDate);
  const dates: string[] = [];
  
  let current = new Date(start);
  let maxDate: Date | null = null;
  
  if (endDate) {
    maxDate = new Date(endDate);
    
    // Validate end date is after start date
    if (maxDate <= start) {
      throw new RampValidationError('End date must be after start date');
    }
  }
  
  // Validate training days count if provided
  if (trainingDaysCount !== undefined && trainingDaysCount < 1) {
    throw new RampValidationError('Training days count must be at least 1');
  }
  
  // Generate dates until we hit the end date or reach the desired count
  const maxIterations = 1000;
  let iterations = 0;
  
  while (iterations < maxIterations) {
    const dayOfWeek = current.getDay();
    
    if (trainingDayIndices.includes(dayOfWeek)) {
      dates.push(current.toISOString().split('T')[0]);
      
      if (trainingDaysCount && dates.length >= trainingDaysCount) {
        break;
      }
    }
    
    if (maxDate && current >= maxDate) {
      break;
    }
    
    current.setDate(current.getDate() + 1);
    iterations++;
  }
  
  // Validate that at least one training date was generated
  if (dates.length === 0) {
    throw new NoTrainingDaysError(
      'No training days found in the specified date range with the selected days of week'
    );
  }
  
  return dates;
}

/**
 * Generates daily target minutes for each training date.
 * Creates a smooth, monotonic increase from starting level to target.
 * 
 * Edge cases handled:
 * - Single training day: returns target minutes directly
 * - Starting >= target: returns flat array at target level
 * - Very close values: ensures monotonic increase where mathematically possible
 */
export function generateDailyTargets(
  config: FocusPlanConfig,
  trainingDates: string[]
): number[] {
  const { targetDailyMinutes } = config;
  const n = trainingDates.length;
  
  // Edge case: no days (should not happen if getTrainingDates is used first)
  if (n === 0) return [];
  
  // Edge case: single training day - use target directly
  if (n === 1) return [targetDailyMinutes];
  
  const target = targetDailyMinutes;
  // New behavior: start the first day at the increment and reach target on the last day.
  // That is, for n days produce approximately: [target/n, 2*target/n, ..., target]
  const baseStep = target / n;
  
  const targets: number[] = [];
  
  for (let i = 1; i <= n; i++) {
    const rawValue = baseStep * i;
    // Round to nearest integer for intermediate days, ensure the last day is exactly target
    const value = i === n ? target : Math.round(rawValue);
    targets.push(value);
  }
  
  // Edge case: if rounding creates non-monotonic values (rare but possible),
  // ensure monotonicity by enforcing minimum increments
  for (let i = 1; i < targets.length; i++) {
    if (targets[i] < targets[i - 1]) {
      targets[i] = targets[i - 1];
    }
  }
  
  return targets;
}

/**
 * Builds a Pomodoro-style segment plan for a given daily target.
 * Rules:
 * - Work sessions are ideally 25 minutes and NEVER above 25 minutes
 * - Work sessions should ideally be at least 15 minutes (unless total time is too small)
 * - Only the last 1-2 sessions should be less than 25 minutes
 * - Standard break between work sessions is 5 minutes
 * - If totalMinutes < 20: no breaks, just work segments
 */
export function buildPomodoroSegmentsForDay(totalMinutes: number): FocusSegment[] {
  const MAX_SEGMENT_MIN = 25;
  const MIN_SEGMENT_MIN = 15;
  const BREAK_MIN = 5;
  
  // Edge case: no time
  if (totalMinutes <= 0) {
    return [];
  }
  
  // Short days: no breaks, single work segment
  if (totalMinutes < 20) {
    return [{ type: 'work', minutes: totalMinutes }];
  }
  
  // Calculate number of segments needed (each must be ≤ 25 minutes)
  const segmentCount = Math.ceil(totalMinutes / MAX_SEGMENT_MIN);
  
  // Start with all 25-minute segments
  const workSegmentMinutes: number[] = Array(segmentCount).fill(MAX_SEGMENT_MIN);
  
  // Calculate how much we need to reduce to match total
  let shortfall = segmentCount * MAX_SEGMENT_MIN - totalMinutes;
  
  // First pass: reduce from end, keeping segments at MIN_SEGMENT_MIN (15 min)
  for (let i = segmentCount - 1; i >= 0 && shortfall > 0; i--) {
    const maxReduction = workSegmentMinutes[i] - MIN_SEGMENT_MIN;
    const reduction = Math.min(maxReduction, shortfall);
    workSegmentMinutes[i] -= reduction;
    shortfall -= reduction;
  }
  
  // Second pass: if still shortfall, go below 15 minutes (necessary for small totals)
  for (let i = segmentCount - 1; i >= 0 && shortfall > 0; i--) {
    const maxReduction = workSegmentMinutes[i] - 1; // Keep at least 1 minute
    const reduction = Math.min(maxReduction, shortfall);
    workSegmentMinutes[i] -= reduction;
    shortfall -= reduction;
  }
  
  // Build segments array: work segments with breaks between them
  const segments: FocusSegment[] = [];
  for (let i = 0; i < segmentCount; i++) {
    segments.push({ type: 'work', minutes: workSegmentMinutes[i] });
    // Add break between work segments (not after the last one)
    if (i < segmentCount - 1) {
      segments.push({ type: 'break', minutes: BREAK_MIN });
    }
  }
  
  return segments;
}

/**
 * Generates the complete focus day plan for a given configuration.
 * Returns an array of FocusDayPlan with date, index, target minutes, and segments.
 * 
 * @throws {RampValidationError} If configuration is invalid
 * @throws {NoTrainingDaysError} If no training dates can be generated
 */
export function generateFocusDayPlans(config: FocusPlanConfig): FocusDayPlan[] {
  // Validate target daily minutes
  if (!config.targetDailyMinutes || config.targetDailyMinutes <= 0) {
    throw new RampValidationError('Target daily minutes must be greater than 0');
  }
  
  if (config.targetDailyMinutes > 480) {
    throw new RampValidationError('Target daily minutes cannot exceed 480 (8 hours)');
  }
  
  // Validate starting daily minutes if provided
  if (config.startingDailyMinutes !== undefined) {
    if (config.startingDailyMinutes < 0) {
      throw new RampValidationError('Starting daily minutes cannot be negative');
    }
    
    if (config.startingDailyMinutes > config.targetDailyMinutes) {
      throw new RampValidationError('Starting daily minutes cannot exceed target daily minutes');
    }
  }
  
  // Generate training dates (will throw if invalid)
  const trainingDates = getTrainingDates(config);
  const dailyTargets = generateDailyTargets(config, trainingDates);
  
  const dayPlans: FocusDayPlan[] = trainingDates.map((date, idx) => {
    const dailyTargetMinutes = dailyTargets[idx];
    const segments = buildPomodoroSegmentsForDay(dailyTargetMinutes);
    
    return {
      index: idx + 1, // 1-based day index
      date,
      dailyTargetMinutes,
      segments,
    };
  });
  
  return dayPlans;
}

