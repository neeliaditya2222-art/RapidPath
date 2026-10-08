# RapidPath: AI-Powered Emergency Vehicle Route Optimizer

> **"Find the safest and most reliable route for emergency response — not merely the shortest route."**

---

## 🚑 Project Overview

**RapidPath** is an enterprise-grade Emergency Operations Center (EOC) application combining **Google Maps Platform**, **Google Gemini AI**, and a **Deterministic Physics Scoring Engine** to evaluate, rank, and recommend high-reliability emergency transit corridors for:
- 🚑 **Ambulance (EMS / Trauma)**
- 🚒 **Fire Engine (Heavy Apparatus & Turn Radii)**
- 🚓 **Police Unit (High-Velocity Interceptor)**
- 🛟 **Rescue Unit (Hazmat & Extrication)**
- 🚛 **Support & Command Units**

---

## 🌟 Core Features

- 🛰️ **Interactive Situation Map:** Live interactive map with origin/target pins, color-coded corridor polylines, hazard/incident indicators, and auto-fit bounds.
- 🧠 **Gemini AI Risk Assessment:** Server-side Gemini 1.5 Flash structured reasoning that evaluates traffic severity, route reliability, and vehicle constraints with strict Zod validation.
- ⚡ **Deterministic Scoring Engine:** Physics-based multi-factor scoring (Travel Time, Delay Ratios, Incident Severity, Reliability Index).
- 🔄 **Controlled Live Telemetry Refresh:** Auto-refresh timer with backend caching (120s TTL) and rate-limiting to protect Google API quotas.
- 📋 **Turn-by-Turn Telemetry:** Segment-by-segment breakdown with Recharts comparative radar and bar charts.
- 🗄️ **Dispatch Audit Log (History):** Searchable, filterable history log with detail inspection and JSON export.
- 🛡️ **Zero-Secret Client Security:** All Gemini and Google Maps Server keys remain strictly on the backend.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Leaflet, Recharts, Lucide React, Zod |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose / MongoDB Atlas, Winston Logger |
| **AI Integration** | Google Gemini SDK (`gemini-1.5-flash`) with structured JSON schema mode |
| **Maps** | Google Maps Directions & Geocoding API + High-Fidelity Geospatial Simulation Engine |
| **Testing** | Jest, Supertest, ts-jest |
| **Deployment** | Vercel (Client) + Render (Server) + MongoDB Atlas |

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Note: RapidPath runs out of the box in high-fidelity simulation mode even before external API keys are configured!)*

### 3. Run Both Client and Server Concurrently
```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Testing & Validation

Run the automated backend test suite:
```bash
npm run test
```

Run TypeScript verification across both workspaces:
```bash
npm run typecheck
```

Build production packages:
```bash
npm run build
```

---

## ⚖️ Safety & Legal Disclaimer

*This system provides decision-support recommendations based on available map, traffic, and AI analysis. It does not replace trained emergency dispatchers, official navigation systems, or real-time emergency-response protocols.*
