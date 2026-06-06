import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Play, Pause, Archive, Trash2, Code2, Database,
  TrendingUp, Users, Target, Trophy, AlertCircle, CheckCircle2,
  Clock, BarChart3, Lightbulb,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { api } from '../api';
import type { Experiment, Variant } from '../types';
import StatusBadge from '../components/StatusBadge';
import SnippetModal from '../components/SnippetModal';
import HelpTip from '../components/HelpTip';

const COLORS = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e'];

// ── Life‑cycle progress bar ───────────────────────────────────────────────────
const LIFECYCLE = ['Draft', 'Active', 'Collecting Data', 'Results Ready', 'Decision Made'];

function LifecycleBar({ exp, totalImp }: { exp: Experiment; totalImp: number }) {
  let activeStep = 0;
  if (exp.status === 'draft') activeStep = 0;
  else if (exp.status === 'active' && totalImp < 100) activeStep = 1;
  else if (exp.status === 'active' && totalImp < 200) activeStep = 2;
  else if (exp.status === 'active') activeStep = 3;
  else activeStep = 4;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Experiment Progress</p>
      <div className="flex items-center gap-0">
        {LIFECYCLE.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < activeStep ? 'bg-emerald-500 border-emerald-500 text-white'
                : i === activeStep ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white border-slate-300 text-slate-400'
              }`}>
                {i < activeStep ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs mt-1 text-center leading-tight ${i === activeStep ? 'text-indigo-700 font-semibold' : 'text-slate-400'}`} style={{ fontSize: 10 }}>
                {label}
              </span>
            </div>
            {i < LIFECYCLE.length - 1 && (
              <div className={`h-0.5 flex-1 -mt-4 mx-1 ${i < activeStep ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Next‑step recommendation ──────────────────────────────────────────────────
function NextStepBox({ exp, totalImp, winner }: { exp: Experiment; totalImp: number; winner: Variant | undefined }) {
  if (exp.status === 'draft') return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
      <span className="text-2xl shrink-0">🚀</span>
      <div>
        <p className="font-semibold text-blue-800 text-sm">Next step: Start this experiment</p>
        <p className="text-blue-700 text-xs mt-1 leading-relaxed">
          Click the <strong>Start</strong> button above to activate this experiment. Once active, copy the
          <strong> Snippet</strong> and add it to your website so Splitly can begin tracking visitors.
        </p>
      </div>
    </div>
  );

  if (exp.status === 'active' && totalImp < 100) return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
      <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-amber-800 text-sm">Collecting data — come back soon</p>
        <p className="text-amber-700 text-xs mt-1 leading-relaxed">
          You have <strong>{totalImp} visitors</strong> so far. Statistical results require at least
          <strong> 100 visitors per variant</strong> (200 total). Keep the experiment running and check back once you have more traffic.
          If traffic is slow, make sure the snippet is correctly installed.
        </p>
      </div>
    </div>
  );

  if (exp.status === 'active' && winner) return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex gap-3">
      <Trophy className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-emerald-800 text-sm">
          You have a winner — {winner.name} (+{winner.stats?.relativeImprovement}% improvement)
        </p>
        <p className="text-emerald-700 text-xs mt-1 leading-relaxed">
          Results are statistically significant at <strong>{winner.stats?.confidence.toFixed(0)}% confidence</strong>.
          You can now: (1) <strong>Implement</strong> the winning variant permanently on your website,
          (2) <strong>Complete</strong> this experiment to archive it, and (3) Start a new experiment to test the next hypothesis.
        </p>
      </div>
    </div>
  );

  if (exp.status === 'active' && totalImp >= 200) return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex gap-3">
      <BarChart3 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-slate-700 text-sm">Results not yet significant — keep running</p>
        <p className="text-slate-600 text-xs mt-1 leading-relaxed">
          You have enough visitors but no variant has reached <strong>95% confidence</strong> yet.
          This means the difference between variants is small and could be due to chance.
          Continue running the test, or try making a <strong>bigger visual difference</strong> between variants in your next experiment.
        </p>
      </div>
    </div>
  );

  if (exp.status === 'paused') return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
      <Pause className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-amber-800 text-sm">Experiment is paused</p>
        <p className="text-amber-700 text-xs mt-1">Click <strong>Resume</strong> to continue collecting data, or <strong>Complete</strong> it if you have enough results.</p>
      </div>
    </div>
  );

  if (exp.status === 'completed') return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-blue-800 text-sm">Experiment completed</p>
        <p className="text-blue-700 text-xs mt-1">
          This experiment is archived. Review the final results below and make sure the winning variant has been implemented on your website.
        </p>
      </div>
    </div>
  );

  return null;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ExperimentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exp, setExp] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSnippet, setShowSnippet] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    api.getExperiment(id).then(setExp).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleStatus = async (status: Experiment['status']) => {
    if (!id) return;
    await api.updateStatus(id, status);
    load();
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this experiment and all its data?')) return;
    await api.deleteExperiment(id);
    navigate('/');
  };

  const handleSeed = async () => {
    if (!id) return;
    setSeeding(true);
    await api.seedData(id);
    load();
    setSeeding(false);
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-1/3" />
      <div className="h-4 bg-slate-100 rounded w-2/3" />
      <div className="grid grid-cols-4 gap-4 mt-8">{[1,2,3,4].map((i) => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}</div>
    </div>
  );

  if (!exp) return (
    <div className="text-center py-20">
      <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
      <p className="font-medium text-slate-700">Experiment not found</p>
      <Link to="/" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">← Back to Dashboard</Link>
    </div>
  );

  const totalImp = exp.variants.reduce((s, v) => s + (v.impressions ?? 0), 0);
  const totalConv = exp.variants.reduce((s, v) => s + (v.conversions ?? 0), 0);
  const overallRate = totalImp > 0 ? ((totalConv / totalImp) * 100).toFixed(2) : '—';

  // chart data
  const chartMap: Record<string, Record<string, number>> = {};
  (exp.daily ?? []).forEach(({ day, variant_id, event_type, count }) => {
    if (!chartMap[day]) chartMap[day] = {};
    const v = exp.variants.find((v) => v.id === variant_id);
    if (!v) return;
    chartMap[day]['day'] = day as unknown as number;
    const key = `${v.name}_${event_type}`;
    chartMap[day][key] = (chartMap[day][key] ?? 0) + count;
  });
  const chartData = Object.values(chartMap).sort((a, b) => String(a.day).localeCompare(String(b.day)));

  const winner = exp.variants
    .filter((v) => !v.is_control && v.stats?.significant && (v.stats?.relativeImprovement ?? 0) > 0)
    .sort((a, b) => (b.stats?.relativeImprovement ?? 0) - (a.stats?.relativeImprovement ?? 0))[0];

  const loser = !winner && exp.variants.find(
    (v) => !v.is_control && v.stats?.significant && (v.stats?.relativeImprovement ?? 0) < 0
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{exp.name}</h1>
            <StatusBadge status={exp.status} />
          </div>
          {exp.hypothesis && <p className="text-slate-500 text-sm mt-1 max-w-xl">{exp.hypothesis}</p>}
          {exp.goal && (
            <p className="text-xs text-indigo-600 mt-1.5 flex items-center gap-1">
              <Target className="w-3 h-3" /> <strong>Goal:</strong> {exp.goal}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowSnippet(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            title="Get the JavaScript code to add to your website">
            <Code2 className="w-4 h-4" /> Get Snippet
          </button>
          <button onClick={handleSeed} disabled={seeding}
            title="Load realistic demo data to see what results look like"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60">
            <Database className="w-4 h-4" /> {seeding ? 'Loading…' : 'Load Sample Data'}
          </button>
          {exp.status === 'draft' && (
            <button onClick={() => handleStatus('active')}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors">
              <Play className="w-4 h-4" /> Start Experiment
            </button>
          )}
          {exp.status === 'active' && (<>
            <button onClick={() => handleStatus('paused')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors">
              <Pause className="w-4 h-4" /> Pause
            </button>
            <button onClick={() => handleStatus('completed')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Archive className="w-4 h-4" /> Mark Complete
            </button>
          </>)}
          {exp.status === 'paused' && (
            <button onClick={() => handleStatus('active')}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors">
              <Play className="w-4 h-4" /> Resume
            </button>
          )}
          <button onClick={handleDelete}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete experiment">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lifecycle bar */}
      <LifecycleBar exp={exp} totalImp={totalImp} />

      {/* Next step recommendation */}
      <NextStepBox exp={exp} totalImp={totalImp} winner={winner} />

      {/* Loser banner */}
      {loser && !winner && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
          <span className="text-xl shrink-0">📉</span>
          <div>
            <p className="font-semibold text-red-800 text-sm">{loser.name} performed worse than control</p>
            <p className="text-red-700 text-xs mt-1">
              This variant is statistically significantly <strong>worse</strong> than control at {loser.stats?.confidence.toFixed(0)}% confidence.
              Stick with the Control version and try a different approach.
            </p>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Visitors', value: totalImp.toLocaleString(), icon: Users, tip: 'Total number of unique visitors assigned to any variant across all experiment variants' },
          { label: 'Total Conversions', value: totalConv.toLocaleString(), icon: Target, tip: 'Number of visitors who completed the goal action (e.g., clicked the button, submitted the form)' },
          { label: 'Overall Conv. Rate', value: `${overallRate}%`, icon: TrendingUp, tip: 'Total conversions ÷ total visitors across all variants. Compare per-variant rates in the table below.' },
          { label: 'Variants Running', value: exp.variants.length, icon: Trophy, tip: 'Number of different versions being tested simultaneously' },
        ].map(({ label, value, icon: Icon, tip }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-1 mb-2">
              <Icon className="w-4 h-4 text-slate-400" />
              <HelpTip text={tip} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* No data prompt */}
      {totalImp === 0 && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 mb-8 text-center">
          <Database className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="font-semibold text-slate-600 mb-1">No data yet</p>
          <p className="text-sm text-slate-500 mb-4">
            Start the experiment and add the tracking snippet to your website, or click <strong>Load Sample Data</strong> to see what results look like.
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={handleSeed}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              <Database className="w-4 h-4" /> Load Sample Data
            </button>
            <button onClick={() => setShowSnippet(true)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <Code2 className="w-4 h-4" /> Get Tracking Snippet
            </button>
          </div>
        </div>
      )}

      {/* Variant results table */}
      {totalImp > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-slate-800">Variant Results</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  A result is declared significant when confidence ≥ 95% (p &lt; 0.05) — meaning there's less than 5% chance the difference is due to random chance
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Significant win</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Significant loss</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" /> Inconclusive</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-6 py-3 font-medium">Variant</th>
                  <th className="text-right px-4 py-3 font-medium">
                    Visitors
                    <HelpTip text="Number of unique visitors assigned to this variant" />
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    Conversions
                    <HelpTip text="Visitors who completed the goal action while in this variant" />
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    Conv. Rate
                    <HelpTip text="Conversions ÷ Visitors. The higher this is, the better the variant performs." />
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    vs Control
                    <HelpTip text="How much better (or worse) this variant is compared to the control. e.g. +25% means 25% more conversions." />
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    Confidence
                    <HelpTip text="Statistical confidence that this result is real (not random chance). Aim for 95%+ before making a decision." />
                  </th>
                  <th className="text-right px-6 py-3 font-medium">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exp.variants.map((v: Variant, i) => {
                  const isControl = Boolean(v.is_control);
                  const rate = v.stats?.variantRate ?? 0;
                  const improvement = v.stats?.relativeImprovement ?? 0;
                  const confidence = v.stats?.confidence ?? 0;
                  const significant = v.stats?.significant;
                  const isWinner = winner?.id === v.id;
                  const isLoser = loser && loser.id === v.id;

                  return (
                    <tr key={v.id} className={isWinner ? 'bg-emerald-50' : isLoser ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-900">{v.name}</span>
                              {isControl && <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Control</span>}
                              {isWinner && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">🏆 Winner</span>}
                              {isLoser && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-semibold">📉 Lost</span>}
                            </div>
                            {v.description && <p className="text-xs text-slate-400 mt-0.5">{v.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-slate-700">{(v.impressions ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-4 text-right text-slate-700">{(v.conversions ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-4 text-right font-bold text-slate-900">{rate}%</td>
                      <td className="px-4 py-4 text-right">
                        {isControl ? <span className="text-slate-400 text-xs">Baseline</span> : (
                          <span className={`font-semibold text-sm ${improvement > 0 ? 'text-emerald-600' : improvement < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                            {improvement > 0 ? '+' : ''}{improvement}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {isControl ? <span className="text-slate-400 text-xs">—</span> : (
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-2">
                              <div className={`h-2 rounded-full transition-all ${confidence >= 95 ? 'bg-emerald-500' : confidence >= 80 ? 'bg-amber-400' : 'bg-slate-300'}`}
                                style={{ width: `${Math.min(confidence, 100)}%` }} />
                            </div>
                            <span className={`text-xs w-10 text-right font-semibold ${confidence >= 95 ? 'text-emerald-700' : 'text-slate-500'}`}>
                              {confidence.toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isControl ? (
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Baseline</span>
                        ) : significant && improvement > 0 ? (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">✓ Significant Win</span>
                        ) : significant && improvement < 0 ? (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">✗ Significant Loss</span>
                        ) : (v.impressions ?? 0) < 100 ? (
                          <span className="text-xs text-slate-400 px-2 py-1 bg-slate-100 rounded-full">⏳ Need more data</span>
                        ) : (
                          <span className="text-xs text-slate-400 px-2 py-1 bg-slate-100 rounded-full">~ Not conclusive</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Reading the results guide */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
            <div className="flex gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>How to read this table:</strong> The Control is your baseline. Look at the "vs Control" column to see how each variant compares.
                Only act on results showing <strong>95%+ confidence</strong> — lower confidence means the difference might just be random chance.
                If confidence is low, keep the experiment running longer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-800">Daily Impressions — Last 14 Days</h2>
              <p className="text-xs text-slate-400 mt-0.5">Shows how many visitors were assigned to each variant per day</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                {exp.variants.map((v, i) => (
                  <linearGradient key={v.id} id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {exp.variants.map((v, i) => (
                <Area key={v.id} type="monotone" dataKey={`${v.name}_impression`}
                  name={v.name} stroke={COLORS[i % COLORS.length]}
                  fill={`url(#g${i})`} strokeWidth={2} dot={false} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-3 text-center">
            Tip: Both lines should rise at similar rates. If one is much lower, traffic may not be splitting evenly.
          </p>
        </div>
      )}

      {/* O&G context */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
        <h3 className="font-semibold text-amber-800 text-sm mb-2">⛽ Oil & Gas Context — Why A/B test this?</h3>
        <p className="text-xs text-amber-700 leading-relaxed">
          In the oil & gas industry, even a 10% improvement in a safety training portal's completion rate or a field service form's
          submission rate can have significant operational and safety impact at scale. A/B testing replaces subjective design opinions
          with hard data — letting you know with statistical certainty which version produces better outcomes before rolling it out
          to your entire workforce or vendor network.
        </p>
      </div>

      {showSnippet && <SnippetModal experiment={exp} onClose={() => setShowSnippet(false)} />}
    </div>
  );
}
