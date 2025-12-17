require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io setup
const io = new Server(server, {
  cors: corsOptions
});

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database table
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        game_id VARCHAR(20) UNIQUE NOT NULL,
        game_state JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

initDB();

// Helper to emit game updates to all connected clients in a room
function emitGameUpdate(gameId, gameState) {
  io.to(gameId).emit('gameUpdate', gameState);
}

// REST API Routes

// Check if game ID exists
app.get('/api/games/:gameId/exists', async (req, res) => {
  try {
    const { gameId } = req.params;
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM games WHERE game_id = $1)',
      [gameId.toUpperCase()]
    );
    res.json({ exists: result.rows[0].exists });
  } catch (error) {
    console.error('Error checking game:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new game
app.post('/api/games', async (req, res) => {
  try {
    const { gameId, categories, questions, finalJeopardy } = req.body;

    const gameState = {
      gameId: gameId.toUpperCase(),
      categories,
      questions,
      finalJeopardy,
      teams: {},
      currentQuestion: null,
      buzzedPlayer: null,
      questionStartTime: null,
      buzzesOpen: false,
      isFinalJeopardy: false,
      finalJeopardyWagers: {},
      dailyDoubleWagers: {},
      dailyDoubleTeam: null,
      dailyDoubleRevealed: false,
      incorrectTeams: [],
      showFinalQuestion: false,
      finalJeopardyAnswers: {},
      finalJeopardyTeamAnswers: {},
      finalJeopardyRevealedAnswers: {},
      finalJeopardyScored: {},
      gameEnded: false,
      winners: [],
      finalScores: {},
      createdAt: new Date().toISOString()
    };

    await pool.query(
      'INSERT INTO games (game_id, game_state) VALUES ($1, $2)',
      [gameId.toUpperCase(), JSON.stringify(gameState)]
    );

    res.json({ success: true, gameId: gameId.toUpperCase() });
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Game ID already exists' });
    } else {
      console.error('Error creating game:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Get game by ID
app.get('/api/games/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const result = await pool.query(
      'SELECT game_state FROM games WHERE game_id = $1',
      [gameId.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(result.rows[0].game_state);
  } catch (error) {
    console.error('Error getting game:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update game state
app.put('/api/games/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const updates = req.body;

    // Get current game state
    const result = await pool.query(
      'SELECT game_state FROM games WHERE game_id = $1',
      [gameId.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Merge updates with current state
    const currentState = result.rows[0].game_state;
    const newState = { ...currentState, ...updates };

    await pool.query(
      'UPDATE games SET game_state = $1 WHERE game_id = $2',
      [JSON.stringify(newState), gameId.toUpperCase()]
    );

    // Emit update to all clients in this game room
    emitGameUpdate(gameId.toUpperCase(), newState);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete game
app.delete('/api/games/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    await pool.query('DELETE FROM games WHERE game_id = $1', [gameId.toUpperCase()]);

    // Notify clients that game was deleted
    io.to(gameId.toUpperCase()).emit('gameDeleted');

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Delete all games
app.delete('/api/admin/games', async (req, res) => {
  try {
    const { password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const result = await pool.query('DELETE FROM games RETURNING game_id');

    // Notify all game rooms
    result.rows.forEach(row => {
      io.to(row.game_id).emit('gameDeleted');
    });

    res.json({ success: true, deletedCount: result.rowCount });
  } catch (error) {
    console.error('Error deleting all games:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Verify password
app.post('/api/admin/verify', async (req, res) => {
  const { password } = req.body;
  res.json({ valid: password === process.env.ADMIN_PASSWORD });
});

// Buzz in (with race condition handling)
app.post('/api/games/:gameId/buzz', async (req, res) => {
  const client = await pool.connect();
  try {
    const { gameId } = req.params;
    const { playerName, playerTeam } = req.body;

    await client.query('BEGIN');

    // Lock the row for update
    const result = await client.query(
      'SELECT game_state FROM games WHERE game_id = $1 FOR UPDATE',
      [gameId.toUpperCase()]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Game not found' });
    }

    const gameState = result.rows[0].game_state;

    // Check if someone already buzzed or buzzes are closed
    if (gameState.buzzedPlayer || !gameState.buzzesOpen) {
      await client.query('ROLLBACK');
      return res.json({ success: false, reason: 'Buzz not accepted' });
    }

    // Check if team already got this question wrong
    if (gameState.incorrectTeams && gameState.incorrectTeams.includes(playerTeam)) {
      await client.query('ROLLBACK');
      return res.json({ success: false, reason: 'Team already attempted' });
    }

    // Set buzzed player
    gameState.buzzedPlayer = {
      name: playerName,
      team: playerTeam,
      timestamp: new Date().toISOString()
    };

    await client.query(
      'UPDATE games SET game_state = $1 WHERE game_id = $2',
      [JSON.stringify(gameState), gameId.toUpperCase()]
    );

    await client.query('COMMIT');

    // Emit update
    emitGameUpdate(gameId.toUpperCase(), gameState);

    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error buzzing in:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join a game room
  socket.on('joinGame', async (gameId) => {
    const roomId = gameId.toUpperCase();
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined game ${roomId}`);

    // Send current game state
    try {
      const result = await pool.query(
        'SELECT game_state FROM games WHERE game_id = $1',
        [roomId]
      );
      if (result.rows.length > 0) {
        socket.emit('gameUpdate', result.rows[0].game_state);
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  });

  // Leave a game room
  socket.on('leaveGame', (gameId) => {
    socket.leave(gameId.toUpperCase());
    console.log(`Socket ${socket.id} left game ${gameId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
