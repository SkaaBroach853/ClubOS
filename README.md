<div align="center">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini 2.0 Flash">
  <br>

  <h1 align="center">🚀 ClubOS</h1>

  <p align="center">
    <strong>The Ultimate AI-Powered Ecosystem for College Clubs & Event Organizers</strong>
    <br/>
    <em>Automate everything from event ideation and marketing to certificates, budgeting, and check-ins using Google Gemini 2.0 Flash.</em>
  </p>
</div>

---

## 🌟 What is ClubOS?

**ClubOS** is a massive, multi-agent AI ecosystem built entirely in React designed specifically to supercharge how college clubs and organizations operate. Instead of using 10 different fragmented tools, ClubOS consolidates all of the creative, administrative, and marketing processes into a single, highly performant dashboard. 

You write one single "Event Brief" (e.g., *"We are hosting a 24-hour Web3 Hackathon for 500 students"*), and ClubOS simultaneously dispatches highly specialized AI Agents running **in parallel** to formulate social media posts, sponsorship emails, presentations, flyers, unhinged viral ideas, budgets, engaging quizzes, and much more.

---

## ⚡ Key Features

### 1. 🧠 Simultaneous AI Event Generator
Drop in an event description and hit **Generate Everything**. ClubOS dispatches `Promise.all()` requests to specialized Gemini 2.0 Flash models that concurrently generate:
- **Social Media Content**: Creates tailored content for Instagram, WhatsApp, and an interactive **LinkedIn Multi-Variant & Collab Engine**.
- **Presentation Outlines**: Generates precise presentation structures and **exports real `.pptx` files dynamically** leveraging `pptxgenjs`.
- **Flyer Generator Engine**: Autonomously drafts your poster content and generates a real-time responsive CSS/Canvas visualization, complete with one-click **"Download as PNG"** rendering via `html2canvas`.
- **Content Calendar**: A standalone vertical orchestrator mapping out exactly what to post over the next 4 weeks.

### 2. 🎓 Certificate Studio (CertFlow Integration)
A dedicated interface integrating a Flask-based automated certificate generation architecture directly into React.
- **Dynamic Connections**: Auto-pings localhost environments.
- **Drag & Drop CSV/PNG**: Instantly parses inputs natively.
- **Granular Controls**: Modify Font Sizes, Text Colors (Hex), Bold/Italics, and exact X/Y positioning.
- **Gmail Automation Suite**: Features built-in looping automation sending personalized mass certificates instantly logging each success/failure live.

### 3. 🛠️ Club Tools Arsenal (8 Full Apps Inside)
Eight fully functioning, distinct applications tailored to make campus organizing insanely easy:
1. **QR Check-In System**: Generates bulk encoded QR codes downloadable as a `.zip` via `JSZip`, and creates a live interactive scanner recording progress locally.
2. **Budget AI**: Drafts extensive financial breakdowns graphed natively on animated `Chart.js` Doughnut charts. Exports formal reports directly via `jsPDF`.
3. **Meme Generator**: Programmatically generates and paints funny, contextual text onto internet-classic meme templates directly inside HTML Canvas!
4. **Sponsor Matcher**: Algorithms pinpoint the best possible corporate targets evaluating "Fit-Scores" and autonomously structuring flawless B2B email pitches.
5. **Quiz Builder**: Dynamic, real-time testing systems that generate multiple-choice evaluations scaling from Easy to Hard. Tracks correct iterations natively.
6. **Feedback Form**: Natively configures Post-Event interactive rating systems. Stores user variables to map global feedback distributions visually natively.
7. **Timer Board**: A colossal, responsive `fullscreen` graphical stage manager emitting Web Audio API logic and Canvas Confetti to ensure your speakers finish on time.
8. **Merch Store**: Creates instant swag prototypes rendering customized typography straight overlaid onto conceptual merchandise layouts natively.

### 4. 🧪 Standalone Custom Agent Configurator
The **Settings ⚙️ Panel** isn't just for an API key. It contains a fully functional Custom Agent creator.
You can create your own specialized assistants (e.g., a "Code-of-Conduct Enforcer"), assign them specific JSON outputs, colors, and system instructions, and they immediately weave into your batch-generation flows indefinitely stored on `localStorage`.

### 5. 🕹️ Arcade Break (Mini-Games)
Since managing communities is stressful, ClubOS directly embeds flawlessly optimized **HTML5 Canvas Games**:
- **Tetris**: Native matrix collision, block rotation, bounding locks.
- **Brick Breaker**: Multi-ball physics deflections, power-ups, and level scaling.
- **Mario Run**: Endless parallaxing running constraints.
- **Flappy Bird**: Gravity physics encoded precisely alongside High Scores caching!

---

## 📦 Tech Stack

* **Frontend:** React 19 + Vite 6
* **Styling:** Tailwind CSS V4 + Lucide React Icons
* **AI Engine:** Google Generative AI JS SDK (`gemini-2.0-flash`)
* **Core Integrations:**
  * `pptxgenjs` (PPTX Generation)
  * `html2canvas` (DOM to Image conversion)
  * `qrcode` (Live encoded QR generations)
  * `jszip` (Bulk bundling architectures)
  * `chart.js` (Data visualizations)
  * `jspdf` (Native Frontend PDF creation)

---

## ⚙️ Quick Start

### 1. Requirements
Ensure you have `Node.js` installed.
You will absolutely require a Google Gemini API Key. Get one from [Google AI Studio](https://aistudio.google.com/).

### 2. Setup

1. Clone the repository natively:
   ```bash
   git clone [https://github.com/SkaaBroach853/ClubOS.git](https://github.com/SkaaBroach853/ClubOS.git)
   cd ClubOS
'''

2.  Install standard frontend dependencies:

    ```bash
    npm install
    ```

3.  Boot the Vite application:

    ```bash
    npm run dev
    ```

### 3\. Setting Your API Key

1.  Upon loading `localhost:5173`, click the **Settings** ⚙️ icon in the top right.
2.  Under **API Keys**, paste your Gemini API Key securely. It encrypts gracefully into your device's `localStorage` meaning it persists securely exclusively for you.

-----

## 🔌 Connecting CertFlow

To use the **Certificate Studio**, you must have the **[Certificate\_AD Backend](https://github.com/SkaaBroach853/Certificate_AD)** operating natively in parallel over Flask.

ClubOS dynamically routes explicit `/cert-api` backend fetches directly to `http://127.0.0.1:5000`. Set up the Python server, run `python app.py`, and ClubOS will instantly establish connection handshakes.

-----

\<div align="center"\>
\<b\>Built by AD Studio · PromptWars 2025\</b\>
\</div\>

```
```
