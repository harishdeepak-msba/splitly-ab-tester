const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

const SCENARIOS = [
  {
    // SCENARIO 1: Clear winner — O&G Safety Training
    experiment: {
      name: '⛽ Safety Training Portal — Video vs Text Modules',
      hypothesis: 'Interactive video-based safety modules will achieve higher completion rates than static text manuals because field workers engage better with visual content.',
      status: 'active',
      goal: 'Training module completed',
    },
    variants: [
      {
        name: 'Control — Text Manual',
        description: 'Current PDF-style text training manual (12 pages)',
        traffic_split: 50,
        is_control: 1,
        impressions: 580,
        conv_rate: 0.071,   // 7.1% completion — baseline
      },
      {
        name: 'Variant B — Video Modules',
        description: 'New 8-minute interactive video with quizzes',
        traffic_split: 50,
        is_control: 0,
        impressions: 594,
        conv_rate: 0.142,   // 14.2% completion — clear winner (+100%)
      },
    ],
  },

  {
    // SCENARIO 2: Too close to call — Field Service Request Form
    experiment: {
      name: '🔧 Field Service Request Form — Short vs Detailed',
      hypothesis: 'A simplified 5-field form will have a higher submission rate than the current 12-field form, as reducing friction increases completion.',
      status: 'active',
      goal: 'Work order form submitted',
    },
    variants: [
      {
        name: 'Control — 12-Field Detailed Form',
        description: 'Current form with equipment ID, location, priority, description, contact, supervisor, department, and 5 more fields',
        traffic_split: 50,
        is_control: 1,
        impressions: 163,
        conv_rate: 0.098,   // 9.8%
      },
      {
        name: 'Variant B — 5-Field Simplified Form',
        description: 'Streamlined form: Equipment ID, Issue type, Urgency, Location, Contact only',
        traffic_split: 50,
        is_control: 0,
        impressions: 157,
        conv_rate: 0.115,   // 11.5% — small difference, low confidence
      },
    ],
  },

  {
    // SCENARIO 3: Variant lost — Maintenance Alert Design
    experiment: {
      name: '📋 Equipment Maintenance Alert — Push vs Email',
      hypothesis: 'Push notifications will get faster acknowledgement than email alerts for maintenance reminders, due to higher mobile visibility.',
      status: 'completed',
      goal: 'Alert acknowledged within 1 hour',
    },
    variants: [
      {
        name: 'Control — Email Alert',
        description: 'Standard email notification sent to technician inbox',
        traffic_split: 50,
        is_control: 1,
        impressions: 920,
        conv_rate: 0.087,   // 8.7%
      },
      {
        name: 'Variant B — Push Notification',
        description: 'Mobile push notification via the field service app',
        traffic_split: 50,
        is_control: 0,
        impressions: 908,
        conv_rate: 0.052,   // 5.2% — significantly worse (many field workers had notifications off)
      },
    ],
  },
];

function seedScenarios() {
  const existing = db.getAllExperiments();
  const scenarioNames = SCENARIOS.map((s) => s.experiment.name);
  const toRemove = existing.filter((e) => scenarioNames.includes(e.name)).map((e) => e.id);

  if (toRemove.length) {
    db.saveExperiments(existing.filter((e) => !toRemove.includes(e.id)));
    db.saveVariants(db.getAllVariants().filter((v) => !toRemove.includes(v.experiment_id)));
    db.saveEvents(db.getAllEvents().filter((e) => !toRemove.includes(e.experiment_id)));
  }

  const experiments = db.getAllExperiments();
  const variants = db.getAllVariants();
  const events = db.getAllEvents();
  const now = Date.now();

  SCENARIOS.forEach((scenario, si) => {
    const expId = uuidv4();
    const createdAt = now - (28 - si * 9) * 24 * 60 * 60 * 1000;

    experiments.push({
      id: expId,
      ...scenario.experiment,
      created_at: createdAt,
      updated_at: now,
    });

    scenario.variants.forEach((vDef) => {
      const varId = uuidv4();
      variants.push({
        id: varId,
        experiment_id: expId,
        name: vDef.name,
        description: vDef.description,
        traffic_split: vDef.traffic_split,
        is_control: vDef.is_control,
      });

      const conversions = Math.round(vDef.impressions * vDef.conv_rate);
      const duration = 14 * 24 * 60 * 60 * 1000;

      for (let j = 0; j < vDef.impressions; j++) {
        const sessionId = `demo-${varId}-${j}`;
        const dayProgress = Math.pow(Math.random(), 0.5);
        const t = createdAt + Math.floor(dayProgress * duration);

        events.push({ id: uuidv4(), experiment_id: expId, variant_id: varId, event_type: 'impression', session_id: sessionId, timestamp: t });
        if (j < conversions) {
          events.push({ id: uuidv4(), experiment_id: expId, variant_id: varId, event_type: 'conversion', session_id: sessionId, timestamp: t + Math.floor(Math.random() * 600000) });
        }
      }
    });
  });

  db.saveExperiments(experiments);
  db.saveVariants(variants);
  db.saveEvents(events);

  return SCENARIOS.length;
}

router.post('/seed-scenarios', (req, res) => {
  const count = seedScenarios();
  res.json({ success: true, count });
});

module.exports = router;
module.exports.seedScenarios = seedScenarios;
