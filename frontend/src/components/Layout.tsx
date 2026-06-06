import { Outlet, NavLink, Link } from 'react-router-dom';
import { FlaskConical, LayoutDashboard, PlusCircle, BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-indigo-600 text-lg tracking-tight">
            <FlaskConical className="w-5 h-5" />
            Splitly
            <span className="text-xs font-normal text-slate-400 hidden sm:inline ml-1">A/B Testing</span>
          </Link>
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setShowGuide((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">How it works</span>
            </button>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </NavLink>
            <Link
              to="/experiments/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors ml-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Experiment</span>
            </Link>
          </nav>
        </div>

        {/* How it works drawer */}
        {showGuide && (
          <div className="border-t border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800">How A/B Testing Works</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Test two versions of something and let data decide the winner</p>
                </div>
                <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { step: '1', icon: '🧪', title: 'Create Experiment', desc: 'Define what you want to test and set up two or more variants (versions)' },
                  { step: '2', icon: '🌐', title: 'Add to Your Site', desc: 'Paste the tracking snippet into your website — visitors are split automatically' },
                  { step: '3', icon: '📊', title: 'Collect Data', desc: 'Splitly tracks which variant each visitor sees and whether they convert' },
                  { step: '4', icon: '🏆', title: 'Pick the Winner', desc: 'Once results are statistically significant, implement the winning variant' },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.step}</div>
                    <div>
                      <div className="text-base mb-1">{s.icon}</div>
                      <p className="text-xs font-semibold text-slate-800">{s.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Splitly A/B Testing Platform — Make decisions with data, not guesses
      </footer>
    </div>
  );
}
