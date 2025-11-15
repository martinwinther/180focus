export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-white">History</h1>
        <p className="text-lg text-white/80">Your focus training progress</p>
      </div>

      {/* Main Card */}
      <div className="glass-card">
        <h2 className="mb-6 text-xl font-semibold text-white">Recent days</h2>
        
        <div className="space-y-3">
          {/* Placeholder for history entries */}
          <div className="rounded-xl bg-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Day 7 - Nov 14, 2025</div>
                <div className="text-sm text-white/60">45 minutes completed</div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                ✓
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Day 6 - Nov 13, 2025</div>
                <div className="text-sm text-white/60">40 minutes completed</div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                ✓
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Day 5 - Nov 12, 2025</div>
                <div className="text-sm text-white/60">35 minutes completed</div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                ✓
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-white/60">
          More history entries will appear here as you progress
        </div>
      </div>
    </div>
  );
}

