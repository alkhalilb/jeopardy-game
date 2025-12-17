# Jeopardy Game - Deployment Guide

## Current Status
- **Code**: Complete and pushed to GitHub
- **Repository**: https://github.com/alkhalilb/jeopardy-game
- **Backend**: Express + PostgreSQL + Socket.io (needs deployment)
- **Frontend**: React (needs deployment)

---

## Step 1: Deploy Backend to Railway

1. **Go to Railway Dashboard**: https://railway.com/dashboard

2. **Create New Project**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `alkhalilb/jeopardy-game`
   - Set root directory to `server`

3. **Add PostgreSQL**:
   - In the project, click "New" → "Database" → "PostgreSQL"
   - Railway will auto-inject `DATABASE_URL`

4. **Set Environment Variables** (in the backend service):
   ```
   ADMIN_PASSWORD=<your-secure-password>
   FRONTEND_URL=<your-vercel-url>  # Add after Vercel deploy
   ```

5. **Generate Domain**:
   - Click on the backend service → Settings → Generate Domain
   - Note the URL (e.g., `jeopardy-server-production.up.railway.app`)

---

## Step 2: Deploy Frontend to Vercel

1. **Go to Vercel**: https://vercel.com/new

2. **Import Git Repository**:
   - Select `alkhalilb/jeopardy-game`
   - Framework: Create React App
   - Root Directory: `.` (root)

3. **Set Environment Variable**:
   ```
   REACT_APP_API_URL=https://<your-railway-url>
   ```

4. **Deploy**

---

## Step 3: Update Railway CORS

After Vercel deploys, go back to Railway and update:
```
FRONTEND_URL=https://<your-vercel-url>
```

---

## Local Development

**Backend**:
```bash
cd server
cp .env.example .env
# Edit .env with your PostgreSQL URL and admin password
npm install
npm start
```

**Frontend**:
```bash
npm install
npm start
```

---

## Environment Variables Reference

### Backend (Railway)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (auto-set by Railway) |
| `ADMIN_PASSWORD` | Password for admin panel |
| `FRONTEND_URL` | Vercel URL for CORS |
| `PORT` | Server port (auto-set by Railway) |

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Railway backend URL |
