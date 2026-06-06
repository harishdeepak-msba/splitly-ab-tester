const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const FILES = {
  experiments: path.join(DATA_DIR, 'experiments.json'),
  variants:    path.join(DATA_DIR, 'variants.json'),
  events:      path.join(DATA_DIR, 'events.json'),
};

function read(key) {
  try {
    if (!fs.existsSync(FILES[key])) return [];
    return JSON.parse(fs.readFileSync(FILES[key], 'utf8'));
  } catch (e) {
    return [];
  }
}

function write(key, data) {
  fs.writeFileSync(FILES[key], JSON.stringify(data, null, 2));
}

const db = {
  // Experiments
  getAllExperiments: ()      => read('experiments'),
  saveExperiments:  (data)  => write('experiments', data),

  // Variants
  getAllVariants: ()     => read('variants'),
  saveVariants:  (data) => write('variants', data),

  // Events
  getAllEvents: ()     => read('events'),
  saveEvents:  (data) => write('events', data),

  // Helpers
  findExperiment: (id) => read('experiments').find((e) => e.id === id) || null,
  findVariants:   (experimentId) => read('variants').filter((v) => v.experiment_id === experimentId),
  findVariant:    (id) => read('variants').find((v) => v.id === id) || null,
};

module.exports = db;
