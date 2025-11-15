export default function TodayPage() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-white">Today</h1>
        <p className="text-lg text-white/80">Day 1 of your focus training plan</p>
      </div>

      {/* Main Card */}
      <div className="glass-card">
        {/* Daily Target */}
        <div className="mb-8 text-center">
          <div className="mb-2 text-sm font-medium uppercase tracking-wider text-white/60">
            Today&apos;s target
          </div>
          <div className="text-6xl font-bold text-white">25</div>
          <div className="text-lg text-white/80">minutes</div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-white/80">
            <span>Progress</span>
            <span>0 / 25 min</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-light to-primary transition-all duration-500"
              style={{ width: '0%' }}
            />
          </div>
        </div>

        {/* Session Breakdown */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Today&apos;s sessions</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary-light">
                🎯
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">Work Session</div>
                <div className="text-sm text-white/60">25 minutes</div>
              </div>
              <div className="text-sm font-medium text-white/80">Up next</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button className="btn-primary w-full sm:w-auto">
            Start first session
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="glass-card text-center">
          <div className="mb-1 text-2xl font-bold text-white">7</div>
          <div className="text-sm text-white/70">Day streak</div>
        </div>
        <div className="glass-card text-center">
          <div className="mb-1 text-2xl font-bold text-white">180</div>
          <div className="text-sm text-white/70">Target (min)</div>
        </div>
        <div className="glass-card text-center">
          <div className="mb-1 text-2xl font-bold text-white">23</div>
          <div className="text-sm text-white/70">Days remaining</div>
        </div>
      </div>
    </div>
  );
}

