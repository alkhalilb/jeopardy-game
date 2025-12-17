import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

function PresentationLogin() {
  const [gameId, setGameId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!gameId.trim()) {
      setError('Please enter a Game ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify the game exists
      const q = query(collection(db, 'games'), where('gameId', '==', gameId.toUpperCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('Game not found. Please check the Game ID.');
        setLoading(false);
        return;
      }

      navigate(`/presentation/${gameId.toUpperCase()}`);
    } catch (err) {
      setError('Error joining game: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Presentation View</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Game ID</label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter game ID"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Open Presentation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PresentationLogin;
