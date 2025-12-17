import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

function StudentLogin() {
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [gameId, setGameId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !teamName.trim() || !gameId.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Find the game
      const q = query(collection(db, 'games'), where('gameId', '==', gameId.toUpperCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('Game not found. Please check the Game ID.');
        setLoading(false);
        return;
      }

      const gameDoc = snapshot.docs[0];
      const gameData = gameDoc.data();
      const teams = gameData.teams || {};

      // Initialize team if it doesn't exist
      if (!teams[teamName]) {
        teams[teamName] = 0;
      }

      // Update game with team
      await updateDoc(doc(db, 'games', gameDoc.id), {
        teams
      });

      // Store player info in sessionStorage
      sessionStorage.setItem('playerName', name);
      sessionStorage.setItem('playerTeam', teamName);

      navigate(`/student/game/${gameId.toUpperCase()}`);
    } catch (err) {
      setError('Error joining game: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Student Login</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter your team name"
              disabled={loading}
            />
          </div>
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
              {loading ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentLogin;
