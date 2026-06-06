const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { computeStats } = require('../stats');

const router = express.Router();

router.get('/', (req, res) => {
  const experiments = db.getAllExperiments().sort((a, b) => b.created_at - a.created_at);
  const events = db.getAllEvents();

  const result = experiments.map((exp) => {
    const variants = db.findVariants(exp.id);
    const expEvents = events.filter((e) => e.experiment_id === exp.id);
    const totalImpressions = expEvents.filter((e) => e.event_type === 'impression').length;
    const totalConversions = expEvents.filter((e) => e.event_type === 'conversion').length;
    return { ...exp, variants, totalImpressions, totalConversions };
  });

  res.json(result);
});

router.post('/', (req, res) => {
  const { name, hypothesis, goal, variants } = req.body;
  if (!name || !variants || variants.length < 2)
    return res.status(400).json({ error: 'Name and at least 2 variants required' });

  const id = uuidv4();
  const now = Date.now();
  const experiment = { id, name, hypothesis: hypothesis || '', status: 'draft', goal: goal || '', created_at: now, updated_at: now };

  const experiments = db.getAllExperiments();
  experiments.push(experiment);
  db.saveExperiments(experiments);

  const allVariants = db.getAllVariants();
  const newVariants = variants.map((v, i) => ({
    id: uuidv4(),
    experiment_id: id,
    name: v.name,
    description: v.description || '',
    traffic_split: v.trafficSplit,
    is_control: i === 0 ? 1 : 0,
  }));
  newVariants.forEach((v) => allVariants.push(v));
  db.saveVariants(allVariants);

  res.status(201).json({ ...experiment, variants: newVariants });
});

router.get('/:id', (req, res) => {
  const experiment = db.findExperiment(req.params.id);
  if (!experiment) return res.status(404).json({ error: 'Not found' });

  const variants = db.findVariants(experiment.id);
  const events = db.getAllEvents().filter((e) => e.experiment_id === experiment.id);
  const control = variants.find((v) => v.is_control) || variants[0];

  const controlEvents = events.filter((e) => e.variant_id === control.id);
  const controlImp  = controlEvents.filter((e) => e.event_type === 'impression').length;
  const controlConv = controlEvents.filter((e) => e.event_type === 'conversion').length;

  const variantsWithStats = variants.map((v) => {
    const vEvents = events.filter((e) => e.variant_id === v.id);
    const impressions = vEvents.filter((e) => e.event_type === 'impression').length;
    const conversions = vEvents.filter((e) => e.event_type === 'conversion').length;

    let stats;
    if (v.is_control) {
      const rate = impressions > 0 ? (conversions / impressions) * 100 : 0;
      stats = { controlRate: +rate.toFixed(2), variantRate: +rate.toFixed(2), significant: false, relativeImprovement: 0, confidence: 0 };
    } else {
      stats = computeStats(controlImp, controlConv, impressions, conversions);
    }
    return { ...v, impressions, conversions, stats };
  });

  // Daily breakdown for chart (last 14 days)
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const recentEvents = events.filter((e) => e.timestamp >= cutoff);
  const dailyMap = {};
  recentEvents.forEach((e) => {
    const day = new Date(e.timestamp).toISOString().slice(0, 10);
    const key = `${day}__${e.variant_id}__${e.event_type}`;
    dailyMap[key] = (dailyMap[key] || 0) + 1;
  });
  const daily = Object.entries(dailyMap).map(([key, count]) => {
    const [day, variant_id, event_type] = key.split('__');
    return { day, variant_id, event_type, count };
  });

  res.json({ ...experiment, variants: variantsWithStats, daily });
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['draft', 'active', 'paused', 'completed'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });

  const experiments = db.getAllExperiments();
  const idx = experiments.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  experiments[idx].status = status;
  experiments[idx].updated_at = Date.now();
  db.saveExperiments(experiments);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.saveExperiments(db.getAllExperiments().filter((e) => e.id !== id));
  db.saveVariants(db.getAllVariants().filter((v) => v.experiment_id !== id));
  db.saveEvents(db.getAllEvents().filter((e) => e.experiment_id !== id));
  res.json({ success: true });
});

router.get('/:id/assign', (req, res) => {
  const experiment = db.findExperiment(req.params.id);
  if (!experiment || experiment.status !== 'active')
    return res.status(404).json({ error: 'Experiment not found or not active' });

  const variants = db.findVariants(req.params.id);
  const rand = Math.random() * 100;
  let cumulative = 0;
  let chosen = variants[0];
  for (const v of variants) {
    cumulative += v.traffic_split;
    if (rand <= cumulative) { chosen = v; break; }
  }
  res.json({ variantId: chosen.id, variantName: chosen.name });
});

module.exports = router;
