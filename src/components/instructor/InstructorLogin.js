import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

function InstructorLogin() {
  const [file, setFile] = useState(null);
  const [customGameId, setCustomGameId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const navigate = useNavigate();

  const generateGameId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const checkGameIdExists = async (gameId) => {
    const q = query(collection(db, 'games'), where('gameId', '==', gameId.toUpperCase()));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  };

  const downloadTemplate = () => {
    const template = `Science\tHistory\tLiterature\tGeography\tSports\tPop Culture
Science\t200\tThe study of living organisms\tWhat is Biology\tfalse
Science\t400\tH2O is the chemical formula for this\tWhat is Water\tfalse
Science\t600\tThe planet closest to the Sun\tWhat is Mercury\tfalse
Science\t800\tThe study of earthquakes\tWhat is Seismology\ttrue
Science\t1000\tThis force keeps us on Earth\tWhat is Gravity\tfalse
History\t200\tYear the U.S. declared independence\tWhat is 1776\tfalse
History\t400\tFirst President of the United States\tWho is George Washington\tfalse
History\t600\tThis wall fell in 1989\tWhat is the Berlin Wall\tfalse
History\t800\tWWII ended in this year\tWhat is 1945\tfalse
History\t1000\tThe ancient city destroyed by volcanic eruption\tWhat is Pompeii\tfalse
Literature\t200\tAuthor of Romeo and Juliet\tWho is William Shakespeare\tfalse
Literature\t400\tThe boy wizard with a lightning scar\tWho is Harry Potter\tfalse
Literature\t600\tGeorge Orwell wrote this dystopian novel\tWhat is 1984\tfalse
Literature\t800\tThe author of Pride and Prejudice\tWho is Jane Austen\tfalse
Literature\t1000\tMoby Dick is a novel about this animal\tWhat is a whale\tfalse
Geography\t200\tThe largest ocean on Earth\tWhat is the Pacific Ocean\tfalse
Geography\t400\tCapital of France\tWhat is Paris\tfalse
Geography\t600\tThe longest river in the world\tWhat is the Nile River\tfalse
Geography\t800\tThis desert is the largest hot desert\tWhat is the Sahara Desert\ttrue
Geography\t1000\tMount Everest is in this mountain range\tWhat are the Himalayas\tfalse
Sports\t200\tNumber of players on a basketball team\tWhat is 5\tfalse
Sports\t400\tThe Super Bowl is for this sport\tWhat is American Football\tfalse
Sports\t600\tThis golfer won the most Masters tournaments\tWho is Jack Nicklaus\tfalse
Sports\t800\tOlympic gold medals are mostly made of this\tWhat is silver\tfalse
Sports\t1000\tThis country hosted the 2016 Summer Olympics\tWhat is Brazil\tfalse
Pop Culture\t200\tThe King of Pop\tWho is Michael Jackson\tfalse
Pop Culture\t400\tThis streaming service created Stranger Things\tWhat is Netflix\tfalse
Pop Culture\t600\tTaylor Swift's fanbase is called this\tWhat are Swifties\tfalse
Pop Culture\t800\tThe highest-grossing film of all time\tWhat is Avatar\tfalse
Pop Culture\t1000\tThis social media app features short videos\tWhat is TikTok\ttrue
FINAL JEOPARDY
U.S. Presidents\tThis president was the first to live in the White House\tWho is John Adams`;

    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jeopardy-template.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseJeopardyFile = (content) => {
    const lines = content.trim().split('\n');
    const categories = [];
    const questions = [];
    let finalJeopardy = null;

    // First line should be categories separated by tabs or commas
    const categoryLine = lines[0];
    const categorySplit = categoryLine.includes('\t')
      ? categoryLine.split('\t')
      : categoryLine.split(',');

    categorySplit.forEach(cat => categories.push(cat.trim()));

    // Find where Final Jeopardy starts
    let finalJeopardyIndex = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim().toUpperCase() === 'FINAL JEOPARDY') {
        finalJeopardyIndex = i;
        break;
      }
    }

    // Parse regular questions
    const endIndex = finalJeopardyIndex > 0 ? finalJeopardyIndex : lines.length;
    for (let i = 1; i < endIndex; i++) {
      if (!lines[i].trim()) continue;

      const parts = lines[i].split('\t').length > 1
        ? lines[i].split('\t')
        : lines[i].split(',');

      if (parts.length >= 4) {
        questions.push({
          category: parts[0].trim(),
          value: parseInt(parts[1].trim()),
          question: parts[2].trim(),
          answer: parts[3].trim(),
          isDailyDouble: parts[4] && parts[4].trim().toLowerCase() === 'true',
          answered: false
        });
      }
    }

    // Parse Final Jeopardy if present
    if (finalJeopardyIndex > 0 && finalJeopardyIndex + 1 < lines.length) {
      const fjLine = lines[finalJeopardyIndex + 1];
      const fjParts = fjLine.split('\t').length > 1
        ? fjLine.split('\t')
        : fjLine.split(',');

      if (fjParts.length >= 3) {
        finalJeopardy = {
          category: fjParts[0].trim(),
          question: fjParts[1].trim(),
          answer: fjParts[2].trim()
        };
      }
    }

    return { categories, questions, finalJeopardy };
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a Jeopardy file');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);
    setProgressMessage('Starting...');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          setProgress(20);
          setProgressMessage('Reading file...');

          const content = event.target.result;
          setProgress(40);
          setProgressMessage('Parsing questions...');

          const { categories, questions, finalJeopardy } = parseJeopardyFile(content);

          if (categories.length < 3 || categories.length > 8) {
            setError(`Invalid number of categories (${categories.length}). Must have between 3 and 8 categories.`);
            setLoading(false);
            setProgress(0);
            setProgressMessage('');
            return;
          }

          if (questions.length === 0) {
            setError('No questions found. Please check your Jeopardy file.');
            setLoading(false);
            setProgress(0);
            setProgressMessage('');
            return;
          }

          setProgress(60);
          setProgressMessage(`Loaded ${categories.length} categories and ${questions.length} questions...`);

          // Use custom game ID if provided, otherwise generate random
          let gameId;
          if (customGameId.trim()) {
            gameId = customGameId.trim().toUpperCase();

            // Check if custom ID already exists
            setProgressMessage('Checking game ID availability...');
            const exists = await checkGameIdExists(gameId);
            if (exists) {
              setError(`Game ID "${gameId}" is already in use. Please choose another ID.`);
              setLoading(false);
              setProgress(0);
              setProgressMessage('');
              return;
            }
          } else {
            gameId = generateGameId();
          }

          setProgress(80);
          setProgressMessage('Creating game session...');

          // Create game in Firestore
          await addDoc(collection(db, 'games'), {
            gameId,
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
            createdAt: new Date()
          });

          setProgress(100);
          setProgressMessage('Game created! Redirecting...');

          await new Promise(resolve => setTimeout(resolve, 500));

          navigate(`/instructor/game/${gameId}`);
        } catch (err) {
          console.error('Error creating game:', err);
          setError('Error creating game: ' + err.message);
          setLoading(false);
          setProgress(0);
          setProgressMessage('');
        }
      };

      reader.readAsText(file);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Error creating game: ' + err.message);
      setLoading(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Instructor Login</h2>

        {error && <div className="error">{error}</div>}

        {loading && (
          <div className="progress-container">
            <div className="progress-message">{progressMessage}</div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              >
                <span className="progress-text">{progress}%</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Custom Game ID (optional)</label>
            <input
              type="text"
              value={customGameId}
              onChange={(e) => setCustomGameId(e.target.value)}
              placeholder="Leave blank for random ID"
              disabled={loading}
              style={{ textTransform: 'uppercase' }}
            />
            <small style={{ display: 'block', marginTop: '0.5rem', opacity: 0.8 }}>
              Create your own Game ID or leave blank for a random one
            </small>
          </div>
          <div className="form-group">
            <label>Upload Jeopardy File (.txt or .csv)</label>
            <input
              type="file"
              accept=".txt,.csv"
              onChange={handleFileChange}
              className="file-input"
              disabled={loading}
            />
            <small style={{ display: 'block', marginTop: '0.5rem', opacity: 0.8 }}>
              Format: First line = categories (tab or comma separated)<br/>
              Remaining lines: Category, Value, Question, Answer, isDailyDouble
            </small>
            <button
              type="button"
              onClick={downloadTemplate}
              disabled={loading}
              style={{
                marginTop: '1rem',
                backgroundColor: '#28a745',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem'
              }}
            >
              📥 Download Template
            </button>
          </div>
          <div className="form-group">
            <button type="submit" disabled={loading}>
              {loading ? 'Creating Game...' : 'Create Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InstructorLogin;
