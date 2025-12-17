import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TemplateCreator() {
  const navigate = useNavigate();
  const [numCategories, setNumCategories] = useState(6);
  const [categories, setCategories] = useState(Array(6).fill(''));
  const [questions, setQuestions] = useState(
    Array(6).fill(null).map(() =>
      Array(5).fill(null).map((_, idx) => ({
        value: (idx + 1) * 200,
        question: '',
        answer: '',
        isDailyDouble: false
      }))
    )
  );
  const [finalJeopardy, setFinalJeopardy] = useState({
    enabled: true,
    category: '',
    question: '',
    answer: ''
  });

  const handleCategoryCountChange = (count) => {
    const newCount = parseInt(count);
    if (newCount < 3 || newCount > 8) return;

    setNumCategories(newCount);

    // Adjust categories array
    const newCategories = [...categories];
    if (newCount > categories.length) {
      // Add empty categories
      while (newCategories.length < newCount) {
        newCategories.push('');
      }
    } else {
      // Remove excess categories
      newCategories.splice(newCount);
    }
    setCategories(newCategories);

    // Adjust questions array
    const newQuestions = [...questions];
    if (newCount > questions.length) {
      // Add empty question sets
      while (newQuestions.length < newCount) {
        newQuestions.push(
          Array(5).fill(null).map((_, idx) => ({
            value: (idx + 1) * 200,
            question: '',
            answer: '',
            isDailyDouble: false
          }))
        );
      }
    } else {
      // Remove excess question sets
      newQuestions.splice(newCount);
    }
    setQuestions(newQuestions);
  };

  const handleCategoryNameChange = (index, name) => {
    const newCategories = [...categories];
    newCategories[index] = name;
    setCategories(newCategories);
  };

  const handleQuestionChange = (catIndex, qIndex, field, value) => {
    const newQuestions = [...questions];
    newQuestions[catIndex][qIndex][field] = value;
    setQuestions(newQuestions);
  };

  const handleDailyDoubleToggle = (catIndex, qIndex) => {
    const newQuestions = [...questions];
    newQuestions[catIndex][qIndex].isDailyDouble = !newQuestions[catIndex][qIndex].isDailyDouble;
    setQuestions(newQuestions);
  };

  const generateTemplate = () => {
    let content = '';

    // Header line - categories
    content += categories.join('\t') + '\n';

    // Question lines
    for (let qIndex = 0; qIndex < 5; qIndex++) {
      for (let catIndex = 0; catIndex < numCategories; catIndex++) {
        const q = questions[catIndex][qIndex];
        content += `${categories[catIndex]}\t${q.value}\t${q.question}\t${q.answer}\t${q.isDailyDouble}\n`;
      }
    }

    // Final Jeopardy
    if (finalJeopardy.enabled && finalJeopardy.category && finalJeopardy.question && finalJeopardy.answer) {
      content += 'FINAL JEOPARDY\n';
      content += `${finalJeopardy.category}\t${finalJeopardy.question}\t${finalJeopardy.answer}\n`;
    }

    return content;
  };

  const handleDownload = () => {
    const content = generateTemplate();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jeopardy_game.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const countDailyDoubles = () => {
    let count = 0;
    questions.forEach(catQuestions => {
      catQuestions.forEach(q => {
        if (q.isDailyDouble) count++;
      });
    });
    return count;
  };

  const dailyDoubleCount = countDailyDoubles();

  return (
    <div className="template-creator-container">
      <div className="template-creator-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back to Home
        </button>
        <h1>Jeopardy Template Creator</h1>
        <button onClick={handleDownload} className="download-btn">
          📥 Download Template
        </button>
      </div>

      <div className="template-creator-content">
        {/* Category Count Selector */}
        <div className="control-section">
          <label>Number of Categories (3-8):</label>
          <input
            type="number"
            min="3"
            max="8"
            value={numCategories}
            onChange={(e) => handleCategoryCountChange(e.target.value)}
            className="category-count-input"
          />
          <span className="daily-double-counter">
            Daily Doubles: {dailyDoubleCount} (Recommended: 1-3)
          </span>
        </div>

        {/* Category Names */}
        <div className="category-names-section">
          <h2>Category Names</h2>
          <div className="category-names-grid">
            {categories.map((cat, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Category ${idx + 1}`}
                value={cat}
                onChange={(e) => handleCategoryNameChange(idx, e.target.value)}
                className="category-name-input"
              />
            ))}
          </div>
        </div>

        {/* Questions Grid */}
        <div className="questions-section">
          <h2>Questions</h2>
          <div className="questions-grid">
            {[200, 400, 600, 800, 1000].map((value, qIndex) => (
              <div key={qIndex} className="value-row">
                <div className="value-header">${value}</div>
                {questions.map((catQuestions, catIndex) => {
                  const q = catQuestions[qIndex];
                  return (
                    <div key={catIndex} className="question-card">
                      <div className="question-card-header">
                        <span>{categories[catIndex] || `Category ${catIndex + 1}`}</span>
                        <label className="daily-double-checkbox">
                          <input
                            type="checkbox"
                            checked={q.isDailyDouble}
                            onChange={() => handleDailyDoubleToggle(catIndex, qIndex)}
                          />
                          <span className="dd-label">DD</span>
                        </label>
                      </div>
                      <textarea
                        placeholder="Question/Clue"
                        value={q.question}
                        onChange={(e) => handleQuestionChange(catIndex, qIndex, 'question', e.target.value)}
                        className="question-input"
                        rows="3"
                      />
                      <input
                        type="text"
                        placeholder="Answer (e.g., What is...)"
                        value={q.answer}
                        onChange={(e) => handleQuestionChange(catIndex, qIndex, 'answer', e.target.value)}
                        className="answer-input"
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Final Jeopardy */}
        <div className="final-jeopardy-section">
          <div className="final-jeopardy-header">
            <h2>Final Jeopardy</h2>
            <label className="final-jeopardy-toggle">
              <input
                type="checkbox"
                checked={finalJeopardy.enabled}
                onChange={(e) => setFinalJeopardy({ ...finalJeopardy, enabled: e.target.checked })}
              />
              Include Final Jeopardy
            </label>
          </div>
          {finalJeopardy.enabled && (
            <div className="final-jeopardy-inputs">
              <input
                type="text"
                placeholder="Final Jeopardy Category"
                value={finalJeopardy.category}
                onChange={(e) => setFinalJeopardy({ ...finalJeopardy, category: e.target.value })}
                className="final-category-input"
              />
              <textarea
                placeholder="Final Jeopardy Question/Clue"
                value={finalJeopardy.question}
                onChange={(e) => setFinalJeopardy({ ...finalJeopardy, question: e.target.value })}
                className="final-question-input"
                rows="3"
              />
              <input
                type="text"
                placeholder="Final Jeopardy Answer (e.g., Who is...)"
                value={finalJeopardy.answer}
                onChange={(e) => setFinalJeopardy({ ...finalJeopardy, answer: e.target.value })}
                className="final-answer-input"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateCreator;
