import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FlaskConical, Users, TrendingUp, Play, Pause, Archive,
  Trash2, ChevronRight, Sparkles, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { api } from '../api';
import type { Experiment, ExperimentStatus } from '../types';
import StatusBadge from '../components/StatusBadge';

const TABS: { label: string; value: ExperimentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Paused', value: 'paused' },
  { label: 'Completed', value: 'completed' },
];

const ONG_EXAMPLES = [
  {
    icon: '⛽',
    title: 'Safety Training Portal',
    test: 'Video modules vs Text modules',
    goal: 'Quiz completion rate',
    result: '+42% — video wins',
    color: 'emerald',
  },
  {
    icon: '🔧',
    title: 'Field Service Request Form',
    test: '5-field form vs 12-field form',
    goal: 'Form submission rate',
    result: '+28% — shorter form wins',
    color: 'sky',
  },
  {
    icon: '📋',
    title: 'Maintenance Alert Design',
    test: 'Push notification vs Email alert',
    goal: 'Alert acknowledgement',
    result: '+61% — push notification wins',
    color: 'violet',
  },
  {
    icon: '💼',
    title: 'Vendor Bid Portal',
    test: 'Cost-savings headline vs Reliability headline',
    goal: 'RFQ submissions',
    result: 'No winner — need more data',
    color: 'amber',
  },
];

