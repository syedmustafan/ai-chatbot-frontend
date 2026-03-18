# AI Chatbot — Frontend

React + Vite frontend for the AI Chatbot. Uses Tailwind CSS and talks to the Django backend chat API.

**Backend repo:** [ai-chatbot-backend](https://github.com/syedmustafan/ai-chatbot-backend) — run it first for the chat API.

## CI/CD (Vercel)

Pushes to **`main`** run [`.github/workflows/deploy-vercel.yml`](.github/workflows/deploy-vercel.yml) and deploy to **https://frontend-two-hazel-29.vercel.app**.

1. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**
2. Name: **`VERCEL_TOKEN`**
3. Value: create a token at **[vercel.com/account/tokens](https://vercel.com/account/tokens)** (scope: full account or the team that owns the `frontend` project).

Until `VERCEL_TOKEN` is set, the workflow will fail on deploy.

## Prerequisites

- Node.js 18+
- Backend running at `http://localhost:8000` (or set `VITE_API_URL`)

## Setup

```bash
npm install
```

## Environment

Optional: create a `.env` in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
```

If unset, the app uses `http://localhost:8000` as the API base URL.

**Leads page (production):** set **`VITE_LEADS_API_KEY`** in Vercel (same value as backend **`LEADS_API_KEY`** / GitHub secret on the backend repo). Without it, the app won’t send `X-API-Key` and the leads API will reject requests. See backend [DEPLOY_GCP.md](https://github.com/syedmustafan/ai-chatbot-backend/blob/main/DEPLOY_GCP.md).

## Scripts

| Command    | Description                |
| ---------- | -------------------------- |
| `npm run dev`     | Start Vite dev server (default port 5173) |
| `npm run build`   | Production build to `dist/` |
| `npm run preview` | Preview production build    |

## Project structure

- `src/App.jsx` — Root app and layout
- `src/components/` — Chat UI (ChatBot, ChatWindow, ChatMessage, ChatInput, ChatHeader)
- `src/services/api.js` — `sendMessage()` calling `/api/chat/`
