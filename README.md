# SmartHire Job Platform 💼

SmartHire is a dual-sided AI recruitment platform. Candidates upload resumes, get AI skill matching with job recommendations, and apply to both internal and external jobs. Recruiters post jobs, evaluate resumes with AI-powered 4-dimension scoring, and manage candidates through a Kanban pipeline. Admins oversee users, roles, and platform stats.

## Tech Stack

**Frontend:** React 19, Vite 7, TailwindCSS 4, Zustand 5, React Router 7, @dnd-kit, Firebase Auth, Lucide React

**Backend:** Express, Drizzle ORM, Neon PostgreSQL, Groq SDK (Llama-3.3-70b), Multer, pdf-parse, bcryptjs, JWT, Zod, Firebase Admin SDK

**External APIs:** RapidAPI (Active-Jobs-DB / JSearch)

---

## Features by Role

### 👤 Candidate

| Feature | Description |
|---------|-------------|
| Resume Upload | Upload PDF (max 10MB), auto-parsed for skills & experience |
| Skill Matching | AI compares resume against all jobs and ranks by match % |
| Job Search | Unified search across internal + external jobs with filters (salary, type, location) |
| Save / Apply | Bookmark jobs or submit applications with cover letter |
| Applications | Track status of all submitted applications |
| History | View past resume evaluations and scores |
| Profile | Manage personal info and uploaded resume |

### 👔 Recruiter

| Feature | Description |
|---------|-------------|
| Job Management | CRUD jobs with skills, salary range, location, type |
| AI Resume Evaluation | Upload any resume → 4-dimension scoring (Skills, Experience, Education, ATS) + Hire/No-hire verdict + suggestions |
| Pipeline | Drag-and-drop Kanban board — Applied → Reviewed → Shortlisted → Hired / Rejected |
| Applicants | View and filter candidates per job |
| Stats | Dashboard with job counts, applicants, evaluations |

### 🛡️ Admin

| Feature | Description |
|---------|------------|
| User Directory | View all users, search/filter |
| Role Management | Change any user's role (candidate / recruiter / admin) |
| User Deletion | Remove users and cascading data |
| Platform Stats | Total users, jobs, applications, evaluations |

### 🤖 AI Features

- **Resume Parsing** — Extracts skills, experience, education from PDF via Groq (Llama-3.3-70b)
- **Skill Matching** — Candidate resume → job match percentage
- **Resume Evaluation** — Recruiter uploads any resume → 4-dimension scoring (0-100) + ATS analysis + Hire/No-hire verdict + actionable suggestions
- **Radial Gauge Visualization** — Each score dimension displayed as an animated SVG gauge

---

## Prerequisites

