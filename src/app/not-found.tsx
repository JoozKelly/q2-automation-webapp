import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#020917' }}>
      <div className="text-center space-y-6 px-8 slide-up">
        <div className="space-y-1">
          <p className="text-[80px] font-black text-[#0f2040] leading-none stat-number">404</p>
          <p className="text-xl font-semibold text-slate-200">Page not found</p>
          <p className="text-sm text-[#4a5e78] mt-2">
            This page doesn&apos;t exist in the VANTAGE platform.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: '#6366f1', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
