# RAHONAM — Agentic AI Platform

> **Beyond standard chatbots.** A premium, full-stack agentic AI assistant platform featuring a 3D Spline robot guard login, a suite of 15+ live tools, server-sent events (SSE) streaming, deep file analysis, voice inputs/outputs, multi-theme customization, and a robust offline/local authentication fallback database.
>
>  Created by **Manohar (Reversed Creation)**.

---

## ✨ Core Features

*   🤖 **3D Spline Guardianship Login** — A modern authentication screen where a 3D interactive robot floats dynamically over a glassmorphic login panel.
*   💾 **InsForge BaaS Backend** — Secure cloud persistence for user accounts, profiles, preferences, custom themes, chat sessions, and message logs.
*   🔒 **Persistent Auth Resilience** — A double-layered safety net that automatically intercept server failures. If the InsForge server is down or returns malformed data, the app falls back to a sandboxed browser-local simulated database (`localStorage` arrays), guaranteeing seamless, uninterrupted access to all chat histories and profiles.
*   🎨 **Premium Floating UI & Glassmorphism** — Designed with vibrant gradients, neon ambient glow effects, responsive panel slide-ins, and a 4s floating animation cycle.
*   🌗 **Multi-Theme Engine** — Real-time switching between curated themes: *Default Dark*, *Cyberpunk Neon*, *Forest Moss*, *Sunset Flare*, *Aurora Glow*, *Sleek Light*, and *Cozy Sepia*.
*   🔧 **15+ Agentic Tools** — Real-time access to Weather, Web Search, News Headlines, Calculator, Wikipedia, Currency, Stock Prices, QR Code Generator, DateTime Timezones, Language Translator, Jokes/Trivia, Code Explainer, Summariser, Dictionary, and IP Lookup.
*   📁 **File Analysis Panel** — Support for uploading and parsing PDF, Word, Excel, CSV, code snippets, images, audio, and video formats.
*   🎙 **Speech I/O** — High-accuracy Web Speech API for voice dictation and synthetic Text-to-Speech output.
*   💬 **Session Management** — Export chat histories in multiple formats (`TXT`, `MD`), clear session memory, rename chats, and search logs.

---

## 🛠 Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS | High-performance Single Page Application |
| **Backend** | Python FastAPI, Uvicorn | High-concurrency async REST API & SSE streaming |
| **Database & Auth** | InsForge SDK | Postgres-based cloud auth, storage, database, and RLS |
| **Local Database** | Custom LocalStorage Sync | Automatic offline fallback for chats, settings, and users |
| **AI Orchestration** | LangChain, ChatGroq | LLaMA-3.3-70b-Versatile agent loop |
| **3D Rendering** | `@splinetool/react-spline` | Fixed, interactive 3D WebGL scenes |
| **Icons & Text** | Lucide React, Google Fonts | Orbitron (Headings), Rajdhani (Body) |

---

## 📁 Project Structure

```text
AI_Chatbox/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Environment credentials and directory setups
│   ├── models.py            # Pydantic schema contracts
│   ├── routes/              # FastAPI endpoints (chat, upload, voice, export)
│   ├── services/            # Core business logic (LangChain Agent, File Parser)
│   ├── tools/               # 15 LangChain tool declarations
│   └── requirements.txt     # Python environment requirements
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Master application and state controller
│   │   ├── main.jsx          # DOM anchor
│   │   ├── index.css         # Typography, design system, theme attributes
│   │   ├── components/       # UI Components (Sidebar, TopBar, InputBar, Modals, Auth)
│   │   ├── hooks/            # Custom hooks (useSettings, useToast)
│   │   └── utils/            # API, InsForge setup, static constants
│   ├── vercel.json           # Single Page Application routing redirects
│   ├── vite.config.js        # Vite compiler rules & development proxy
│   └── package.json          # Node dependencies
├── Start_APEX.bat           # Executable to launch both servers in parallel
├── insforge.toml            # InsForge CLI settings file
├── README.md                # Documentation guide
└── .env                     # Server-side environment secrets
```

---

## 🚀 Installation & Setup

### Prerequisites
*   **Node.js** v18 or later
*   **Python** 3.10 or later
*   **Groq API Key** ([Get free key here](https://console.groq.com))

### 1. Configure the Secrets
Create a `.env` file in the project's root folder:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### 2. Booting the Application (Recommended)
Double-click `Start_APEX.bat` in the root folder. This batch script automatically spins up:
*   The FastAPI Python backend on `http://localhost:8000`
*   The Vite React dev server on `http://localhost:5173` (and opens it in your default browser)

### 3. Manual Startup
If you wish to run the servers separately:

**Start the Python Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**Start the React Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## ☁️ Deploying the Frontend to Vercel

The application is production-ready for hosting the React frontend on **Vercel** with local/remote fallback safety:

1.  **Configure Root Directory:** Set the root directory of your Vercel deployment to `frontend`.
2.  **Vercel Routing:** The pre-configured `frontend/vercel.json` will automatically direct all path requests to `/index.html` to avoid 404 errors on refreshes.
3.  **Environment Variables:** Add the following environment variables in your Vercel dashboard:
    *   `VITE_API_BASE`: Set to your deployed FastAPI backend URL (e.g., `https://your-backend.onrender.com`).
    *   `VITE_INSFORGE_URL`: Set to `https://s4gjp3ny.ap-southeast.insforge.app`.
    *   `VITE_INSFORGE_ANON_KEY`: Set to `ik_910dedb934a5ca45ed8d4236e6b00cd4`.

---

**RAHONAM — Powered by Reversed Creation (Manohar)** ⚡