- Node.js 18+
- npm
- [Neon](https://neon.tech) PostgreSQL database (free tier)
- [Groq](https://console.groq.com) API key (free)
- [Firebase](https://console.firebase.google.com) project (free tier)
- [RapidAPI](https://rapidapi.com) key for Active-Jobs-DB / JSearch (optional, for external jobs)

---

## Setup Guide

### 1. Clone and install

```bash
git clone https://github.com/Ashay1111-at/SmartHire.git
cd SmartHire

# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure environment

**`server/.env`**:
```env
PORT=5000
NEON_DATABASE_URL=postgresql://user:pass@ep-xxx.us-west-2.aws.neon.tech/neondb
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
GROQ_API_KEY=gsk_your_groq_key
CLIENT_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your-firebase-project-id
```

**`client/.env`**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_RAPIDAPI_KEY=your-rapidapi-key
```

### 3. Firebase setup

1. [Firebase Console](https://console.firebase.google.com) → Create project
2. **Authentication → Sign-in method** → Enable **Google** provider
3. **Project Settings → General → Your apps → Add app → Web** — copy the config values into `client/.env`
4. **Project Settings → Service accounts → Firebase Admin SDK → Generate new private key** (for production only; dev mode works with just `FIREBASE_PROJECT_ID`)

### 4. Database

```bash
cd server
npx drizzle-kit push
```

### 5. Run

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Visit `http://localhost:5173`

---

## Deployment

### Option A — Render (recommended for backend)

1. Create a **Web Service** from your GitHub repo
2. **Root Directory:** `server`
3. **Build Command:** `npm install`
4. **Start Command:** `node server.js`
5. Add all environment variables from `server/.env` in Render dashboard
6. Ensure `CLIENT_URL` points to your frontend URL

### Option B — Vercel / Netlify (frontend)

Build:
```bash
cd client
npm run build
```

Deploy the `client/dist` folder. Set the environment variables in the hosting dashboard.

### Option C — Docker (if preferred)

```bash
docker build -t smarthire-server ./server
docker run -p 5000:5000 --env-file ./server/.env smarthire-server
```

---

## Project Structure

```
SmartHire/
├── client/                    # React frontend (Vite)
│   ├── public/
│   └── src/
│       ├── components/        # Shared UI (Navbar, ErrorBoundary, ProtectedRoute)
│       ├── context/           # Legacy AuthContext (Firebase compat)
│       ├── hooks/             # useAnalysis (API wrappers)
│       ├── pages/             # All route pages
│       ├── store/             # Zustand stores (auth, jobs, recruiter)
│       ├── utils/             # Axios api helper
│       ├── firebase.js        # Firebase init & auth helpers
│       └── ...
├── server/                    # Express backend
│   └── src/
│       ├── config/            # Firebase Admin init
│       ├── controllers/       # auth, candidate, job, recruiter, admin, history
│       ├── db/                # Drizzle schema + Neon connection
│       ├── middleware/        # auth (JWT protect + role authorize), upload, errorHandler
│       ├── routes/            # Centralized api.js
│       └── services/          # Groq AI service, PDF parsing
└── README.md
```

---

## Environment Variables Reference

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default 5000) |
| `NEON_DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `JWT_REFRESH_SECRET` | Yes | JWT refresh token secret |
| `GROQ_API_KEY` | Yes | Groq API key for AI features |
| `CLIENT_URL` | Yes | Frontend URL (CORS) |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID (for Google OAuth) |
| `FIREBASE_SERVICE_ACCOUNT` | No | Full service account JSON (production) |

### Client (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_RAPIDAPI_KEY` | No | RapidAPI key for external job search |

---

## API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register` | - | - | Email/password register |
| POST | `/api/auth/login` | - | - | Email/password login |
| POST | `/api/auth/google` | - | - | Google OAuth sign-in |
| POST | `/api/auth/refresh` | - | - | Refresh JWT token |
| GET | `/api/auth/me` | JWT | any | Current user profile |
| POST | `/api/resume/upload` | JWT | candidate | Upload PDF resume |
| GET | `/api/resume/matches` | JWT | candidate | AI skill match results |
| GET | `/api/resume/profile` | JWT | candidate | Candidate profile |
| PATCH | `/api/resume/profile` | JWT | candidate | Update profile |
| GET | `/api/jobs` | JWT | candidate | List internal jobs |
| GET | `/api/jobs/saved` | JWT | candidate | Saved jobs |
| POST | `/api/jobs/:id/apply` | JWT | candidate | Apply to job |
| POST | `/api/jobs/:id/save` | JWT | candidate | Save job |
| DELETE | `/api/jobs/:id/save` | JWT | candidate | Unsave job |
| GET | `/api/applications` | JWT | candidate | My applications |
| GET | `/api/recruiter/jobs` | JWT | recruiter | My job listings |
| POST | `/api/recruiter/jobs` | JWT | recruiter | Create job |
| PATCH | `/api/recruiter/jobs/:id` | JWT | recruiter | Update job |
| DELETE | `/api/recruiter/jobs/:id` | JWT | recruiter | Delete job |
| GET | `/api/recruiter/jobs/:id/applicants` | JWT | recruiter | Job applicants |
| POST | `/api/recruiter/evaluate` | JWT | recruiter | AI resume evaluation |
| GET | `/api/recruiter/scores` | JWT | recruiter | Evaluation history |
| GET | `/api/recruiter/pipeline` | JWT | recruiter | Kanban pipeline |
| GET | `/api/recruiter/stats` | JWT | recruiter | Dashboard stats |
| PATCH | `/api/applications/:id/status` | JWT | recruiter | Update application status |
| GET | `/api/admin/users` | JWT | admin | All users |
| PUT | `/api/admin/users/:id/role` | JWT | admin | Change user role |
| DELETE | `/api/admin/users/:id` | JWT | admin | Delete user |
| GET | `/api/admin/stats` | JWT | admin | Platform stats |
| GET | `/api/history` | JWT | any | Evaluation history |

---

## Author

Ashay Thorat
