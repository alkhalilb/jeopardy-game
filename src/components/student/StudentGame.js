import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, onSnapshot, updateDoc, doc, runTransaction } from 'firebase/firestore';
import { db } from '../../firebase';

function StudentGame() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [gameDoc, setGameDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerName] = useState(sessionStorage.getItem('playerName'));
  const [playerTeam, setPlayerTeam] = useState(sessionStorage.getItem('playerTeam'));
  const [showTeamChange, setShowTeamChange] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [wager, setWager] = useState('');
  const [wagerSubmitted, setWagerSubmitted] = useState(false);
  const [finalJeopardyWager, setFinalJeopardyWager] = useState('');
  const [finalWagerSubmitted, setFinalWagerSubmitted] = useState(false);
  const [finalJeopardyAnswer, setFinalJeopardyAnswer] = useState('');
  const [finalAnswerSubmitted, setFinalAnswerSubmitted] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'games'), where('gameId', '==', gameId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0];
        setGameDoc(docData.id);
        setGame(docData.data());
        setLoading(false);

        // Reset wager when question changes
        const currentQ = docData.data().currentQuestion;
        if (!currentQ || !currentQ.isDailyDouble) {
          setWagerSubmitted(false);
          setWager('');
        }
      }
    });

    return () => unsubscribe();
  }, [gameId]);

  // Auto-populate wager when a teammate confirms
  useEffect(() => {
    if (!game || !game.dailyDoubleWagers || !playerTeam || wagerSubmitted) return;

    const playerKey = `${playerTeam}-${playerName}`;
    const wagers = game.dailyDoubleWagers;

    // Check if this player already has a wager in Firebase
    if (wagers[playerKey]) {
      // Update local state to match Firebase
      setWager(wagers[playerKey].amount.toString());
    } else {
      // Check if any teammate has confirmed a wager
      const teamWagers = Object.entries(wagers).filter(([key]) => key.startsWith(`${playerTeam}-`));
      const confirmedWager = teamWagers.find(([_, data]) => data.confirmed);

      if (confirmedWager) {
        // Auto-populate with the confirmed wager amount
        setWager(confirmedWager[1].amount.toString());
      }
    }
  }, [game?.dailyDoubleWagers, playerTeam, playerName, wagerSubmitted]);

  // Auto-populate Final Jeopardy answer when a teammate confirms
  useEffect(() => {
    if (!game || !game.finalJeopardyAnswers || !playerTeam || finalAnswerSubmitted) return;

    const playerKey = `${playerTeam}-${playerName}`;
    const answers = game.finalJeopardyAnswers;

    // Check if this player already has an answer in Firebase
    if (answers[playerKey]) {
      // Update local state to match Firebase
      setFinalJeopardyAnswer(answers[playerKey].answer);
    } else {
      // Check if any teammate has confirmed an answer
      const teamAnswers = Object.entries(answers).filter(([key]) => key.startsWith(`${playerTeam}-`));
      const confirmedAnswer = teamAnswers.find(([_, data]) => data.confirmed);

      if (confirmedAnswer) {
        // Auto-populate with the confirmed answer
        setFinalJeopardyAnswer(confirmedAnswer[1].answer);
      }
    }
  }, [game?.finalJeopardyAnswers, playerTeam, playerName, finalAnswerSubmitted]);

  const handleBuzzIn = async () => {
    if (!game.buzzesOpen || game.buzzedPlayer) return;

    // Check if this team has already gotten this question wrong
    const incorrectTeams = game.incorrectTeams || [];
    if (incorrectTeams.includes(playerTeam)) {
      alert('Your team has already attempted this question incorrectly.');
      return;
    }

    const gameRef = doc(db, 'games', gameDoc);

    // Use transaction to prevent race conditions - only first buzz-in wins
    try {
      await runTransaction(db, async (transaction) => {
        const gameSnapshot = await transaction.get(gameRef);

        if (!gameSnapshot.exists()) {
          throw new Error('Game does not exist');
        }

        const gameData = gameSnapshot.data();

        // Check if someone has already buzzed in (race condition check)
        if (gameData.buzzedPlayer) {
          // Someone already buzzed - do nothing
          return;
        }

        // Check if buzzes are still open
        if (!gameData.buzzesOpen) {
          return;
        }

        // We're first! Set the buzzedPlayer
        transaction.update(gameRef, {
          buzzedPlayer: {
            name: playerName,
            team: playerTeam,
            timestamp: new Date()
          }
        });
      });
    } catch (error) {
      console.error('Error buzzing in:', error);
    }
  };

  const handleWagerChange = async (newWager) => {
    setWager(newWager);

    // Auto-unconfirm if wager is edited
    const gameRef = doc(db, 'games', gameDoc);
    const wagers = game.dailyDoubleWagers || {};
    const playerKey = `${playerTeam}-${playerName}`;

    if (wagers[playerKey]?.confirmed) {
      // Reset confirmation if editing after confirmation
      wagers[playerKey] = { amount: parseInt(newWager), confirmed: false };

      // Also reset confirmations of other team members
      Object.keys(wagers).forEach(key => {
        if (key.startsWith(`${playerTeam}-`)) {
          wagers[key].confirmed = false;
        }
      });

      await updateDoc(gameRef, {
        dailyDoubleWagers: wagers
      });
    }
  };

  const handleWagerSubmit = async () => {
    const wagerAmount = parseInt(wager);
    const teamScore = game.teams[playerTeam] || 0;
    const maxWager = Math.max(teamScore, 1000); // Team score OR $1000, whichever is HIGHER

    if (isNaN(wagerAmount) || wagerAmount <= 0) {
      alert('Please enter a valid wager amount');
      return;
    }

    if (wagerAmount > maxWager) {
      alert(`Maximum wager is $${maxWager}`);
      return;
    }

    // Store wager with confirmation status
    const gameRef = doc(db, 'games', gameDoc);
    const wagers = game.dailyDoubleWagers || {};
    const playerKey = `${playerTeam}-${playerName}`;

    // Check if all team members have same wager amount
    const teamWagers = Object.entries(wagers).filter(([key]) => key.startsWith(`${playerTeam}-`));
    const existingWager = teamWagers.find(([_, data]) => data.amount !== wagerAmount);

    if (existingWager && teamWagers.length > 0) {
      alert(`All team members must enter the same wager. Currently: $${existingWager[1].amount}`);
      return;
    }

    wagers[playerKey] = { amount: wagerAmount, confirmed: true };

    // Auto-populate this wager amount to other team members
    Object.keys(wagers).forEach(key => {
      if (key.startsWith(`${playerTeam}-`) && key !== playerKey && !wagers[key].confirmed) {
        wagers[key] = { amount: wagerAmount, confirmed: false };
      }
    });

    // Check if all team members on this team have confirmed
    const allTeamMembers = Object.keys(game.teams).includes(playerTeam);
    const teamConfirmed = Object.entries(wagers)
      .filter(([key]) => key.startsWith(`${playerTeam}-`))
      .every(([_, data]) => data.confirmed && data.amount === wagerAmount);

    const updateData = { dailyDoubleWagers: wagers };

    // If all team members confirmed, set the wager amount on the question
    if (teamConfirmed) {
      updateData.currentQuestion = {
        ...game.currentQuestion,
        wagerAmount: wagerAmount
      };
    }

    await updateDoc(gameRef, updateData);
    setWagerSubmitted(true);
  };

  const handleUnconfirmWager = async () => {
    const gameRef = doc(db, 'games', gameDoc);
    const wagers = game.dailyDoubleWagers || {};
    const playerKey = `${playerTeam}-${playerName}`;

    if (wagers[playerKey]) {
      wagers[playerKey] = { ...wagers[playerKey], confirmed: false };

      await updateDoc(gameRef, {
        dailyDoubleWagers: wagers
      });

      setWagerSubmitted(false);
    }
  };

  const handleFinalJeopardyWagerSubmit = async () => {
    const wagerAmount = parseInt(finalJeopardyWager);
    const teamScore = game.teams[playerTeam] || 0;

    if (isNaN(wagerAmount) || wagerAmount < 0) {
      alert('Please enter a valid wager amount');
      return;
    }

    if (wagerAmount > teamScore) {
      alert(`Maximum wager is $${teamScore}`);
      return;
    }

    // Store wager in game state - only one wager per team
    const gameRef = doc(db, 'games', gameDoc);
    const wagers = game.finalJeopardyWagers || {};

    // Check if team already has a wager
    const existingWager = wagers[playerTeam];
    if (existingWager && existingWager !== wagerAmount) {
      // Team members need to agree - show current wager
      alert(`Your team has a pending wager of $${existingWager}. All team members must enter the same amount.`);
      return;
    }

    wagers[playerTeam] = wagerAmount;

    await updateDoc(gameRef, {
      finalJeopardyWagers: wagers
    });

    setFinalWagerSubmitted(true);
  };

  const handleFinalJeopardyAnswerChange = async (newAnswer) => {
    setFinalJeopardyAnswer(newAnswer);

    // Auto-unconfirm if answer is edited after confirmation
    const gameRef = doc(db, 'games', gameDoc);
    const answers = game.finalJeopardyAnswers || {};
    const playerKey = `${playerTeam}-${playerName}`;

    if (answers[playerKey]?.confirmed) {
      // Reset confirmation if editing after confirmation
      answers[playerKey] = { answer: newAnswer, confirmed: false };

      // Also reset confirmations of other team members
      Object.keys(answers).forEach(key => {
        if (key.startsWith(`${playerTeam}-`)) {
          answers[key].confirmed = false;
        }
      });

      await updateDoc(gameRef, {
        finalJeopardyAnswers: answers
      });
    }
  };

  const handleFinalJeopardyAnswerSubmit = async () => {
    if (!finalJeopardyAnswer.trim()) {
      alert('Please enter an answer');
      return;
    }

    const gameRef = doc(db, 'games', gameDoc);
    const answers = game.finalJeopardyAnswers || {};
    const playerKey = `${playerTeam}-${playerName}`;

    // Check if all team members have same answer
    const teamAnswers = Object.entries(answers).filter(([key]) => key.startsWith(`${playerTeam}-`));
    const existingAnswer = teamAnswers.find(([_, data]) => data.answer !== finalJeopardyAnswer.trim());

    if (existingAnswer && teamAnswers.length > 0) {
      alert(`All team members must enter the same answer. Currently: "${existingAnswer[1].answer}"`);
      return;
    }

    answers[playerKey] = { answer: finalJeopardyAnswer.trim(), confirmed: true };

    // Auto-populate this answer to other team members
    Object.keys(answers).forEach(key => {
      if (key.startsWith(`${playerTeam}-`) && key !== playerKey && !answers[key].confirmed) {
        answers[key] = { answer: finalJeopardyAnswer.trim(), confirmed: false };
      }
    });

    // Check if all team members on this team have confirmed
    const teamConfirmed = Object.entries(answers)
      .filter(([key]) => key.startsWith(`${playerTeam}-`))
      .every(([_, data]) => data.confirmed && data.answer === finalJeopardyAnswer.trim());

    const updateData = { finalJeopardyAnswers: answers };

    // If all team members confirmed, set the answer for the team
    if (teamConfirmed) {
      const teamFinalAnswers = game.finalJeopardyTeamAnswers || {};
      teamFinalAnswers[playerTeam] = finalJeopardyAnswer.trim();
      updateData.finalJeopardyTeamAnswers = teamFinalAnswers;
    }

    await updateDoc(gameRef, updateData);
    setFinalAnswerSubmitted(true);
  };

  const handleUnconfirmFinalAnswer = async () => {
    const gameRef = doc(db, 'games', gameDoc);
    const answers = game.finalJeopardyAnswers || {};
    const playerKey = `${playerTeam}-${playerName}`;

    if (answers[playerKey]) {
      answers[playerKey] = { ...answers[playerKey], confirmed: false };

      await updateDoc(gameRef, {
        finalJeopardyAnswers: answers
      });

      setFinalAnswerSubmitted(false);
    }
  };

  const handleChangeTeam = async () => {
    if (!newTeamName.trim()) {
      alert('Please enter a team name');
      return;
    }

    if (newTeamName.trim() === playerTeam) {
      alert('You are already on this team');
      return;
    }

    const gameRef = doc(db, 'games', gameDoc);
    const oldTeam = playerTeam;
    const newTeam = newTeamName.trim();

    // Update teams object
    const teams = { ...game.teams };

    // Add new team if it doesn't exist
    if (!teams[newTeam]) {
      teams[newTeam] = 0;
    }

    // Check if old team has other members
    const playerKey = `${oldTeam}-${playerName}`;
    const dailyDoubleWagers = game.dailyDoubleWagers || {};
    const finalJeopardyAnswers = game.finalJeopardyAnswers || {};

    // Check all keys for team members
    const oldTeamMembers = [
      ...Object.keys(dailyDoubleWagers).filter(key => key.startsWith(`${oldTeam}-`) && key !== playerKey),
      ...Object.keys(finalJeopardyAnswers).filter(key => key.startsWith(`${oldTeam}-`) && key !== playerKey)
    ];

    // If no other members, delete the old team
    if (oldTeamMembers.length === 0) {
      delete teams[oldTeam];
    }

    // Clean up player's data from old team in daily double wagers
    const updatedDailyDoubleWagers = { ...dailyDoubleWagers };
    delete updatedDailyDoubleWagers[playerKey];

    // Clean up player's data from old team in final jeopardy answers
    const updatedFinalJeopardyAnswers = { ...finalJeopardyAnswers };
    delete updatedFinalJeopardyAnswers[playerKey];

    // Update Firebase
    await updateDoc(gameRef, {
      teams,
      dailyDoubleWagers: updatedDailyDoubleWagers,
      finalJeopardyAnswers: updatedFinalJeopardyAnswers
    });

    // Update sessionStorage and local state
    sessionStorage.setItem('playerTeam', newTeam);
    setPlayerTeam(newTeam);
    setShowTeamChange(false);
    setNewTeamName('');
    setWagerSubmitted(false);
    setWager('');
    setFinalWagerSubmitted(false);
    setFinalJeopardyWager('');
    setFinalAnswerSubmitted(false);
    setFinalJeopardyAnswer('');
  };

  if (loading) {
    return <div className="loading">Loading game...</div>;
  }

  if (!game) {
    return <div className="error">Game not found</div>;
  }

  // Show winners screen if game has ended
  if (game.gameEnded) {
    return (
      <div className="game-container">
        <div className="final-jeopardy-container" style={{ textAlign: 'center', padding: '3rem' }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '3rem', color: '#ffcc00' }}>
            GAME OVER!
          </h1>

          <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
            🏆 {game.winners.length > 1 ? 'Winners' : 'Winner'} 🏆
          </h2>

          <div style={{ fontSize: '2rem', marginBottom: '3rem', fontWeight: 'bold' }}>
            {game.winners.join(' & ')}
          </div>

          <h3 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Final Scores:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            {Object.entries(game.finalScores)
              .sort(([, a], [, b]) => b - a)
              .map(([teamName, score]) => (
                <div
                  key={teamName}
                  style={{
                    fontSize: '1.5rem',
                    padding: '1rem 2rem',
                    backgroundColor: game.winners.includes(teamName) ? 'rgba(255, 204, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    minWidth: '300px',
                    border: game.winners.includes(teamName) ? '3px solid #ffcc00' : 'none'
                  }}
                >
                  {teamName}: ${score}
                  {teamName === playerTeam && ' (Your Team!)'}
                </div>
              ))}
          </div>

          {game.winners.includes(playerTeam) && (
            <div style={{ fontSize: '2rem', marginTop: '2rem', color: '#ffcc00' }}>
              🎉 Congratulations! 🎉
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = game.currentQuestion;
  const buzzedPlayer = game.buzzedPlayer;
  const incorrectTeams = game.incorrectTeams || [];
  const teamAlreadyIncorrect = incorrectTeams.includes(playerTeam);
  const isDailyDouble = currentQuestion && currentQuestion.isDailyDouble;

  // For Daily Doubles, only the selected team can buzz
  const canBuzzDailyDouble = isDailyDouble && game.dailyDoubleTeam === playerTeam;
  const canBuzz = currentQuestion && game.buzzesOpen && !buzzedPlayer && !teamAlreadyIncorrect &&
    (!isDailyDouble || canBuzzDailyDouble);

  const teamScore = game.teams[playerTeam] || 0;

  // Organize questions by category for display
  const boardQuestions = {};
  game.categories.forEach(cat => {
    boardQuestions[cat] = game.questions.filter(q => q.category === cat);
  });

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-info">
          <div className="game-id">Game ID: {gameId}</div>
          <div>
            Player: {playerName} | Team: {playerTeam}
            <button
              onClick={() => setShowTeamChange(true)}
              style={{
                marginLeft: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Change Team
            </button>
          </div>
        </div>
        <div className="scores">
          {Object.entries(game.teams).map(([teamName, score]) => (
            <div key={teamName} className="team-score">
              <div className="team-name">{teamName}</div>
              <div className="team-amount">${score}</div>
            </div>
          ))}
        </div>
      </div>

      {!game.isFinalJeopardy && (
        <div className="jeopardy-board-wrapper">
          <div className={`jeopardy-board categories-${game.categories.length}`}>
            {game.categories.map((category, idx) => (
              <div key={idx} className="category">{category}</div>
            ))}

            {[200, 400, 600, 800, 1000].map((value) => (
              game.categories.map((category) => {
                const categoryQuestions = boardQuestions[category] || [];
                const question = categoryQuestions.find(q => q.value === value);

                return (
                  <div
                    key={`${category}-${value}`}
                    className={`question-cell ${question?.answered ? 'answered' : ''}`}
                  >
                    {question?.answered ? '' : `$${value}`}
                  </div>
                );
              })
            ))}
          </div>
        </div>
      )}

      {game.isFinalJeopardy && game.finalJeopardy && (
        <div className="final-jeopardy-container">
          <h1 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
            FINAL JEOPARDY
          </h1>
          <div style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '2rem' }}>
            Category: {game.finalJeopardy.category}
          </div>

          {!finalWagerSubmitted && !game.finalJeopardyWagers[playerTeam] && (
            <div className="wager-container">
              <h3>Place Your Team's Wager</h3>
              <div className="wager-info">
                Your team's score: ${teamScore}
                <br />
                Maximum wager: ${teamScore}
                <br />
                <strong>All team members must agree on the same wager!</strong>
              </div>
              <input
                type="number"
                className="wager-input"
                value={finalJeopardyWager}
                onChange={(e) => setFinalJeopardyWager(e.target.value)}
                placeholder="Enter wager amount"
                min="0"
                max={teamScore}
              />
              <button className="btn" onClick={handleFinalJeopardyWagerSubmit}>
                Submit Wager
              </button>
            </div>
          )}

          {(finalWagerSubmitted || game.finalJeopardyWagers[playerTeam]) && !game.showFinalQuestion && (
            <div className="success">
              Your team's wager: ${game.finalJeopardyWagers[playerTeam]}
              <br />
              Waiting for the question...
            </div>
          )}

          {game.showFinalQuestion && (
            <>
              <div className="question-text" style={{ marginTop: '3rem' }}>
                {game.finalJeopardy.question}
              </div>

              {!finalAnswerSubmitted && !game.finalJeopardyTeamAnswers?.[playerTeam] && (
                <div className="wager-container" style={{ marginTop: '2rem' }}>
                  <h3>Submit Your Team's Answer</h3>
                  <div className="wager-info">
                    <strong>All team members must agree on the same answer!</strong>
                  </div>

                  {game.finalJeopardyAnswers && Object.entries(game.finalJeopardyAnswers)
                    .filter(([key]) => key.startsWith(`${playerTeam}-`))
                    .map(([key, data]) => (
                      <div key={key} style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                        {key.split('-')[1]}: "{data.answer}" {data.confirmed ? '✓ Confirmed' : '(Pending)'}
                      </div>
                    ))}

                  <input
                    type="text"
                    className="wager-input"
                    value={finalJeopardyAnswer}
                    onChange={(e) => handleFinalJeopardyAnswerChange(e.target.value)}
                    placeholder="Enter your answer"
                    style={{ marginTop: '1rem' }}
                  />
                  <button className="btn" onClick={handleFinalJeopardyAnswerSubmit}>
                    Confirm Answer
                  </button>
                </div>
              )}

              {(finalAnswerSubmitted || game.finalJeopardyTeamAnswers?.[playerTeam]) && (
                <div className="success" style={{ marginTop: '2rem' }}>
                  Your team's answer: "{game.finalJeopardyTeamAnswers?.[playerTeam]}"
                  <br />
                  {!game.finalJeopardyRevealedAnswers?.[playerTeam] && (
                    <>
                      Waiting for instructor to reveal answers...
                      <br />
                      <button
                        className="btn"
                        onClick={handleUnconfirmFinalAnswer}
                        style={{ marginTop: '1rem', backgroundColor: '#ff9800' }}
                      >
                        Change Answer
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {currentQuestion && (
        <div
          className="question-display"
          style={{
            border: isDailyDouble
              ? 'none'
              : (game.buzzesOpen ? '8px solid #00ff00' : '8px solid #ff0000'),
            boxShadow: isDailyDouble
              ? 'none'
              : (game.buzzesOpen
                ? '0 0 40px rgba(0, 255, 0, 0.8), inset 0 0 40px rgba(0, 255, 0, 0.2)'
                : '0 0 40px rgba(255, 0, 0, 0.8), inset 0 0 40px rgba(255, 0, 0, 0.2)'),
            animation: isDailyDouble
              ? 'none'
              : (game.buzzesOpen ? 'pulse-green 2s infinite' : 'pulse-red 2s infinite'),
          }}
        >
          <div className="question-category">{currentQuestion.category}</div>
          <div className="question-value">${currentQuestion.value}</div>

          {isDailyDouble && !game.dailyDoubleRevealed && (
            <>
              <div style={{ fontSize: '4rem', color: '#ffcc00', marginBottom: '2rem', textAlign: 'center' }}>
                DAILY DOUBLE!
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {Object.entries(game.teams).map(([teamName, score]) => (
                  <div key={teamName} style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    border: teamName === playerTeam ? '2px solid #ffcc00' : '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>{teamName}</div>
                    <div style={{ fontSize: '1.5rem', color: '#ffcc00' }}>${score}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {isDailyDouble && !game.dailyDoubleRevealed && !game.dailyDoubleTeam && (
            <div style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
              Waiting for instructor to select a team...
            </div>
          )}

          {isDailyDouble && !game.dailyDoubleRevealed && game.dailyDoubleTeam && playerTeam !== game.dailyDoubleTeam && (
            <div style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
              <strong>{game.dailyDoubleTeam}</strong> will answer this Daily Double.
            </div>
          )}

          {isDailyDouble && !game.dailyDoubleRevealed && game.dailyDoubleTeam === playerTeam && !wagerSubmitted && (
            <div className="wager-container">
              <h3>Place Your Wager</h3>
              <div className="wager-info">
                Your team's score: ${teamScore}
                <br />
                Maximum wager: ${Math.max(teamScore, 1000)} (team score OR $1000, whichever is higher)
                <br />
                <strong>All team members must confirm the same wager!</strong>
              </div>

              {game.dailyDoubleWagers && Object.entries(game.dailyDoubleWagers)
                .filter(([key]) => key.startsWith(`${playerTeam}-`))
                .map(([key, data]) => (
                  <div key={key} style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                    {key.split('-')[1]}: ${data.amount} {data.confirmed ? '✓ Confirmed' : '(Pending)'}
                  </div>
                ))}

              <input
                type="number"
                className="wager-input"
                value={wager}
                onChange={(e) => handleWagerChange(e.target.value)}
                placeholder="Enter wager amount"
                min="1"
                max={Math.max(teamScore, 1000)}
              />
              <button className="btn" onClick={handleWagerSubmit}>
                Confirm Wager
              </button>
            </div>
          )}

          {isDailyDouble && !game.dailyDoubleRevealed && game.dailyDoubleTeam === playerTeam && wagerSubmitted && (
            <div className="success">
              Wager confirmed: ${wager}
              <br />
              Waiting for instructor to reveal question...
              <br />
              <button
                className="btn"
                onClick={handleUnconfirmWager}
                style={{ marginTop: '1rem', backgroundColor: '#ff9800' }}
              >
                Change Wager
              </button>
            </div>
          )}

          {isDailyDouble && (
            <div style={{ fontSize: '3rem', color: '#ffcc00', marginBottom: '1rem' }}>
              DAILY DOUBLE!
            </div>
          )}

          {isDailyDouble && game.dailyDoubleRevealed && (
            <div className="question-text">{currentQuestion.question}</div>
          )}

          {!isDailyDouble && (
            <>
              <div className="buzz-status">
                <strong>Buzzes: </strong>
                {game.buzzesOpen ? (
                  <span style={{ color: '#00ff00', fontSize: '1.8rem' }}>OPEN</span>
                ) : (
                  <span style={{ color: '#ff0000', fontSize: '1.8rem' }}>CLOSED</span>
                )}
              </div>

              {teamAlreadyIncorrect && (
                <div style={{
                  backgroundColor: 'rgba(255, 0, 0, 0.3)',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '1.2rem',
                  textAlign: 'center',
                  border: '2px solid #ff0000'
                }}>
                  ⚠️ Your team cannot buzz - already attempted incorrectly
                </div>
              )}

              <div className="question-text">{currentQuestion.question}</div>

              {buzzedPlayer && (
                <div className="buzz-info">
                  <div>🔔 BUZZED IN!</div>
                  <div className="player-name">{buzzedPlayer.name}</div>
                  <div className="team-name">Team: {buzzedPlayer.team}</div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {currentQuestion && !isDailyDouble && (
        <div className="buzz-container">
          <button
            className={`buzz-btn ${!canBuzz ? 'crossed' : ''}`}
            onClick={handleBuzzIn}
            disabled={!canBuzz}
          >
            BUZZ IN
          </button>
        </div>
      )}

      {/* Team Change Dialog */}
      {showTeamChange && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 999,
            }}
            onClick={() => setShowTeamChange(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#1a1a2e',
              padding: '2rem',
              borderRadius: '12px',
              zIndex: 1000,
              minWidth: '400px',
              border: '2px solid #0f3460',
            }}
          >
            <h2 style={{ marginBottom: '1.5rem', color: 'white' }}>Change Team</h2>
            <p style={{ marginBottom: '1rem', color: '#ccc' }}>
              Current Team: <strong>{playerTeam}</strong>
            </p>
            <p style={{ marginBottom: '1rem', color: '#ffaa00', fontSize: '0.9rem' }}>
              ⚠️ Changing teams will reset your wagers and answers for this round.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>
                New Team Name:
              </label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter new team name"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '4px',
                  border: '1px solid #0f3460',
                  backgroundColor: '#0f3460',
                  color: 'white',
                  fontSize: '1rem',
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleChangeTeam();
                  }
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleChangeTeam}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                }}
              >
                Change Team
              </button>
              <button
                onClick={() => {
                  setShowTeamChange(false);
                  setNewTeamName('');
                }}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StudentGame;
