# Splitly — A/B Testing Platform

> **Make decisions with data, not guesswork.**  
> A full-stack A/B testing tool that lets you test two versions of anything on your website and determine the winner using real visitor data and statistical analysis.

---

## 🚀 Live Demo Scenarios (Oil & Gas Industry)

The app ships with three pre-built Oil & Gas demo experiments:

| # | Experiment | Scenario | Outcome |
|---|---|---|---|
| 1 | Safety Training Portal | Video modules vs Text manuals | **Video wins +100%** (7.1% → 14.2% completion) |
| 2 | Field Service Request Form | 5-field form vs 12-field form | **Inconclusive** — need more data |
| 3 | Equipment Maintenance Alert | Push notification vs Email alert | **Push loses** (8.7% → 5.2% acknowledgement) |

---

## 📋 Table of Contents

- [What is A/B Testing?](#what-is-ab-testing)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [How to Use](#how-to-use)
- [Tracking Snippet](#tracking-snippet)
- [Oil & Gas Use Cases](#oil--gas-use-cases)
- [Statistical Method](#statistical-method)
- [API Reference](#api-reference)
- [Screenshots](#screenshots)

---

## What is A/B Testing?

A/B testing (also called split testing) is a method of comparing two versions of something to determine which one performs better. Instead of guessing which design, headline, or layout works best, you show Version A to half your visitors and Version B to the other half — then measure which version gets more people to take the desired action.

**Example:** You want to know if a red button gets more clicks than a blue one. You split your traffic 50/50, collect data for two weeks, and let the statistics tell you which button is better — with 95% confidence.

---

## ✨ Features

### Core
- ✅ Create A/B experiments with 2–4 variants
- ✅ Custom traffic split per variant (e.g. 50/50 or 70/30)
- ✅ Start, Pause, Resume, and Complete experiments
- ✅ Automatic visitor assignment via tracking snippet
- ✅ One-conversion-per-session deduplication

### Analytics & Statistics
- ✅ Real-time conversion rates per variant
- ✅ Statistical significance using Z-test (two-proportion)
- ✅ P-value and confidence level calculation
- ✅ Relative improvement percentage vs control
- ✅ Automatic winner detection at 95% confidence
- ✅ 14-day daily impressions chart

### UX / Guidance
- ✅ Self-guiding onboarding for first-time users
- ✅ Step-by-step experiment creation wizard
- ✅ Lifecycle progress bar (Draft → Active → Results → Done)
- ✅ Contextual "What to do next" recommendations
- ✅ Tooltip explanations on every stat
- ✅ Oil & Gas industry example suggestions built-in

### Developer
- ✅ Embeddable JavaScript tracking snippet
- ✅ One-click demo data loader (3 O&G scenarios)
- ✅ REST API for programmatic access
- ✅ Zero native dependencies — runs on any Node version

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 |
| Backend | Node.js, Express |
| Database | JSON file storage (no compilation required) |
| Statistics | Custom Z-test implementation |

---

## 📁 Project Structure

```
ABTester/
│
├── backend/                        # Express API server
│   ├── src/
│   │   ├── index.js                # Server entry point + snippet endpoint
│   │   ├── db.js                   # JSON file storage layer
│   │   ├── stats.js                # Z-test statistical calculations
│   │   └── routes/
│   │       ├── experiments.js      # CRUD + variant assignment
│   │       ├── track.js            # Impression/conversion tracking
│   │       └── demo.js             # O&G demo scenario seeder
│   ├── data/                       # Auto-created JSON data files
│   │   ├── experiments.json
│   │   ├── variants.json
│   │   └── events.json
│   └── package.json
│
├── frontend/                       # React application
│   ├── src/
│   │   ├── main.tsx                # App entry point
│   │   ├── App.tsx                 # Router setup
│   │   ├── api.ts                  # API client functions
│   │   ├── types.ts                # TypeScript interfaces
│   │   ├── index.css               # Tailwind base styles
│   │   ├── components/
│   │   │   ├── Layout.tsx          # Nav + "How it works" drawer
│   │   │   ├── StatusBadge.tsx     # Experiment status pill
│   │   │   ├── HelpTip.tsx         # Tooltip component
│   │   │   └── SnippetModal.tsx    # Tracking code modal
│   │   └── pages/
│   │       ├── Dashboard.tsx       # Experiment list + welcome screen
│   │       ├── CreateExperiment.tsx # 2-step creation wizard
│   │       └── ExperimentDetail.tsx # Results, stats, chart
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── demo/
│   └── index.html                  # Standalone sneaker store demo page
│
├── start.ps1                       # One-click Windows startup script
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- npm (comes with Node.js)
- Two terminal windows

### Installation & Running

**Option 1 — One-click (Windows PowerShell)**

```powershell
cd "path\to\ABTester"
.\start.ps1
```

**Option 2 — Manual (two terminals)**

**Terminal 1 — Backend API (port 3001)**
```bash
cd ABTester/backend
npm install
node src/index.js
```

**Terminal 2 — Frontend (port 3000)**
```bash
cd ABTester/frontend
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## 📖 How to Use

### Step 1 — Load Demo Scenarios
On first visit, click **"See Live Oil & Gas Examples"** to instantly load 3 pre-built experiments with realistic data. This is the fastest way to explore the platform.

### Step 2 — Create Your Own Experiment
1. Click **New Experiment**
2. **Step 1 of 2:** Enter a name, hypothesis, and conversion goal
   - Use the O&G suggestion panel to auto-fill with industry examples
3. **Step 2 of 2:** Configure your variants (Control vs Variant B)
   - Set traffic splits (must add up to 100%)
   - Describe what's different about each variant
4. Click **Create Experiment**

### Step 3 — Start and Track
1. On the experiment detail page, click **Start Experiment**
2. Click **Get Snippet** to copy the JavaScript tracking code
3. Paste the snippet into your website (see [Tracking Snippet](#tracking-snippet))

### Step 4 — Read Results
- Wait until you have **100+ visitors per variant**
- Check the **Confidence** column — act only when it reaches **95%+**
- A green **Winner** banner appears when results are statistically significant
- The **"What to do next"** panel at the top guides every decision

### Step 5 — Make a Decision
| Result | Action |
|---|---|
| 🏆 Significant Win | Implement the winning variant. Mark experiment Complete. |
| 📉 Significant Loss | Keep Control. Discard the variant. |
| ⏳ Not Significant | Keep running, or try a more dramatic difference between variants. |

---

## 🔌 Tracking Snippet

Add this to any webpage you want to test:

```html
<!-- Load Splitly tracker -->
<script src="http://your-server.com/snippet.js"></script>

<script>
  // Assign visitor to a variant (call once per page load)
  Splitly.assign('YOUR_EXPERIMENT_ID', function(assignment) {
    console.log('Assigned to:', assignment.variantName);

    if (assignment.variantName === 'Control (Original)') {
      // Show original version
    } else {
      // Show new variant
    }
  });

  // Call this when the user completes the goal
  function onGoalCompleted() {
    Splitly.convert('YOUR_EXPERIMENT_ID');
  }
</script>
```

**How it works under the hood:**
- Each visitor is randomly assigned to a variant based on traffic split percentages
- The assignment is stored in `localStorage` so the same visitor always sees the same variant
- Impressions are tracked automatically on `Splitly.assign()`
- Conversions are tracked when you call `Splitly.convert()`
- One conversion per session is enforced to prevent duplicates

---

## ⛽ Oil & Gas Use Cases

A/B testing is widely applicable across Oil & Gas digital operations:

| Area | What to Test | Metric |
|---|---|---|
| **HSE Portals** | Video training vs PDF manuals | Completion rate |
| **Field Apps** | Short form vs detailed form | Submission rate |
| **Maintenance Systems** | Push alert vs email alert | Acknowledgement time |
| **Vendor Portals** | Cost-savings headline vs reliability headline | RFQ submission rate |
| **Inspection Apps** | Mobile-first checklist vs desktop form | Compliance rate |
| **Recruitment Pages** | Safety culture emphasis vs compensation emphasis | Applications submitted |
| **Procurement Dashboards** | Card layout vs table layout | Time to decision |
| **Incident Reporting** | Anonymous reporting vs named reporting | Report volume |

**Why it matters:** In a company with 5,000 field workers, improving safety training completion from 7% to 14% means 350 more workers completing critical safety content — a measurable operational safety improvement driven by data.

---

## 📊 Statistical Method

Splitly uses a **two-proportion Z-test** to determine statistical significance.

### How it works

Given:
- Control: `n₁` visitors, `c₁` conversions → rate `p₁ = c₁/n₁`
- Variant: `n₂` visitors, `c₂` conversions → rate `p₂ = c₂/n₂`

**Pooled proportion:**
```
p = (c₁ + c₂) / (n₁ + n₂)
```

**Z-score:**
```
Z = (p₂ - p₁) / √(p × (1-p) × (1/n₁ + 1/n₂))
```

**P-value** (two-tailed):
```
p-value = 2 × (1 - Φ(|Z|))
```

**Confidence level:**
```
confidence = (1 - p-value) × 100%
```

A result is declared **statistically significant** when `p-value < 0.05` (confidence ≥ 95%), meaning there is less than a 5% chance the observed difference is due to random chance.

### Minimum sample size
For reliable results, aim for at least **100 visitors per variant** before drawing conclusions. Smaller samples produce unstable estimates.

---

## 🔌 API Reference

Base URL: `http://localhost:3001`

### Experiments

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/experiments` | List all experiments |
| `POST` | `/api/experiments` | Create a new experiment |
| `GET` | `/api/experiments/:id` | Get experiment with stats |
| `PATCH` | `/api/experiments/:id/status` | Update status |
| `DELETE` | `/api/experiments/:id` | Delete experiment and all data |
| `GET` | `/api/experiments/:id/assign` | Assign a visitor to a variant |

### Tracking

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/track` | Track an impression or conversion |
| `POST` | `/api/track/seed/:id` | Load sample data for an experiment |

### Demo

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/demo/seed-scenarios` | Load 3 O&G demo experiments |

### Snippet

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/snippet.js` | Serve the embeddable tracking script |

---

### Example: Create an Experiment

```bash
curl -X POST http://localhost:3001/api/experiments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CTA Button Color Test",
    "hypothesis": "Orange button will increase clicks vs grey",
    "goal": "Button click",
    "variants": [
      { "name": "Control", "description": "Grey button", "trafficSplit": 50 },
      { "name": "Variant B", "description": "Orange button", "trafficSplit": 50 }
    ]
  }'
```

### Example: Track a Conversion

```bash
curl -X POST http://localhost:3001/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "experimentId": "your-experiment-id",
    "variantId": "your-variant-id",
    "type": "conversion",
    "sessionId": "user-session-123"
  }'
```

---

## 🗄 Data Storage

All data is stored as plain JSON files in `backend/data/`:

| File | Contents |
|---|---|
| `experiments.json` | All experiment records |
| `variants.json` | All variant definitions |
| `events.json` | All impression and conversion events |

No database installation required. To reset all data, delete the files in `backend/data/` and restart the backend.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 👨‍💻 Built With

- [React](https://react.dev/) — UI framework
- [Vite](https://vitejs.dev/) — Frontend build tool
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [Recharts](https://recharts.org/) — Chart library
- [Express](https://expressjs.com/) — Backend framework
- [Lucide React](https://lucide.dev/) — Icon library

---

*Splitly — Stop guessing. Start testing.*
