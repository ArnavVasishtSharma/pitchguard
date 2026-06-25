# ⚡ PitchGuard — AI-Powered Football Injury Risk Dashboard

PitchGuard is a state-of-the-art sports analytics command center and injury risk prediction interface. Designed to resemble a UEFA Champions League broadcast collided with an F1 telemetry pit-wall, it projects the probability of football players suffering impact-related injuries (e.g., ACL, Hamstring, Ankle Ligaments) based on surface friction context, match workload congestion, age, history, and recovery statistics.

---

## 🏟 Design System & Aesthetics
PitchGuard's design prioritizes a dark, premium, stadium-themed visual system:
* **Background Geometry:** Subtle SVG pitch line overlays (`PitchBackground`) showing the field markings behind every screen.
* **Cinematic Tunnel Cam:** A high-end splash intro (`SplashScreen`) mimicking the dark player tunnel, floodlights, and ghostly squad silhouettes walking out onto a glowing pitch.
* **Scoreboard LED Typography:** Scoreboard numbers and telemetry values rendered in *Share Tech Mono* font.
* **Interactive Glass Cards:** Premium glassmorphism panels with 3D mouse perspective parallax tilt and hexagonal goal net backgrounds.
* **Telemetry Data Visualization:** Staggered SVG radar grids, speedometers, live alerts, and vertical timelines showing historical data.

---

## 🛠 Tech Stack
* **Framework:** React 19, TypeScript
* **Build Tool:** Vite 8
* **Styling:** Tailwind CSS v3, Vanilla CSS
* **Animations:** Framer Motion-inspired CSS keyframes, Three.js custom shaders (`ShaderAnimation` rendering abstract pitch dynamics)

---

## 📂 Project Structure
Below is a map of the newly integrated high-fidelity interface components:

```text
src/
├── components/
│   ├── ui/
│   │   ├── BorderBeam.tsx        # Sweeping border laser lights
│   │   ├── InjuryTimeline.tsx    # Vertical chronological injury charts
│   │   ├── Meteors.tsx           # Glowing trailing data meteors
│   │   ├── NumberTicker.tsx      # Count-up scoreboard ticker on mount
│   │   ├── PitchBackground.tsx   # SVG pitch markings, goal nets, and rolling footballs
│   │   ├── RiskRadar.tsx         # 6-axis bio-mechanical radar polygon charts
│   │   └── GlassUI.tsx           # SVG distortion refractions & glass layout shells
│   ├── SplashScreen.tsx          # Phase 1: Interactive cinematic intro
│   ├── LeagueDock.tsx            # Phase 2: 3x2 glass cards with accent-borders
│   ├── ClubPicker.tsx            # Phase 3: Snap-carousel with 3D mouse parallax
│   ├── PitchGuard.tsx            # Phase 4: Full squad command center dashboard
│   └── IntelFeed.tsx             # Surface mixes, circular gauges, priority alerts
└── index.css                     # Custom animations: footballRoll, tunnelWalkIn, ledFlicker, etc.
```

---

## 🚀 How to Run the Project

Follow these steps to set up and run PitchGuard locally on your machine:

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher recommended) and **npm** installed.

### 2. Installation
Navigate to the project directory and install the necessary package dependencies:
```bash
npm install
```

### 3. Run the Development Server
Launch the local development environment using Vite:
```bash
npm run dev
```
Once the dev server starts, open your browser and navigate to the address shown in your terminal (typically **`http://localhost:5173`**).

### 4. Code Quality & Linting
Run ESLint to check the codebase for syntax or formatting issues:
```bash
npm run lint
```

### 5. Production Build
To build the application for deployment:
```bash
npm run build
```
This compiles the TypeScript files and bundles static assets in the `dist` folder. To preview the production bundle locally:
```bash
npm run preview
```

---

## 🧬 Injury Predictive Model Context
The frontend integrates with mock predictive outputs designed to mirror a pipeline testing the hypothesis that **artificial turf increases player impact injury risk**:
* **XGBoost Classifier:** Computes the probability (0–100) of an impact injury.
* **SHAP Explainability:** Returns positive/negative attribution values explaining which biomechanical factors (e.g. Astro Turf exposure, recovery days, fixture density) had the highest influence on the player's risk rating.
