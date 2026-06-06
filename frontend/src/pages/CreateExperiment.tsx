import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, ArrowLeft, ArrowRight, FlaskConical, CheckCircle2, Lightbulb } from 'lucide-react';
import { api } from '../api';
import type { NewVariantInput } from '../types';

const COLORS = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b'];

const ONG_SUGGESTIONS = [
  { name: 'Safety Training Portal CTA', hypothesis: 'A "Start Video Training" button will get higher clicks than "Read Training Manual"', goal: 'Training module started' },
  { name: 'Field Service Request Form Length', hypothesis: 'A shorter 5-field form will have higher completion rate than the current 12-field form', goal: 'Form submission' },
  { name: 'Maintenance Alert Format', hypothesis: 'A push notification will get faster acknowledgement than an email alert', goal: 'Alert acknowledged within 1 hour' },
  { name: 'Vendor Bid Portal Headline', hypothesis: 'Highlighting cost savings in the headline will get more RFQ submissions than highlighting reliability', goal: 'RFQ form submitted' },
];

export default function CreateExperiment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [goal, setGoal] = useState('');
  const [variants, setVariants] = useState<NewVariantInput[]>([
    { name: 'Control (Original)', description: 'The current version your users already see', trafficSplit: 50 },
    { name: 'Variant B (New)', description: 'The new version you want to test', trafficSplit: 50 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalSplit = variants.reduce((s, v) => s + (v.trafficSplit || 0), 0);
  const splitValid = Math.abs(totalSplit - 100) < 0.01;

  const applySuggestion = (s: typeof ONG_SUGGESTIONS[0]) => {
    setName(s.name);
    setHypothesis(s.hypothesis);
    setGoal(s.goal);
  };

  const addVariant = () => {
    const even = +(100 / (variants.length + 1)).toFixed(1);
    setVariants((prev) => [
      ...prev.map((v) => ({ ...v, trafficSplit: even })),
      { name: `Variant ${String.fromCharCode(65 + prev.length)}`, description: '', trafficSplit: even },
    ]);
  };

  const removeVariant = (i: number) => {
    if (variants.length <= 2) return;
    const next = variants.filter((_, idx) => idx !== i);
    const even = +(100 / next.length).toFixed(1);
    setVariants(next.map((v) => ({ ...v, trafficSplit: even })));
  };

  const updateVariant = (i: number, field: keyof NewVariantInput, value: string | number) =>
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));

  const distributeEvenly = () => {
    const even = +(100 / variants.length).toFixed(1);
    setVariants((prev) => prev.map((v) => ({ ...v, trafficSplit: even })));
  };

  const validateStep1 = () => {
    if (!name.trim()) { setError('Please give your experiment a name.'); return false; }
    setError(''); return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!splitValid) return setError(`Traffic splits must add up to 100%. Currently: ${totalSplit.toFixed(1)}%`);
    if (variants.some((v) => !v.name.trim())) return setError('All variants need a name.');
    setError('');
    setSubmitting(true);
    try {
      const exp = await api.createExperiment({ name, hypothesis, goal, variants });
      navigate(`/experiments/${exp.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create experiment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <button onClick={() => step === 1 ? navigate('/') : setStep(1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {step === 1 ? 'Back to Dashboard' : 'Back to Step 1'}
      </button>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step > s ? 'bg-emerald-500 text-white' : step === s ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            <span className={`text-sm font-medium ${step === s ? 'text-slate-900' : 'text-slate-400'}`}>
              {s === 1 ? 'Experiment Details' : 'Define Variants'}
            </span>
            {s < 2 && <div className={`h-px w-8 ${step > 1 ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-5 text-sm">{error}</div>
      )}

      {/* ── STEP 1: Details ─────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-800 text-lg">What are you testing?</h2>
            </div>
            <p className="text-sm text-slate-500 mb-5">Describe your experiment clearly so you can remember the context later.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Experiment Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Safety Training Portal CTA Button Test"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-400 mt-1">Be specific — include what element and what you're changing</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Hypothesis
                  <span className="ml-1.5 text-xs font-normal text-slate-400">(What do you predict will happen?)</span>
                </label>
                <textarea
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  placeholder='e.g. "Changing the button from grey to orange will increase click-through rate because it draws more visual attention"'
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">Format: "Changing X will improve Y because Z"</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Conversion Goal
                  <span className="ml-1.5 text-xs font-normal text-slate-400">(What action counts as success?)</span>
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. User clicks 'Start Training', Form submitted, Alert acknowledged"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-400 mt-1">This is the action you'll track using <code className="bg-slate-100 px-1 rounded">Splitly.convert()</code> in your code</p>
              </div>
            </div>
          </div>

          {/* O&G Suggestions */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-semibold text-amber-800">⛽ Oil & Gas experiment ideas — click to use</p>
            </div>
            <div className="space-y-2">
              {ONG_SUGGESTIONS.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => applySuggestion(s)}
                  className="w-full text-left px-3 py-2.5 bg-white border border-amber-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-colors"
                >
                  <p className="text-xs font-semibold text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{s.hypothesis}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => { if (validateStep1()) setStep(2); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Next: Set Up Variants <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Variants ─────────────────────────────────────────── */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-bold text-slate-800 text-lg mb-1">Define your variants</h2>
            <p className="text-sm text-slate-500 mb-5">
              <strong>Control</strong> = your current version. <strong>Variant B</strong> = the new version you want to test.
              Traffic is split between them automatically.
            </p>

            {/* Explainer */}
            <div className="bg-indigo-50 rounded-lg p-4 mb-5 flex gap-3">
              <span className="text-xl shrink-0">💡</span>
              <div className="text-xs text-indigo-800 leading-relaxed">
                <strong>How variants work:</strong> Each visitor to your site is randomly assigned to one variant based on the traffic split.
                The Control is your baseline — the current design. Variant B is what you're testing. They run at the same time so external factors don't skew results.
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-700">Variants ({variants.length})</span>
              <button type="button" onClick={distributeEvenly}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                Distribute traffic evenly
              </button>
            </div>

            <div className="space-y-4 mb-4">
              {variants.map((v, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                      {i === 0 ? '🛡️ Control (Original)' : `🔬 Variant ${String.fromCharCode(65 + i)} (New)`}
                    </span>
                    {variants.length > 2 && (
                      <button type="button" onClick={() => removeVariant(i)}
                        className="ml-auto text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        {i === 0 ? 'Name (current version)' : 'Name (what you\'re testing)'}
                      </label>
                      <input type="text" value={v.name}
                        onChange={(e) => updateVariant(i, 'name', e.target.value)}
                        placeholder={i === 0 ? 'e.g. Grey Button' : 'e.g. Orange Button'}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Traffic % <span className="text-slate-400 font-normal">(visitors who see this)</span>
                      </label>
                      <input type="number" min={1} max={99} step={0.1} value={v.trafficSplit}
                        onChange={(e) => updateVariant(i, 'trafficSplit', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Description <span className="text-slate-400 font-normal">(what's different about this version?)</span>
                    </label>
                    <input type="text" value={v.description}
                      onChange={(e) => updateVariant(i, 'description', e.target.value)}
                      placeholder={i === 0 ? 'e.g. Current grey "Proceed" button — no changes' : 'e.g. High-contrast orange button with arrow icon'}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                </div>
              ))}
            </div>

            {/* Visual traffic bar */}
            <div className="mb-4">
              <div className="h-3 rounded-full flex overflow-hidden gap-px">
                {variants.map((v, i) => (
                  <div key={i} style={{ width: `${v.trafficSplit}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    className="transition-all" />
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                <p className={`text-xs font-semibold ${splitValid ? 'text-emerald-600' : 'text-red-500'}`}>
                  {splitValid ? '✓ Traffic adds up to 100%' : `⚠ Total is ${totalSplit.toFixed(1)}% — must equal 100%`}
                </p>
                <p className="text-xs text-slate-400">
                  {variants.map((v, i) => `${String.fromCharCode(65 + i)}: ${v.trafficSplit}%`).join(' · ')}
                </p>
              </div>
            </div>

            {variants.length < 4 && (
              <button type="button" onClick={addVariant}
                className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                <PlusCircle className="w-4 h-4" /> Add another variant
              </button>
            )}
          </div>

          {/* What happens next */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-slate-700 mb-3">📋 What happens after you create this?</p>
            <div className="space-y-2">
              {[
                'The experiment is created in Draft status — no data collected yet',
                'Click "Start" to activate it and begin splitting traffic',
                'Copy the tracking snippet and add it to your website',
                'Come back to view results once you have 100+ visitors per variant',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button type="submit" disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-60">
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Creating…' : 'Create Experiment'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
