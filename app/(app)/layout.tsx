import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Focus Ramp - Your Training Dashboard',
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo / Brand */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
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
              </div>
              <span className="text-lg font-semibold text-white">Focus Ramp</span>
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/today" className="nav-link nav-link-active">
                Today
              </Link>
              <Link href="/history" className="nav-link">
                History
              </Link>
              <Link href="/settings" className="nav-link">
                Settings
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-sm font-semibold text-white shadow-lg ring-2 ring-white/20">
                M
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 md:hidden">
        <div className="glass-nav flex items-center gap-1 px-2 py-2">
          <Link href="/today" className="nav-link nav-link-active">
            Today
          </Link>
          <Link href="/history" className="nav-link">
            History
          </Link>
          <Link href="/settings" className="nav-link">
            Settings
          </Link>
        </div>
      </nav>
    </div>
  );
}