export default function Dashboard() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ExperimentStatus | 'all'>('all');
  const [error, setError] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  const load = () => {
    setLoading(true);
    api
      .getExperiments()
      .then(setExperiments)
      .catch(() => setError('Cannot connect to backend. Make sure the API server is running on port 3001.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (e: React.MouseEvent, exp: Experiment, status: ExperimentStatus) => {
    e.preventDefault();
    await api.updateStatus(exp.id, status);
    load();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm('Delete this experiment and all its data?')) return;
    await api.deleteExperiment(id);
    load();
  };

  const handleSeedScenarios = async () => {
    setSeeding(true);
    setSeedMsg('');
    try {
      await fetch('/api/demo/seed-scenarios', { method: 'POST' });
      setSeedMsg('✅ 3 Oil & Gas demo scenarios loaded! Click any experiment to explore the results.');
      load();
    } catch {
      setSeedMsg('❌ Failed — make sure the backend is running.');
    } finally {
      setSeeding(false);
    }
  };

  const filtered = tab === 'all' ? experiments : experiments.filter((e) => e.status === tab);
  const isEmpty = !loading && experiments.length === 0;

  const stats = {
    total: experiments.length,
    active: experiments.filter((e) => e.status === 'active').length,
    impressions: experiments.reduce((s, e) => s + (e.totalImpressions ?? 0), 0),
    conversions: experiments.reduce((s, e) => s + (e.totalConversions ?? 0), 0),
  };

  // ── WELCOME SCREEN (no experiments yet) ────────────────────────────────────
  if (isEmpty) {
    return (
      <div>
        {/* Hero */}
        <div className="text-center py-12 px-4">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <FlaskConical className="w-3.5 h-3.5" /> A/B Testing Platform
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
            Make decisions with <span className="text-indigo-600">data</span>,<br />not guesswork
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto mb-8">
            Splitly lets you test two versions of anything — a button, a headline, a form — and tells
            you which one actually performs better using real visitor data and statistics.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={handleSeedScenarios}
              disabled={seeding}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 shadow-lg shadow-indigo-200"
            >
              <Sparkles className="w-4 h-4" />
              {seeding ? 'Loading examples…' : 'See Live Oil & Gas Examples →'}
            </button>
            <Link
              to="/experiments/new"
              className="flex items-center gap-2 px-6 py-3 border-2 border-slate-200 hover:border-indigo-300 bg-white text-slate-700 rounded-xl font-semibold text-sm transition-colors"
            >
              <FlaskConical className="w-4 h-4" />
              Create My First Experiment
            </Link>
          </div>

          {seedMsg && (
            <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 inline-block">{seedMsg}</p>
          )}
        </div>

        {/* How it works steps */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 text-center mb-6">How Splitly works — 4 simple steps</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { step: 1, icon: '🧪', title: 'Create an Experiment', desc: 'Name your test, write your hypothesis, and define your variants (Version A vs Version B).' },
              { step: 2, icon: '🌐', title: 'Add to Your Website', desc: 'Copy the tracking snippet and paste it into your page. Visitors are split automatically.' },
              { step: 3, icon: '📊', title: 'Collect Real Data', desc: 'Splitly tracks impressions (who sees what) and conversions (who takes action).' },
              { step: 4, icon: '🏆', title: 'Pick the Winner', desc: 'When results reach 95% confidence, you know with certainty which version is better.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                  {s.step}
                </div>
                <div className="text-3xl mb-2">{s.icon}</div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Oil & Gas examples */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-slate-800">⛽ A/B Testing in Oil & Gas Industry</h2>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Real Examples</span>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Oil & gas companies use A/B testing on digital tools to improve safety compliance, operational efficiency, and vendor engagement.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ONG_EXAMPLES.map((ex) => (
              <div key={ex.title} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="text-2xl mb-2">{ex.icon}</div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">{ex.title}</h3>
                <p className="text-xs text-slate-500 mb-2">Testing: {ex.test}</p>
                <p className="text-xs text-slate-400 mb-2">Goal: {ex.goal}</p>
                <span className={`text-xs font-semibold text-${ex.color}-700 bg-${ex.color}-50 px-2 py-0.5 rounded-full`}>
                  {ex.result}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick start CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Ready to start testing?</h2>
          <p className="text-indigo-200 text-sm mb-5">Load the Oil & Gas demo scenarios to explore real results instantly, or create your own experiment.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={handleSeedScenarios}
              disabled={seeding}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Load O&G Demo Scenarios
            </button>
            <Link
              to="/experiments/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-semibold text-sm transition-colors border border-indigo-400"
            >
              Create Experiment <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── DASHBOARD (experiments exist) ──────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Experiments</h1>
          <p className="text-slate-500 text-sm mt-0.5">Click any experiment to view results and next steps</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSeedScenarios}
            disabled={seeding}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            {seeding ? 'Loading…' : 'Load O&G Demos'}
          </button>
          <Link
            to="/experiments/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <FlaskConical className="w-4 h-4" /> New Experiment
          </Link>
        </div>
      </div>

      {/* Seed message */}
      {seedMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 mb-5 text-sm">{seedMsg}</div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-5 text-sm">{error}</div>
      )}

      {/* O&G context banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <span className="text-2xl shrink-0">⛽</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">Oil & Gas A/B Testing Examples loaded</p>
          <p className="text-xs text-amber-700 mt-0.5">
            These experiments simulate real O&G digital scenarios — safety training portals, field service forms, and maintenance alerts.
            Click each one to see the statistical results and what decision to make.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Experiments', value: stats.total, icon: FlaskConical, color: 'indigo', tip: 'Total number of A/B tests in your account' },
          { label: 'Active Tests', value: stats.active, icon: Play, color: 'emerald', tip: 'Currently running experiments collecting live data' },
          { label: 'Total Impressions', value: stats.impressions.toLocaleString(), icon: Users, color: 'violet', tip: 'Total number of times visitors were assigned to a variant' },
          { label: 'Total Conversions', value: stats.conversions.toLocaleString(), icon: TrendingUp, color: 'sky', tip: 'Total number of times visitors completed the goal action' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className={`inline-flex p-2 rounded-lg bg-${color}-50 mb-3`}>
              <Icon className={`w-4 h-4 text-${color}-600`} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* What to do guide */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick Guide — What to do with each experiment</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🟢', label: 'Active', action: 'Let it run. Come back once it has 100+ visitors per variant.' },
            { icon: '🏆', label: 'Has a Winner', action: 'Implement the winning variant on your website. Mark as Completed.' },
            { icon: '❓', label: 'Not Significant', action: 'Collect more data or try a bigger difference between variants.' },
          ].map((g) => (
            <div key={g.label} className="flex gap-2">
              <span className="text-base shrink-0">{g.icon}</span>
              <div>
                <p className="text-xs font-semibold text-slate-700">{g.label}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{g.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.value
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
            {t.value !== 'all' && (
              <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                {experiments.filter((e) => e.status === t.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Experiment list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14">
          <FlaskConical className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No {tab !== 'all' ? tab : ''} experiments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((exp) => {
            const totalImp = exp.totalImpressions ?? 0;
            const totalConv = exp.totalConversions ?? 0;
            const rate = totalImp > 0 ? ((totalConv / totalImp) * 100).toFixed(1) + '%' : '—';
            const needsData = totalImp < 200;
            const isOng = ['⛽', '🔧', '📋', '💼', '🛡️'].some((e) => exp.name.includes(e));

            return (
              <Link
                key={exp.id}
                to={`/experiments/${exp.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StatusBadge status={exp.status} />
                      <span className="text-xs text-slate-400">{exp.variants.length} variants</span>
                      {isOng && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⛽ O&G Demo</span>}
                      {totalImp >= 100 && exp.status === 'active' && !needsData && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Enough data to review
                        </span>
                      )}
                      {needsData && exp.status === 'active' && (
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">⏳ Collecting data…</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                      {exp.name}
                    </h3>
                    {exp.hypothesis && (
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{exp.hypothesis}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{totalImp.toLocaleString()} visitors</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />{rate} overall conversion</span>
                      <span>{new Date(exp.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {exp.status === 'draft' && (
                      <button title="Start collecting data" onClick={(e) => handleStatus(e, exp, 'active')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {exp.status === 'active' && (<>
                      <button title="Pause experiment" onClick={(e) => handleStatus(e, exp, 'paused')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                        <Pause className="w-4 h-4" />
                      </button>
                      <button title="Mark as completed" onClick={(e) => handleStatus(e, exp, 'completed')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Archive className="w-4 h-4" />
                      </button>
                    </>)}
                    {exp.status === 'paused' && (
                      <button title="Resume" onClick={(e) => handleStatus(e, exp, 'active')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    <button title="Delete experiment" onClick={(e) => handleDelete(e, exp.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300 ml-1 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
