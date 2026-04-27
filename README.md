# Healthcare with AI

An AI-powered healthcare management platform that connects patients, doctors, nurses, and administrators on a single system — combining electronic health records, appointment scheduling, prescription management, and a suite of medical AI models for retinal, skin, and thyroid disease detection.

---

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Quick Start (Local Development)](#quick-start-local-development)
- [Configuration](#configuration)
- [Deployment](#deployment)
  - [EC2 (recommended)](#ec2-recommended)
  - [Docker (single-host monolith)](#docker-single-host-monolith)
  - [Render (Blueprint)](#render-blueprint)
- [API Reference](#api-reference)
- [Roles & Access Control](#roles--access-control)
- [Troubleshooting](#troubleshooting)

---

## Architecture

```
                         ┌──────────────────────────┐
                         │   React Frontend (Vite)  │
                         │     served on :3000      │
                         └────────────┬─────────────┘
                                      │
                  ┌───────────────────┴────────────────────┐
                  ▼                                        ▼
        ┌──────────────────────┐                ┌──────────────────────┐
        │ Spring Boot Backend  │                │  FastAPI AI Server   │
        │       :8080          │                │        :8000         │
        │  • Auth, RBAC        │                │  • Retinal (PyTorch) │
        │  • Patients/Records  │                │  • Skin Cancer (TF)  │
        │  • Appointments/Rx   │                │  • Thyroid (sklearn) │
        │  • Gemini AI calls   │                └──────────────────────┘
        │  • Email (Resend)    │
        └──────────┬───────────┘
                   ▼
            ┌─────────────┐
            │ PostgreSQL  │   (Neon — managed)
            └─────────────┘
```

The frontend auto-detects which host it was loaded from and routes API calls to `<host>:8080/api` and AI calls to `<host>:8000` — so the same build works from `localhost`, an EC2 IP, or a custom domain. (See [`FrontEnd/src/services/api.js`](FrontEnd/src/services/api.js).)

---

## Features

### Clinical
- **Patient management** — full CRUD with medical history, emergency contacts, insurance
- **Medical records** — diagnoses, lab reports, imaging, file attachments
- **Appointments** — scheduling, status tracking (SCHEDULED / COMPLETED / CANCELLED)
- **Prescriptions** — active medication tracking, refill management
- **AI Analysis** — Gemini-powered structured analysis of patient context
- **Voice consultation** — speech-to-analysis flow for hands-free intake

### AI Detection (FastAPI)
- **Retinal Disease Detection** (ResNet50, PyTorch) — diabetic retinopathy, glaucoma indicators, AMD, cataracts, hypertensive retinopathy from fundus images
- **Skin Cancer Classification** (EfficientNet, TensorFlow) — MEL, BCC, SCC, NV, AKIEC, BKL, DF, VASC
- **Thyroid Disease Detection** (rule-based + scikit-learn) — primary/secondary/compensated hypothyroidism from lab values

### Population & Operational Intelligence
- **Outbreak Detection** — keyword + symptom-cluster heatmap on Leaflet/OSM
- **Population Intelligence** — aggregate analytics across the patient base
- **Hospital Connector** — find nearest equipped hospital, send patient profile
- **Predictive Timeline** — forward health trajectory + what-if scenarios
- **Digital Twin / Health Story** — narrative summary + Q&A on patient history
- **SOS / Emergency** — one-tap emergency dispatch with full profile push

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, Vite 5, react-router-dom 6, axios, recharts, lucide-react, Leaflet |
| Backend | Java 17, Spring Boot 3.2, Spring Data JPA, Spring WebFlux, Lombok, Maven |
| Database | PostgreSQL (Neon serverless, HikariCP pool) |
| AI Server | Python 3.11, FastAPI, uvicorn, PyTorch (CPU), TensorFlow (optional), scikit-learn, timm, OpenCV, Pillow |
| External | Google Gemini API (LLM), Resend (transactional email) |
| Deploy | Docker, EC2, PM2, systemd, Render Blueprints |

---

## Repository Layout

```
HealthCare_with_Ai/
├── FrontEnd/                  # React SPA (Vite)
│   ├── src/
│   │   ├── pages/             # Route components
│   │   ├── components/        # Layout, shared UI
│   │   ├── context/           # AuthContext (RBAC + persistence)
│   │   ├── services/api.js    # Axios client + dynamic URL resolver
│   │   └── App.jsx            # Router + ProtectedRoute
│   └── vite.config.js
│
├── BackEnd/                   # Spring Boot API
│   └── src/main/java/com/medicalai/
│       ├── controller/        # REST endpoints
│       ├── service/           # Business logic
│       ├── entity/            # JPA models
│       ├── repository/        # JPA repos
│       └── config/            # CORS, security, Gemini wiring
│
├── AI/
│   ├── fastapi_server/        # AI inference service
│   │   ├── main.py            # FastAPI app + endpoints
│   │   ├── services/          # One service per model
│   │   └── requirements.txt
│   ├── Retinal-Disease-Detection/        # ResNet50 weights + training notebook
│   ├── Skin-Cancer-Classification-using-Deep-Learning/
│   └── Thyroid-Disease-Detection/         # sklearn .pkl
│
├── Dockerfile                 # Monolith image (all services)
├── Dockerfile.integrated      # Backend + Frontend in one image (for Render)
├── entrypoint.sh              # Multi-process launcher
├── render.yaml                # Render Blueprint
└── tests/                     # Smoke tests (requests-based)
```

---

## Quick Start (Local Development)

### Prerequisites

- Java 17+, Maven 3.9+
- Node.js 20+
- Python 3.11+ (with `venv`)
- PostgreSQL connection string (we default to a hosted Neon DB; override with `DATABASE_URL`)

### 1. Spring Boot backend

```bash
cd BackEnd
./mvnw spring-boot:run     # or: mvn spring-boot:run
# → http://localhost:8080
```

### 2. FastAPI AI server

```bash
cd AI/fastapi_server
python3 -m venv venv && source venv/bin/activate
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# → http://localhost:8000   (docs at /docs)
```

> **Skin-cancer note:** TensorFlow is intentionally not pinned in `requirements.txt`. Without it, the skin-cancer service falls back to mock predictions. Install it explicitly if you need real inference: `pip install tensorflow-cpu`.

### 3. React frontend

```bash
cd FrontEnd
npm install --legacy-peer-deps
npm run dev
# → http://localhost:3000
```

The Vite dev server proxies `/api/*` to `:8080` automatically.

---

## Configuration

### Backend (`BackEnd/src/main/resources/application.properties`)

All values can be overridden by environment variables. Defaults are wired for local dev.

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port (default `8080`) |
| `DATABASE_URL` | JDBC URL (PostgreSQL) |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | DB credentials |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_API_MODEL` | Gemini model name (default `gemini-2.5-flash-lite`) |
| `RESEND_API_KEY` | Resend email API key (works on Render free tier) |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` | SMTP fallback |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Bootstrap admin credentials |

### Frontend (`FrontEnd/.env.production`)

Both values are **optional**. Leave them empty to enable runtime host detection.

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Pin the backend API URL (e.g. `/api` for integrated mode, or `https://api.example.com/api`) |
| `VITE_AI_API_BASE_URL` | Pin the FastAPI URL |

---

## Deployment

### EC2 (recommended)

1. **Provision** an EC2 instance (Ubuntu 22.04+, t3.medium or larger if you want TensorFlow).
2. **Open** security group inbound ports: `22`, `80`, `3000`, `8000`, `8080`.
3. **Clone** the repo and start each service:

   ```bash
   # Backend (run as a systemd unit or in tmux)
   cd BackEnd && ./mvnw clean package -DskipTests
   java -jar target/*.jar

   # AI server
   cd AI/fastapi_server
   python3 -m venv venv && source venv/bin/activate
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000

   # Frontend
   cd FrontEnd && npm install --legacy-peer-deps && npm run build
   npx serve -s dist -l 3000
   ```

4. **Run persistently** with PM2 or systemd. Example systemd unit:

   ```ini
   # /etc/systemd/system/healthcare-ai.service
   [Unit]
   Description=Healthcare with AI — FastAPI
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/HealthCare_with_Ai/AI/fastapi_server
   ExecStart=/home/ubuntu/HealthCare_with_Ai/AI/fastapi_server/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
   Restart=on-failure
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now healthcare-ai
   ```

   Repeat for backend (`java -jar …`) and frontend (`serve -s dist -l 3000`).

5. **Visit** `http://<ec2-public-ip>:3000`. The frontend bundle auto-detects the host and routes API/AI calls to the same IP.

### Docker (single-host monolith)

The root [`Dockerfile`](Dockerfile) builds and runs all three services in one container (frontend, backend, FastAPI). Useful for local end-to-end testing.

```bash
docker build -t healthcare-with-ai .
docker run --rm -p 3000:3000 -p 8000:8000 -p 8080:8080 \
  -e DATABASE_URL=... -e GEMINI_API_KEY=... \
  healthcare-with-ai
```

### Render (Blueprint)

[`render.yaml`](render.yaml) defines two services for free-tier deploy:

- `healthcare-with-ai` — Spring Boot serving the integrated frontend (uses [`Dockerfile.integrated`](Dockerfile.integrated))
- `healthcare-ai` — FastAPI AI server

Push to GitHub, then in Render: **New → Blueprint → connect repo**. Set the secrets marked `sync: false` in the dashboard.

---

## API Reference

### Backend (Spring Boot — `:8080/api`)

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/verify-otp`, `GET /auth/profile/{email}` |
| Patients | `GET/POST /patients`, `GET/PUT/DELETE /patients/{id}` |
| Medical Records | `GET/POST /medical-records`, `GET/PUT/DELETE /medical-records/{id}` |
| Appointments | `GET/POST /appointments`, `GET/PUT/DELETE /appointments/{id}` |
| Prescriptions | `GET/POST /prescriptions`, `GET/PUT/DELETE /prescriptions/{id}` |
| AI Analysis | `GET/POST /ai-analysis`, `GET/PUT/DELETE /ai-analysis/{id}` |
| Health Story | `GET /health-story/patient/{id}`, `POST /health-story/patient/{id}/ask` |
| Hospital Connector | `GET /hospitals/nearest/{patientId}`, `POST /hospitals/send-profile/{patientId}` |
| Predictive Timeline | `GET/POST /predictive-timeline/patient/{id}`, `POST /predictive-timeline/patient/{id}/what-if` |
| What-If Simulator | `POST /what-if/patient/{id}/simulate` |
| Population Intel | `GET /population-intelligence/analyze-all` |
| Early Warning | `GET /early-warning/detect` |
| SOS | `POST /sos` |
| Health | `GET /health` |

Detailed request/response schemas live in [`BackEnd/README.md`](BackEnd/README.md).

### AI Server (FastAPI — `:8000`)

| Endpoint | Method | Body |
|---|---|---|
| `/api/v1/retinal-disease/predict` | POST | `multipart/form-data`, `files=[image…]` |
| `/api/v1/skin-cancer/predict` | POST | `multipart/form-data`, `files=[image…]` |
| `/api/v1/thyroid/predict` | POST | JSON (TSH, T3, TT4, history, etc.) |
| `/api/v1/batch/retinal-disease` | POST | `multipart/form-data` (alias) |
| `/health`, `/` | GET | — |

Interactive docs at `:8000/docs`.

---

## Roles & Access Control

| Role | Patients | Records | Appointments | Prescriptions | AI Tools | Population/Outbreak |
|---|---|---|---|---|---|---|
| `ADMIN` | full | full | full | full | full | full |
| `DOCTOR` | full | full | full | full | full | full |
| `NURSE` | read | read | full | — | — | — |
| `PATIENT` | self only | self only | self only | self only | — | — |

Enforced by `ProtectedRoute` in [`FrontEnd/src/App.jsx`](FrontEnd/src/App.jsx) and at the controller layer in the backend.

---

## Troubleshooting

**Frontend says "Network error" / can't reach backend**
The bundle uses runtime host detection. Open the page from the *same host:port pair* you intend to use (e.g. `http://1.2.3.4:3000`, not `localhost:3000` after deploying to EC2). Check that ports `8080` and `8000` are open in the EC2 security group.

**FastAPI crashes on startup with `NameError: name 'Model' is not defined`**
Fixed — the skin-cancer service now uses `from __future__ import annotations` and falls back gracefully when TensorFlow is missing. If you still hit it, pull latest.

**Skin-cancer endpoint returns the same prediction every time**
TensorFlow isn't installed, so the service is using mock output. Run `pip install tensorflow-cpu` and restart.

**`curl: (7) Failed to connect to localhost port 8000`**
The FastAPI server isn't running. Start it (see [Quick Start](#quick-start-local-development)) and confirm with `curl http://localhost:8000/health`.

**`DATABASE_URL` connection refused / SSL errors**
The default Neon URL is a placeholder. Set `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` to your own database. SSL is required (`?sslmode=require`).

**Email isn't sending on Render free tier**
Render free tier blocks SMTP. Use Resend instead — set `RESEND_API_KEY`.

---

## License

Internal / unlicensed. Add a license file before distributing.
