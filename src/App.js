import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import InstructorLogin from './components/instructor/InstructorLogin';
import InstructorGame from './components/instructor/InstructorGame';
import StudentLogin from './components/student/StudentLogin';
import StudentGame from './components/student/StudentGame';
import PresentationLogin from './components/shared/PresentationLogin';
import PresentationView from './components/shared/PresentationView';
import Admin from './components/Admin';
import TemplateCreator from './components/TemplateCreator';
import './App.css';

function Home() {
  const [showHowTo, setShowHowTo] = React.useState(false);

  return (
    <div className="home-container">
      <h1>Jeopardy Game</h1>
      <div className="role-selection">
        <Link to="/instructor">
          <button className="role-btn">Instructor</button>
        </Link>
        <Link to="/student">
          <button className="role-btn">Student</button>
        </Link>
        <Link to="/presentation">
          <button className="role-btn">Presentation View</button>
        </Link>
      </div>
      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        <Link to="/admin">
          <button className="role-btn" style={{ backgroundColor: '#666', fontSize: '0.9rem' }}>
            Administrator
          </button>
        </Link>
        <Link to="/template-creator">
          <button className="role-btn" style={{ backgroundColor: '#ff9800', fontSize: '0.9rem' }}>
            🛠️ Template Creator (Beta)
          </button>
        </Link>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button
          className="role-btn"
          style={{ backgroundColor: '#ffcc00', color: '#060CE9', fontSize: '1rem' }}
          onClick={() => setShowHowTo(!showHowTo)}
        >
          {showHowTo ? 'Hide Instructions' : 'How to Use'}
        </button>
      </div>

      {showHowTo && (
        <div className="how-to-container">
          <div className="how-to-section">
            <h2>🎓 Instructor</h2>
            <p><em>💡 Tip: Access this view on your phone or personal laptop</em></p>
            <ol>
              <li>Create or upload a Jeopardy game file (.txt or .csv)</li>
              <li>Choose a custom Game ID or let the system generate one</li>
              <li>Share the Game ID with students</li>
              <li>Control the game flow: select questions, open/close buzzes, score answers</li>
              <li>For Daily Doubles: select the team, wait for wagers, reveal question, then score</li>
              <li>For Final Jeopardy: show category, wait for wagers, reveal question, score each team</li>
            </ol>
          </div>

          <div className="how-to-section">
            <h2>👥 Student</h2>
            <ol>
              <li>Enter your name and team name</li>
              <li>Enter the Game ID provided by your instructor</li>
              <li>Watch the board and buzz in when ready to answer</li>
              <li>For Daily Doubles: collaborate with teammates on wager, confirm when ready</li>
              <li>For Final Jeopardy: agree on wager and answer with your team</li>
              <li>You can change teams mid-game using the "Change Team" button</li>
            </ol>
          </div>

          <div className="how-to-section">
            <h2>📺 Presentation View</h2>
            <p><em>💡 Tip: Access this view on the projector or classroom display</em></p>
            <ol>
              <li>Enter the Game ID</li>
              <li>Display this view on a projector or large screen</li>
              <li>Shows the game board, current question, scores, and buzz-ins in real-time</li>
              <li>No controls - purely for display purposes</li>
            </ol>
          </div>

          <div className="how-to-section">
            <h2>📋 Game File Format</h2>
            <ul>
              <li><strong>3-8 categories</strong> supported (use horizontal scrolling if needed)</li>
              <li><strong>5 questions per category</strong> ($200, $400, $600, $800, $1000)</li>
              <li><strong>Daily Doubles:</strong> Mark with "true" in the last column</li>
              <li><strong>Final Jeopardy:</strong> Optional - add at the end of the file</li>
              <li>Download the template from the Instructor Login page for format details</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/instructor" element={<InstructorLogin />} />
        <Route path="/instructor/game/:gameId" element={<InstructorGame />} />
        <Route path="/student" element={<StudentLogin />} />
        <Route path="/student/game/:gameId" element={<StudentGame />} />
        <Route path="/presentation" element={<PresentationLogin />} />
        <Route path="/presentation/:gameId" element={<PresentationView />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/template-creator" element={<TemplateCreator />} />
      </Routes>
    </Router>
  );
}

export default App;
