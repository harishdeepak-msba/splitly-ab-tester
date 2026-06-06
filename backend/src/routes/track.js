const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

router.post('/', (req, res) => {
  const { experimentId, variantId, type, sessionId } = req.body;
  if (!experimentId || !variantId || !['impression', 'conversion'].includes(type))
    return res.status(400).json({ error: 'Invalid payload' });

  const variant = db.findVariant(variantId);
  if (!variant || variant.experiment_id !== experimentId)
    return res.status(404).json({ error: 'Variant not found' });

  const events = db.getAllEvents();

  if (type === 'conversion' && sessionId) {
    const already = events.find(
      (e) => e.experiment_id === experimentId && e.session_id === sessionId && e.event_type === 'conversion'
    );
    if (already) return res.json({ success: true, duplicate: true });
  }

  events.push({ id: uuidv4(), experiment_id: experimentId, variant_id: variantId, event_type: type, session_id: sessionId || null, timestamp: Date.now() });
  db.saveEvents(events);
  res.json({ success: true });
});

// Seed realistic demo data for an experiment
router.post('/seed/:experimentId', (req, res) => {
  const { experimentId } = req.params;
  const variants = db.findVariants(experimentId);
  if (!variants.length) return res.status(404).json({ error: 'No variants' });

  const events = db.getAllEvents();
  const baseTime = Date.now() - 14 * 24 * 60 * 60 * 1000;

  variants.forEach((v, i) => {
    const impressions = 200 + i * 50 + Math.floor(Math.random() * 40);
    const convRate = i === 0 ? 0.08 : 0.12 + i * 0.025;
    const conversions = Math.floor(impressions * convRate);

    for (let j = 0; j < impressions; j++) {
      const sessionId = `seed-${v.id}-${j}`;
      const t = baseTime + Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000);
      events.push({ id: uuidv4(), experiment_id: experimentId, variant_id: v.id, event_type: 'impression', session_id: sessionId, timestamp: t });
      if (j < conversions) {
        events.push({ id: uuidv4(), experiment_id: experimentId, variant_id: v.id, event_type: 'conversion', session_id: sessionId, timestamp: t + 5000 });
      }
    }
  });

  db.saveEvents(events);
  res.json({ success: true });
});

module.exports = router;
