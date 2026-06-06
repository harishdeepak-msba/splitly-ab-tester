import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import type { Experiment } from '../types';

interface Props {
  experiment: Experiment;
  onClose: () => void;
}

export default function SnippetModal({ experiment, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL || window.location.origin;

  const snippet = `<!-- Splitly A/B Testing Tracker -->
<script src="${apiBase}/snippet.js"></script>
<script>
  // Assign visitor to a variant
  Splitly.assign('${experiment.id}', function(assignment) {
    console.log('Assigned to:', assignment.variantName);

    if (assignment.variantName === '${experiment.variants[0]?.name ?? 'Control'}') {
      // Show control experience
    } else {
      // Show variant experience
    }
  });

  // Call this when your goal is completed (e.g., button click, form submit)
  function onGoalCompleted() {
    Splitly.convert('${experiment.id}');
  }
</script>`;

  const copy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h2 className="font-semibold text-slate-900">Tracking Snippet</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Embed this in your website to track <strong>{experiment.name}</strong>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 text-xs rounded-lg p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {snippet}
            </pre>
            <button
              onClick={copy}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="mt-4 bg-indigo-50 rounded-lg p-4 text-sm text-indigo-800 space-y-1">
            <p><strong>How it works:</strong></p>
            <ul className="list-disc list-inside text-xs space-y-1 text-indigo-700 mt-1">
              <li>Each visitor is randomly assigned to a variant (stored in localStorage)</li>
              <li>An impression is automatically tracked on assignment</li>
              <li>Call <code className="bg-indigo-100 px-1 rounded font-mono">Splitly.convert()</code> when the user completes the goal: <em>{experiment.goal || 'your defined conversion event'}</em></li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end px-5 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
