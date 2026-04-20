<div align="center">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini">
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/Cloud_Run-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white" alt="Cloud Run">
  <br>

  <h1 align="center">🚀 ClubOS</h1>

  <p align="center">
    <strong>AI-Powered Smart Assistant for College Clubs & Event Organizers</strong><br/>
    <em>PromptWars 2026 — Challenge Vertical: Education & Campus Technology</em>
  </p>
</div>

---

## 🎯 Challenge Vertical

**Vertical: Education & Campus Technology**

ClubOS directly addresses the fragmented, manual workflows that overwhelm college clubs and student event organizers across India. The chosen vertical focuses on empowering educational institutions with AI-driven automation — reducing administrative overhead, enabling data-driven decision making, and democratizing access to professional-grade event management tools for students.

**Problem Being Solved:**
College clubs rely on 10+ disconnected tools (Canva, Google Docs, WhatsApp, Gmail, spreadsheets) to organize events. This leads to inconsistency, wasted time, and missed opportunities. ClubOS consolidates all workflows into one AI-powered interface using Google Gemini as the reasoning engine.

---

## 🧠 Approach & Logic

### Core Architecture
ClubOS uses a **multi-agent parallel dispatch pattern** powered by Google Gemini 2.0 Flash. When a user inputs an event brief, the system:

1. **Sanitizes input** — XSS prevention and length validation before any API call
2. **Validates context** — Checks for API key, agent availability, and brief quality
3. **Dispatches agents in parallel** — Uses `Promise.all()` with staggered delays (700ms) to avoid rate limiting
4. **Handles failures gracefully** — Auto-retry logic (1 attempt) with exponential backoff
5. **Renders results progressively** — Cards appear as each agent completes

### Agent System
Each of the 6 core agents has a strict JSON schema enforced via `systemInstruction`:

| Agent | Output Schema | Purpose |
|---|---|---|
| `social` | `{ instagram, linkedin, whatsapp }` | Multi-platform social content |
| `presentation` | `{ slides: [{ title, bullets[] }] }` | 8-slide event deck |
| `emails` | `{ sponsor, college_announcement, speaker_invite }` | Outreach emails |
| `ideas` | `{ ideas: [] }` | 5 viral event concepts |
| `checklist` | `{ checklist: [{ week, tasks[] }] }` | Operational timeline |
| `flyer` | `{ headline, highlights[], colorTheme }` | Visual flyer data |

### Decision Making Logic
- Brief is analyzed for event type, scale, and context before routing
- Agents receive domain-specific system instructions tailored to Indian college culture
- All outputs enforce strict JSON contracts — no unstructured responses accepted
- Failed agents auto-retry once before marking as error

---

## ⚙️ How the Solution Works

### 1. Event Generator
Drop an event brief → 6 AI agents fire simultaneously → get social posts, presentation, emails, flyer, ideas, and checklist in under 30 seconds.

### 2. Club Tools Arsenal (8 Tools)
- **QR Check-In** — Bulk QR generation + live scanner (JSZip + qrcode)
- **Budget AI** — AI-generated financial breakdown with Chart.js visualization + PDF export
- **Sponsor Matcher** — AI identifies best-fit corporates with fit-scores and draft emails
- **Quiz Builder** — AI generates MCQ quizzes with instant grading
- **Meme Generator** — Canvas-based meme creation for event marketing
- **Feedback Form** — Post-event survey builder with visual analytics
- **Timer Board** — Fullscreen stage manager with Web Audio + confetti
- **Merch Store** — AI-designed merchandise concept generator

### 3. Certificate Studio
Integrates with CertFlow Flask backend. Supports CSV upload, drag-and-drop template, text positioning, and mass Gmail automation.

### 4. Custom Agent Builder
Users can create domain-specific AI agents with custom JSON schemas, system instructions, and visual identifiers. Agents persist via localStorage and integrate into the main generation flow.

### 5. Arcade Break
4 HTML5 Canvas games (Tetris, Flappy Bird, Brick Breaker, Mario Run) — because student wellbeing matters.

---

## 🔧 Google Services Integration

ClubOS meaningfully integrates **6 Google services**:

| Service | Usage |
|---|---|
| **Google Gemini 2.0 Flash** | Core AI engine — 6 specialized agents + 8 tool-specific AI functions |
| **Firebase Analytics** | Tracks generation events, tab navigation, and tool usage in real-time |
| **Google Analytics 4 (GA4)** | Page-level analytics with custom event tracking |
| **Google Fonts (Inter)** | Typography system — preloaded for performance |
| **Google Cloud Run** | Production deployment at `https://clubos-346015507214.us-central1.run.app` |
| **Google Cloud Build** | Automated Docker image build pipeline triggered on deploy |

---

## 🛡️ Security Implementation

- **Input Sanitization**: All user input sanitized against XSS before AI processing
- **API Key Security**: Keys stored in localStorage, never transmitted to any server other than Google's API
- **HTTP Security Headers**: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`
- **JSON Schema Enforcement**: Strict AI output contracts prevent prompt injection via output parsing
- **Safe JSON Parsing**: All localStorage reads wrapped in try/catch
- **Input Length Limits**: `maxLength={2000}` enforced on all user inputs

---

## ♿ Accessibility

- Skip navigation link for keyboard users
- `aria-label` on all interactive elements
- `aria-current="page"` on active navigation items
- `aria-hidden="true"` on decorative icons
- `aria-describedby` on the main input textarea
- `role="application"` on app root
- Semantic `<nav>`, `<main>`, `<header>`, `<footer>` HTML5 elements

---

## 🧪 Testing

- **32 passing unit tests** across 2 test files
- Tests cover: agent schema validation, XSS sanitization, input validation, localStorage safety, INR formatting
- Framework: Vitest + @testing-library/jest-dom + jsdom
- Run with: `npm test`

---

## 📦 Tech Stack

- **Frontend**: React 19 + Vite 6
- **Styling**: Tailwind CSS V4 + Lucide React
- **AI**: Google Gemini 2.0 Flash (`@google/generative-ai`)
- **Analytics**: Firebase Analytics + Google Analytics 4
- **Exports**: pptxgenjs, html2canvas, qrcode, JSZip, jsPDF, Chart.js

---

## ⚙️ Quick Start

```bash
git clone https://github.com/SkaaBroach853/ClubOS.git
cd ClubOS
npm install
npm run dev
```

1. Open `localhost:5173`
2. Click **Settings ⚙️** → paste your [Gemini API Key](https://aistudio.google.com/apikey)
3. Type an event brief → **Generate Everything**

---

## 📋 Assumptions

1. Users have a valid Google Gemini API key (free tier at aistudio.google.com)
2. The CertFlow certificate backend runs separately as a Flask server
3. All AI-generated content is verified by users before distribution
4. The app targets Indian college clubs — cultural context is baked into all AI prompts

---

## 🚀 Live Demo

**Cloud Run URL**: https://clubos-346015507214.us-central1.run.app

---

<div align="center">
  <b>Built by AD Studio · PromptWars 2026 · Education & Campus Technology Vertical</b>
</div>
