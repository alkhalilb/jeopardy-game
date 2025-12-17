import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { joinGame, leaveGame, onGameUpdate, onGameDeleted, updateGame, deleteGame } from '../../api';

function InstructorGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const gameIdRef = useRef(gameId);

  useEffect(() => {
    gameIdRef.current = gameId;

    // Join game room for real-time updates
    joinGame(gameId);

    // Listen for game updates
    const unsubscribeUpdate = onGameUpdate((gameState) => {
      setGame(gameState);
      setLoading(false);
    });

    // Listen for game deletion
    const unsubscribeDelete = onGameDeleted(() => {
      navigate('/');
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeDelete();
      leaveGame(gameId);
      // Delete game when instructor leaves
      deleteGame(gameIdRef.current).catch(err => {
        console.error('Error deleting game:', err);
      });
    };
  }, [gameId, navigate]);

  const handleQuestionClick = async (question) => {
    if (question.answered) return;

    setCurrentQuestion(question);
    setShowAnswer(false);

    await updateGame(gameId, {
      currentQuestion: question,
      buzzedPlayer: null,
      buzzesOpen: false,
      questionStartTime: new Date().toISOString(),
      incorrectTeams: [],
      dailyDoubleRevealed: false,
      dailyDoubleWagers: {},
      dailyDoubleTeam: null
    });
  };

  const handleRevealDailyDouble = async () => {
    await updateGame(gameId, {
      dailyDoubleRevealed: true
    });
  };

  const handleOpenBuzzes = async () => {
    await updateGame(gameId, {
      buzzesOpen: true
    });
  };

  const handleCloseBuzzes = async () => {
    await updateGame(gameId, {
      buzzesOpen: false
    });
  };

  const handleStartFinalJeopardy = async () => {
    await updateGame(gameId, {
      isFinalJeopardy: true,
      currentQuestion: null,
      buzzedPlayer: null,
      buzzesOpen: false,
      finalJeopardyWagers: {}
    });
  };

  const handleShowFinalQuestion = async () => {
    await updateGame(gameId, {
      showFinalQuestion: true
    });
  };

  const handleRevealAnswer = async (teamName) => {
    const revealedAnswers = game.finalJeopardyRevealedAnswers || {};
    revealedAnswers[teamName] = true;

    await updateGame(gameId, {
      finalJeopardyRevealedAnswers: revealedAnswers
    });
  };

  const handleFinalJeopardyScore = async (teamName, correct) => {
    const wager = game.finalJeopardyWagers[teamName] || 0;
    const updatedTeams = { ...game.teams };
    updatedTeams[teamName] = correct
      ? (updatedTeams[teamName] || 0) + wager
      : (updatedTeams[teamName] || 0) - wager;

    const scoredTeams = game.finalJeopardyScored || {};
    scoredTeams[teamName] = correct;

    await updateGame(gameId, {
      teams: updatedTeams,
      finalJeopardyScored: scoredTeams
    });
  };

  const handleEndFinalJeopardy = async () => {
    const teams = game.teams;
    const maxScore = Math.max(...Object.values(teams));
    const winners = Object.entries(teams)
      .filter(([_, score]) => score === maxScore)
      .map(([teamName]) => teamName);

    await updateGame(gameId, {
      gameEnded: true,
      winners: winners,
      finalScores: teams
    });
  };

  const handleCorrect = async () => {
    const question = game.currentQuestion || currentQuestion;
    if (!question) return;

    const teamName = question.isDailyDouble
      ? game.dailyDoubleTeam
      : game.buzzedPlayer?.team;

    if (!teamName) {
      console.error('No team name found');
      return;
    }

    const updatedTeams = { ...game.teams };

    let pointValue = question.value;
    if (question.isDailyDouble) {
      if (question.wagerAmount) {
        pointValue = question.wagerAmount;
      } else {
        const wagers = game.dailyDoubleWagers || {};
        const teamWager = Object.entries(wagers).find(([key]) => key.startsWith(`${teamName}-`));
        if (teamWager) {
          pointValue = teamWager[1].amount;
        }
      }
    }

    updatedTeams[teamName] = (updatedTeams[teamName] || 0) + pointValue;

    const updatedQuestions = game.questions.map(q =>
      q.question === question.question && q.value === question.value
        ? { ...q, answered: true }
        : q
    );

    await updateGame(gameId, {
      teams: updatedTeams,
      questions: updatedQuestions,
      currentQuestion: null,
      buzzedPlayer: null,
      buzzesOpen: false,
      dailyDoubleWagers: {}
    });

    setCurrentQuestion(null);
    setShowAnswer(false);
  };

  const handleIncorrect = async () => {
    const question = game.currentQuestion || currentQuestion;
    if (!question) return;

    const teamName = question.isDailyDouble
      ? game.dailyDoubleTeam
      : game.buzzedPlayer?.team;

    if (!teamName) {
      console.error('No team name found');
      return;
    }

    const updatedTeams = { ...game.teams };

    let pointValue = question.value;
    if (question.isDailyDouble) {
      if (question.wagerAmount) {
        pointValue = question.wagerAmount;
      } else {
        const wagers = game.dailyDoubleWagers || {};
        const teamWager = Object.entries(wagers).find(([key]) => key.startsWith(`${teamName}-`));
        if (teamWager) {
          pointValue = teamWager[1].amount;
        }
      }
    }

    updatedTeams[teamName] = (updatedTeams[teamName] || 0) - pointValue;

    if (question.isDailyDouble) {
      const updatedQuestions = game.questions.map(q =>
        q.question === question.question && q.value === question.value
          ? { ...q, answered: true }
          : q
      );

      await updateGame(gameId, {
        teams: updatedTeams,
        questions: updatedQuestions,
        currentQuestion: null,
        buzzedPlayer: null,
        buzzesOpen: false,
        dailyDoubleWagers: {}
      });

      setCurrentQuestion(null);
      setShowAnswer(false);
    } else {
      const incorrectTeams = game.incorrectTeams || [];
      if (!incorrectTeams.includes(teamName)) {
        incorrectTeams.push(teamName);
      }

      await updateGame(gameId, {
        teams: updatedTeams,
        buzzedPlayer: null,
        incorrectTeams: incorrectTeams,
        buzzesOpen: true
      });
    }
  };

  const handleClose = async () => {
    const updatedQuestions = game.questions.map(q =>
      q.question === currentQuestion.question && q.value === currentQuestion.value
        ? { ...q, answered: true }
        : q
    );

    await updateGame(gameId, {
      questions: updatedQuestions,
      currentQuestion: null,
      buzzedPlayer: null,
      buzzesOpen: false
    });

    setCurrentQuestion(null);
    setShowAnswer(false);
  };

  const handleLeaveGame = async () => {
    await deleteGame(gameId);
    navigate('/');
  };

  const handleSelectDailyDoubleTeam = async (teamName) => {
    await updateGame(gameId, {
      dailyDoubleTeam: teamName
    });
  };

  if (loading) {
    return <div className="loading">Loading game...</div>;
  }

  if (!game) {
    return <div className="error">Game not found</div>;
  }

  if (game.gameEnded) {
    return (
      <div className="game-container">
        <div className="final-jeopardy-container" style={{ textAlign: 'center', padding: '3rem' }}>
          <h1 style={{ fontSize: '5rem', marginBottom: '3rem', color: '#ffcc00' }}>
            GAME OVER!
          </h1>

          <h2 style={{ fontSize: '3rem', marginBottom: '2rem' }}>
            {game.winners.length > 1 ? 'Winners' : 'Winner'}
          </h2>

          <div style={{ fontSize: '2.5rem', marginBottom: '3rem', fontWeight: 'bold' }}>
            {game.winners.join(' & ')}
          </div>

          <h3 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Final Scores:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            {Object.entries(game.finalScores)
              .sort(([, a], [, b]) => b - a)
              .map(([teamName, score]) => (
                <div
                  key={teamName}
                  style={{
                    fontSize: '1.8rem',
                    padding: '1rem 2rem',
                    backgroundColor: game.winners.includes(teamName) ? 'rgba(255, 204, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    minWidth: '300px',
                    border: game.winners.includes(teamName) ? '3px solid #ffcc00' : 'none'
                  }}
                >
                  {teamName}: ${score}
                </div>
              ))}
          </div>

          <button
            className="btn"
            onClick={handleLeaveGame}
            style={{ marginTop: '3rem', fontSize: '1.5rem', padding: '1rem 2rem' }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const boardQuestions = {};
  game.categories.forEach(cat => {
    boardQuestions[cat] = game.questions.filter(q => q.category === cat);
  });

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-info">
          <div className="game-id">Game ID: {gameId}</div>
          <button
            className="leave-game-btn"
            onClick={handleLeaveGame}
            style={{
              marginLeft: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Leave Game
          </button>
        </div>
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

      {!game.isFinalJeopardy && (
        <>
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
                      onClick={() => question && handleQuestionClick(question)}
                    >
                      {question?.answered ? '' : `$${value}`}
                    </div>
                  );
                })
              ))}
            </div>
          </div>

          {game.finalJeopardy && !currentQuestion && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                className="btn"
                onClick={handleStartFinalJeopardy}
                style={{ fontSize: '1.5rem', padding: '1.5rem 3rem' }}
              >
                Start Final Jeopardy
              </button>
            </div>
          )}
        </>
      )}

      {game.isFinalJeopardy && game.finalJeopardy && (
        <div className="final-jeopardy-container">
          <h1 style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '2rem' }}>
            FINAL JEOPARDY
          </h1>
          <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
            Category: {game.finalJeopardy.category}
          </div>

          {!game.showFinalQuestion && (
            <>
              <div style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
                Waiting for teams to submit wagers...
              </div>
              <div className="wagers-display">
                {Object.entries(game.finalJeopardyWagers || {}).map(([teamName, wager]) => (
                  <div key={teamName} style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
                    {teamName}: ${wager}
                  </div>
                ))}
              </div>
              <button
                className="btn"
                onClick={handleShowFinalQuestion}
                style={{ marginTop: '2rem' }}
              >
                Show Final Jeopardy Question
              </button>
            </>
          )}

          {game.showFinalQuestion && (
            <>
              <div className="question-text" style={{ marginBottom: '3rem' }}>
                {game.finalJeopardy.question}
              </div>
              <div className="question-answer" style={{ marginBottom: '3rem' }}>
                Answer: {game.finalJeopardy.answer}
              </div>

              <div style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
                Waiting for teams to submit answers...
              </div>
              <div className="wagers-display" style={{ marginBottom: '3rem' }}>
                {Object.entries(game.finalJeopardyTeamAnswers || {}).map(([teamName, answer]) => (
                  <div key={teamName} style={{ fontSize: '1.3rem', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                    <strong>{teamName}</strong>: "{answer}"
                  </div>
                ))}
              </div>

              <div className="final-jeopardy-scoring">
                <h3>Reveal and Score Team Answers:</h3>
                {Object.keys(game.teams).map((teamName) => {
                  const isRevealed = game.finalJeopardyRevealedAnswers?.[teamName];
                  const teamAnswer = game.finalJeopardyTeamAnswers?.[teamName];
                  const isScored = game.finalJeopardyScored?.[teamName] !== undefined;
                  const wasCorrect = game.finalJeopardyScored?.[teamName];

                  return (
                    <div key={teamName} className="team-scoring" style={{ marginBottom: '1.5rem', padding: '1rem', border: '2px solid #ccc', borderRadius: '8px' }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{teamName}</span>
                        <span style={{ marginLeft: '1rem', fontSize: '1.2rem', color: '#666' }}>
                          Wager: ${game.finalJeopardyWagers?.[teamName] || 0}
                        </span>
                      </div>

                      {teamAnswer && (
                        <>
                          <div style={{ fontSize: '1.2rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                            Answer: "{teamAnswer}" {isRevealed && '(Revealed)'}
                          </div>

                          {!isRevealed && (
                            <button
                              className="btn"
                              onClick={() => handleRevealAnswer(teamName)}
                              style={{ marginRight: '1rem', backgroundColor: '#2196F3' }}
                            >
                              Reveal Answer
                            </button>
                          )}

                          {isRevealed && (
                            <>
                              <button
                                className="correct-btn"
                                onClick={() => handleFinalJeopardyScore(teamName, true)}
                                style={{
                                  marginRight: '1rem',
                                  opacity: isScored && !wasCorrect ? 0.3 : 1,
                                  cursor: isScored && !wasCorrect ? 'default' : 'pointer'
                                }}
                                disabled={isScored && !wasCorrect}
                              >
                                Correct {isScored && wasCorrect && '✓'}
                              </button>
                              <button
                                className="incorrect-btn"
                                onClick={() => handleFinalJeopardyScore(teamName, false)}
                                style={{
                                  opacity: isScored && wasCorrect ? 0.3 : 1,
                                  cursor: isScored && wasCorrect ? 'default' : 'pointer'
                                }}
                                disabled={isScored && wasCorrect}
                              >
                                Incorrect {isScored && !wasCorrect && '✓'}
                              </button>
                            </>
                          )}
                        </>
                      )}

                      {!teamAnswer && (
                        <div style={{ color: '#999', fontSize: '1.1rem' }}>Waiting for answer...</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                className="btn"
                onClick={handleEndFinalJeopardy}
                style={{ marginTop: '2rem' }}
              >
                End Final Jeopardy
              </button>
            </>
          )}
        </div>
      )}

      {game.currentQuestion && (
        <div className="question-display">
          <div className="question-category">{game.currentQuestion.category}</div>
          <div className="question-value">${game.currentQuestion.value}</div>

          {game.currentQuestion.isDailyDouble && !game.dailyDoubleRevealed && (
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

              {!game.dailyDoubleTeam && (
                <>
                  <div style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '1rem' }}>
                    Select which team gets the Daily Double:
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    {Object.keys(game.teams).map((teamName) => (
                      <button
                        key={teamName}
                        className="btn"
                        onClick={() => handleSelectDailyDoubleTeam(teamName)}
                        style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}
                      >
                        {teamName}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {game.dailyDoubleTeam && (
                <>
                  <div style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
                    <strong>{game.dailyDoubleTeam}</strong> is placing their wager...
                  </div>
                  {game.dailyDoubleWagers && Object.keys(game.dailyDoubleWagers).length > 0 && (
                    <div style={{ fontSize: '1.3rem', textAlign: 'center', marginBottom: '2rem' }}>
                      {Object.entries(game.dailyDoubleWagers).map(([player, data]) => (
                        <div key={player}>
                          {player.split('-')[1]}: ${data.amount} {data.confirmed ? '✓' : '(pending)'}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {game.currentQuestion.isDailyDouble && (
            <div style={{ fontSize: '3rem', color: '#ffcc00', marginBottom: '1rem' }}>
              DAILY DOUBLE!
            </div>
          )}

          {(!game.currentQuestion.isDailyDouble || game.dailyDoubleRevealed) && (
            <div className="question-text">{game.currentQuestion.question}</div>
          )}

          {showAnswer && (
            <div className="question-answer">Answer: {game.currentQuestion.answer}</div>
          )}

          {!game.currentQuestion.isDailyDouble && (
            <div className="buzz-status">
              <strong>Buzzes: </strong>
              {game.buzzesOpen ? (
                <span style={{ color: '#00ff00' }}>OPEN</span>
              ) : (
                <span style={{ color: '#ff0000' }}>CLOSED</span>
              )}
            </div>
          )}

          {!game.currentQuestion.isDailyDouble && game.buzzedPlayer && (
            <div className="buzz-info">
              <div>BUZZED IN!</div>
              <div className="player-name">{game.buzzedPlayer.name}</div>
              <div className="team-name">Team: {game.buzzedPlayer.team}</div>
            </div>
          )}

          <div className="instructor-controls">
            {game.currentQuestion.isDailyDouble && !game.dailyDoubleRevealed && (
              <button className="correct-btn" onClick={handleRevealDailyDouble}>
                Reveal Question
              </button>
            )}

            {game.currentQuestion.isDailyDouble && game.dailyDoubleRevealed && (
              <>
                {!showAnswer && (
                  <button className="close-btn" onClick={() => setShowAnswer(true)}>
                    Show Answer
                  </button>
                )}
                <button className="correct-btn" onClick={handleCorrect}>
                  Correct
                </button>
                <button className="incorrect-btn" onClick={handleIncorrect}>
                  Incorrect
                </button>
              </>
            )}

            {!game.currentQuestion.isDailyDouble && (
              <>
                {!game.buzzesOpen && !game.buzzedPlayer && (
                  <button className="correct-btn" onClick={handleOpenBuzzes}>
                    Open Buzzes
                  </button>
                )}
                {game.buzzesOpen && !game.buzzedPlayer && (
                  <button className="incorrect-btn" onClick={handleCloseBuzzes}>
                    Close Buzzes
                  </button>
                )}
                {!showAnswer && (
                  <button className="close-btn" onClick={() => setShowAnswer(true)}>
                    Show Answer
                  </button>
                )}
                {game.buzzedPlayer && (
                  <>
                    <button className="correct-btn" onClick={handleCorrect}>
                      Correct
                    </button>
                    <button className="incorrect-btn" onClick={handleIncorrect}>
                      Incorrect
                    </button>
                  </>
                )}
                <button className="close-btn" onClick={handleClose}>
                  Close Question
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InstructorGame;
