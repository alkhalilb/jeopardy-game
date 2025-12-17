import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Socket.io connection
let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(API_URL, {
      transports: ['websocket', 'polling']
    });
  }
  return socket;
}

export function joinGame(gameId) {
  const sock = getSocket();
  sock.emit('joinGame', gameId);
}

export function leaveGame(gameId) {
  const sock = getSocket();
  sock.emit('leaveGame', gameId);
}

export function onGameUpdate(callback) {
  const sock = getSocket();
  sock.on('gameUpdate', callback);
  return () => sock.off('gameUpdate', callback);
}

export function onGameDeleted(callback) {
  const sock = getSocket();
  sock.on('gameDeleted', callback);
  return () => sock.off('gameDeleted', callback);
}

// REST API functions

export async function checkGameExists(gameId) {
  const response = await fetch(`${API_URL}/api/games/${gameId}/exists`);
  const data = await response.json();
  return data.exists;
}

export async function createGame({ gameId, categories, questions, finalJeopardy }) {
  const response = await fetch(`${API_URL}/api/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, categories, questions, finalJeopardy })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create game');
  }

  return response.json();
}

export async function getGame(gameId) {
  const response = await fetch(`${API_URL}/api/games/${gameId}`);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to get game');
  }

  return response.json();
}

export async function updateGame(gameId, updates) {
  const response = await fetch(`${API_URL}/api/games/${gameId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error('Failed to update game');
  }

  return response.json();
}

export async function deleteGame(gameId) {
  const response = await fetch(`${API_URL}/api/games/${gameId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete game');
  }

  return response.json();
}

export async function buzzIn(gameId, playerName, playerTeam) {
  const response = await fetch(`${API_URL}/api/games/${gameId}/buzz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, playerTeam })
  });

  if (!response.ok) {
    throw new Error('Failed to buzz in');
  }

  return response.json();
}

export async function verifyAdminPassword(password) {
  const response = await fetch(`${API_URL}/api/admin/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

  const data = await response.json();
  return data.valid;
}

export async function deleteAllGames(password) {
  const response = await fetch(`${API_URL}/api/admin/games`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete games');
  }

  return response.json();
}
