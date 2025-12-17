import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { joinGame, leaveGame, onGameUpdate, onGameDeleted } from '../../api';

function PresentationView() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    joinGame(gameId);

    const unsubscribeUpdate = onGameUpdate((gameState) => {
      setGame(gameState);
      setLoading(false);
    });

    const unsubscribeDelete = onGameDeleted(() => {
      setGame(null);
      setLoading(false);
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeDelete();
      leaveGame(gameId);
    };
  }, [gameId]);

  if (loading) {
    return <div className="loading">Loading game...</div>;
  }

  if (!game) {
    return <div className="error">Game not found</div>;
  }

  // Show winners screen if game has ended
  if (game.gameEnded) {
    return (
      <div className="game-container presentation-view">
        <div className="final-jeopardy-container" style={{ textAlign: 'center', padding: '3rem' }}>
          <h1 style={{ fontSize: '6rem', marginBottom: '3rem', color: '#ffcc00', textShadow: '0 0 20px rgba(255, 204, 0, 0.5)' }}>
            GAME OVER!
          </h1>

          <h2 style={{ fontSize: '4rem', marginBottom: '3rem' }}>
            {game.winners.length > 1 ? 'Winners' : 'Winner'}
          </h2>

          <div style={{ fontSize: '3.5rem', marginBottom: '4rem', fontWeight: 'bold', color: '#ffcc00' }}>
            {game.winners.join(' & ')}
          </div>

          <h3 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Final Scores:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
            {Object.entries(game.finalScores)
              .sort(([, a], [, b]) => b - a)
              .map(([teamName, score]) => (
                <div
                  key={teamName}
                  style={{
                    fontSize: '2.2rem',
                    padding: '1.5rem 3rem',
                    backgroundColor: game.winners.includes(teamName) ? 'rgba(255, 204, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    minWidth: '400px',
                    border: game.winners.includes(teamName) ? '4px solid #ffcc00' : 'none',
                    boxShadow: game.winners.includes(teamName) ? '0 0 30px rgba(255, 204, 0, 0.5)' : 'none'
                  }}
                >
                  {teamName}: ${score}
                </div>
              ))}
          </div>

          {game.winners.length === 1 && (
            <div style={{ fontSize: '3rem', marginTop: '3rem', color: '#ffcc00' }}>
              Congratulations!
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = game.currentQuestion;

  // Organize questions by category
  const boardQuestions = {};
  game.categories.forEach(cat => {
    boardQuestions[cat] = game.questions.filter(q => q.category === cat);
  });

  return (
    <div className="game-container presentation-view">
      <div className="game-header">
        <div className="scores">
          {Object.entries(game.teams).map(([teamName, score]) => (
            <div key={teamName} className="team-score">
              <div className="team-name">{teamName}</div>
              <div className="team-amount">${score}</div>
            </div>
          ))}
          {Object.keys(game.teams).length === 0 && (
            <div style={{ textAlign: 'center', opacity: 0.7 }}>
              Waiting for students to join...
            </div>
          )}
        </div>
      </div>

      {!currentQuestion && !game.isFinalJeopardy && (
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
          <h1 style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '2rem' }}>
            FINAL JEOPARDY
          </h1>
          <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem' }}>
            Category: {game.finalJeopardy.category}
          </div>

          {game.showFinalQuestion && (
            <>
              <div className="question-text" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem' }}>
                {game.finalJeopardy.question}
              </div>

              {game.finalJeopardyRevealedAnswers && Object.keys(game.finalJeopardyRevealedAnswers).length > 0 && (
                <div style={{ marginTop: '3rem' }}>
                  <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '2rem' }}>Team Answers:</h2>
                  {Object.keys(game.teams).map((teamName) => {
                    const isRevealed = game.finalJeopardyRevealedAnswers?.[teamName];
                    const teamAnswer = game.finalJeopardyTeamAnswers?.[teamName];
                    const wager = game.finalJeopardyWagers?.[teamName];

                    if (!isRevealed) return null;

                    return (
                      <div
                        key={teamName}
                        style={{
                          fontSize: '1.8rem',
                          marginBottom: '1.5rem',
                          padding: '1.5rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{teamName}</div>
                        <div style={{ fontStyle: 'italic', marginBottom: '0.3rem' }}>"{teamAnswer}"</div>
                        <div style={{ fontSize: '1.3rem', color: '#ffcc00' }}>Wager: ${wager}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {currentQuestion && !game.isFinalJeopardy && (
        <div
          className="question-display"
          style={{
            border: currentQuestion.isDailyDouble
              ? 'none'
              : (game.buzzesOpen ? '8px solid #00ff00' : '8px solid #ff0000'),
            boxShadow: currentQuestion.isDailyDouble
              ? 'none'
              : (game.buzzesOpen
                ? '0 0 40px rgba(0, 255, 0, 0.8), inset 0 0 40px rgba(0, 255, 0, 0.2)'
                : '0 0 40px rgba(255, 0, 0, 0.8), inset 0 0 40px rgba(255, 0, 0, 0.2)'),
            animation: currentQuestion.isDailyDouble
              ? 'none'
              : (game.buzzesOpen ? 'pulse-green 2s infinite' : 'pulse-red 2s infinite'),
          }}
        >
          <div className="question-category">{currentQuestion.category}</div>
          <div className="question-value">${currentQuestion.value}</div>

          {currentQuestion.isDailyDouble && !game.dailyDoubleRevealed && (
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
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>{teamName}</div>
                    <div style={{ fontSize: '1.5rem', color: '#ffcc00' }}>${score}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {currentQuestion.isDailyDouble && (
            <div style={{ fontSize: '3rem', color: '#ffcc00', marginBottom: '1rem' }}>
              DAILY DOUBLE!
            </div>
          )}

          {currentQuestion.isDailyDouble && game.dailyDoubleRevealed && (
            <div className="question-text">{currentQuestion.question}</div>
          )}

          {!currentQuestion.isDailyDouble && (
            <div className="question-text">{currentQuestion.question}</div>
          )}

          {!currentQuestion.isDailyDouble && game.buzzedPlayer && (
            <div className="buzz-info">
              <div>BUZZED IN!</div>
              <div className="player-name">{game.buzzedPlayer.name}</div>
              <div className="team-name">Team: {game.buzzedPlayer.team}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PresentationView;
