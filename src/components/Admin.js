import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

function Admin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'Feinberg123') {
      setIsAuthenticated(true);
      setMessage('');
    } else {
      setMessage('Incorrect password');
      setPassword('');
    }
  };

  const handleDeleteAllGames = async () => {
    if (!window.confirm('Are you sure you want to delete ALL games? This cannot be undone!')) {
      return;
    }

    setDeleting(true);
    setMessage('Deleting all games...');

    try {
      const gamesCollection = collection(db, 'games');
      const snapshot = await getDocs(gamesCollection);

      const deletePromises = snapshot.docs.map(document =>
        deleteDoc(doc(db, 'games', document.id))
      );

      await Promise.all(deletePromises);

      setMessage(`Successfully deleted ${snapshot.docs.length} game(s)`);
      setDeleting(false);
    } catch (error) {
      console.error('Error deleting games:', error);
      setMessage(`Error deleting games: ${error.message}`);
      setDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="login-container">
          <h1>Administrator Access</h1>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              className="input"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn">
              Login
            </button>
          </form>
          {message && <div className="error" style={{ marginTop: '1rem' }}>{message}</div>}
          <button
            className="btn"
            onClick={() => navigate('/')}
            style={{ marginTop: '2rem', backgroundColor: '#666' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="login-container">
        <h1>Administrator Panel</h1>

        <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <h2>Database Management</h2>
          <p style={{ color: '#ff9800', marginBottom: '1rem' }}>
            ⚠️ Warning: This will delete ALL active games from the database.
          </p>

          <button
            className="btn"
            onClick={handleDeleteAllGames}
            disabled={deleting}
            style={{ backgroundColor: '#dc3545', marginBottom: '1rem' }}
          >
            {deleting ? 'Deleting...' : 'Delete All Games'}
          </button>

          {message && (
            <div className="success" style={{ marginTop: '1rem' }}>
              {message}
            </div>
          )}
        </div>

        <button
          className="btn"
          onClick={() => navigate('/')}
          style={{ backgroundColor: '#666' }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default Admin;
