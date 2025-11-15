export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-white">Settings</h1>
        <p className="text-lg text-white/80">Manage your focus plan and preferences</p>
      </div>

      {/* Plan Overview Card */}
      <div className="glass-card mb-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Current plan</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between border-b border-white/10 pb-3">
            <span className="text-white/70">Target daily focus time</span>
            <span className="font-medium text-white">180 minutes</span>
          </div>
          
          <div className="flex justify-between border-b border-white/10 pb-3">
            <span className="text-white/70">End date</span>
            <span className="font-medium text-white">Jan 18, 2026</span>
          </div>
          
          <div className="flex justify-between border-b border-white/10 pb-3">
            <span className="text-white/70">Training days</span>
            <span className="font-medium text-white">Monday - Friday</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-white/70">Total training days</span>
            <span className="font-medium text-white">30 days</span>
          </div>
        </div>
      </div>

      {/* Account Settings Card */}
      <div className="glass-card mb-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Account</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between border-b border-white/10 pb-3">
            <span className="text-white/70">Email</span>
            <span className="font-medium text-white">user@example.com</span>
          </div>
          
          <button className="btn-secondary">
            Change password
          </button>
        </div>
      </div>

      {/* Actions Card */}
      <div className="glass-card">
        <h2 className="mb-4 text-xl font-semibold text-white">Actions</h2>
        
        <div className="space-y-3">
          <button className="btn-secondary w-full justify-start">
            Pause current plan
          </button>
          <button className="btn-secondary w-full justify-start text-red-300 hover:text-red-200">
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}

