# Jeopardy Game Web App

A real-time multiplayer Jeopardy game built with React and Express/PostgreSQL. Perfect for classrooms, corporate training, game nights, and virtual events.

**GitHub:** https://github.com/alkhalilb/jeopardy-game

## Features

- **Real-time Multiplayer**: WebSocket-powered instant sync across all devices
- **Visual Feedback**: Glowing borders show buzz status (red=closed, green=open)
- **Mobile First**: Large buttons and responsive design for phones/tablets
- **Smart Scoring**: Automatic point calculation with incorrect answer tracking
- **Fair Play**: Teams that answer incorrectly can't buzz again on same question
- **Three Views**: Instructor control, student play, and audience presentation
- **Full Jeopardy Rules**: Daily Doubles, Final Jeopardy, and team consensus
- **Easy Setup**: Upload custom game files in minutes
- **Admin Panel**: Password-protected database management

## Architecture

```
┌─────────────┐     ┌─────────────────────┐     ┌────────────┐
│   Vercel    │────▶│  Railway (Backend)  │────▶│ PostgreSQL │
│  (Frontend) │◀────│  Express + Socket.io │◀────│  (Railway) │
└─────────────┘     └─────────────────────┘     └────────────┘
```

- **Frontend**: React (hosted on Vercel)
- **Backend**: Express.js + Socket.io (hosted on Railway)
- **Database**: PostgreSQL (on Railway)

## Quick Start

### Local Development

**1. Start the backend:**
```bash
cd server
cp .env.example .env
# Edit .env with your PostgreSQL URL and admin password
npm install
npm start
```

**2. Start the frontend:**
```bash
# In the root directory
npm install
npm start
```

### Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

**Quick Overview:**
1. Deploy `server/` to Railway with PostgreSQL
2. Deploy root to Vercel with `REACT_APP_API_URL` pointing to Railway

## How to Play

### For Instructors (Game Host)
1. Click **"Instructor"**
2. (Optional) Click **"Download Template"** for an example file
3. (Optional) Enter a custom Game ID
4. Upload your Jeopardy file (`.txt` or `.csv`)
5. Share the Game ID with students
6. Click questions to play, control buzzes, and score answers!

### For Students (Players)
1. Click **"Student"**
2. Enter your name, team name, and Game ID
3. Watch for the **green glowing border** = buzzes are OPEN!
4. Hit the big red BUZZ button to answer

### For Presentation (Audience View)
1. Click **"Presentation View"**
2. Enter the Game ID
3. Project this screen for the audience

## Game Rules

### Correct Answer ✅
- Points added to team score
- Question closes automatically

### Incorrect Answer ❌
- Points subtracted from team score
- Team is **locked out** from buzzing again on that question
- Other teams can continue attempting

### Daily Doubles 💰
- Instructor selects which team answers
- Team members must agree on wager amount
- Maximum wager = higher of team's current score or $1000
- No buzzes - instructor immediately marks correct/incorrect

### Final Jeopardy 🏆
- All teams submit wagers
- Teams type and submit written answers with team consensus
- Instructor reveals answers one by one
- Winners displayed when game ends

## Creating Game Files

### Option 1: Download Template
Click **"Download Template"** on the instructor login page.

### Option 2: Manual Format

**Line 1 - Categories** (tab or comma separated):
```
Science	History	Literature	Geography	Sports	Pop Culture
```

**Lines 2+ - Questions** (5 fields):
```
Category	Value	Question	Answer	isDailyDouble
Science	200	The study of living organisms	What is Biology	false
Science	800	The study of earthquakes	What is Seismology	true
```

**Final Jeopardy** (optional, add at end):
```
FINAL JEOPARDY
U.S. Presidents	This president was the first to live in the White House	Who is John Adams
```

## Environment Variables

### Backend (server/.env)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_PASSWORD` | Password for admin panel |
| `FRONTEND_URL` | Frontend URL for CORS |
| `PORT` | Server port (default: 3001) |

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API URL |

## Technologies

- **Frontend**: React 18, React Router v6, Socket.io-client
- **Backend**: Express.js, Socket.io, PostgreSQL (pg)
- **Hosting**: Vercel (frontend), Railway (backend + database)

## License

Open source for educational and personal use.
