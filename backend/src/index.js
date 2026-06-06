const express = require('express');
const cors = require('cors');

const experimentsRouter = require('./routes/experiments');
const trackRouter = require('./routes/track');
const demoRouter = require('./routes/demo');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/experiments', experimentsRouter);
app.use('/api/track', trackRouter);
app.use('/api/demo', demoRouter);

// Embeddable tracking snippet served dynamically
app.get('/snippet.js', (req, res) => {
  const apiBase = req.query.api || `${req.protocol}://${req.get('host')}`;
  res.type('application/javascript');
  res.send(`
(function(window) {
  var SPLITLY_API = '${apiBase}/api';
  var STORAGE_KEY = 'splitly_assignments';

  function getAssignments() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) { return {}; }
  }
  function saveAssignments(a) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(a)); } catch(e) {}
  }
  function getSessionId() {
    try {
      var id = sessionStorage.getItem('splitly_session');
      if (!id) { id = 'sess_' + Math.random().toString(36).substr(2,9) + Date.now().toString(36); sessionStorage.setItem('splitly_session', id); }
      return id;
    } catch(e) { return 'anon_' + Date.now(); }
  }
  function post(url, data) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  }

  window.Splitly = {
    assign: function(experimentId, callback) {
      var assignments = getAssignments();
      if (assignments[experimentId]) { if (callback) callback(assignments[experimentId]); return Promise.resolve(assignments[experimentId]); }
      return fetch(SPLITLY_API + '/experiments/' + experimentId + '/assign')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          assignments[experimentId] = data; saveAssignments(assignments);
          post(SPLITLY_API + '/track', { experimentId: experimentId, variantId: data.variantId, type: 'impression', sessionId: getSessionId() });
          if (callback) callback(data);
          return data;
        }).catch(function(e) { console.warn('Splitly assign error:', e); });
    },
    convert: function(experimentId) {
      var assignments = getAssignments();
      var assignment = assignments[experimentId];
      if (!assignment) return Promise.resolve();
      return post(SPLITLY_API + '/track', { experimentId: experimentId, variantId: assignment.variantId, type: 'conversion', sessionId: getSessionId() })
        .catch(function(e) { console.warn('Splitly convert error:', e); });
    }
  };
})(window);
  `.trim());
});

app.listen(PORT, () => {
  console.log('Splitly API running on http://localhost:' + PORT);

  // Auto-seed demo data on startup if database is empty
  const db = require('./db');
  const { seedScenarios } = require('./routes/demo');
  if (db.getAllExperiments().length === 0) {
    seedScenarios();
    console.log('Auto-seeded O&G demo scenarios.');
  }
});
