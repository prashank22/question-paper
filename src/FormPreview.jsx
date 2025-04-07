import React, { useState } from 'react';

const FormPreview = ({ title, description, questions, onClose }) => {
  const [responses, setResponses] = useState({});
  const [results, setResults] = useState(null);

  const handleInputChange = (questionId, value, isCheckbox = false, optionIndex = null) => {
    if (isCheckbox) {
      const currentSelections = responses[questionId] || [];
      let newSelections;
      
      if (currentSelections.includes(optionIndex)) {
        newSelections = currentSelections.filter(index => index !== optionIndex);
      } else {
        newSelections = [...currentSelections, optionIndex];
      }
      
      setResponses({
        ...responses,
        [questionId]: newSelections
      });
    } else {
      setResponses({
        ...responses,
        [questionId]: value
      });
    }
  };

  const evaluateAnswers = () => {
    let totalPossibleMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    let obtainedMarks = 0;
    const questionResults = questions.map(question => {
      const response = responses[question.id];
      let isCorrect = false;
      let marksAwarded = 0;

      switch (question.type) {
        case 'multiple_choice':
          isCorrect = response === question.correctAnswer;
          break;
        case 'checkboxes':
          const correctSet = new Set(question.correctAnswers || []);
          const responseSet = new Set(response || []);
          isCorrect = correctSet.size === responseSet.size && 
                     [...correctSet].every(val => responseSet.has(val));
          break;
        case 'text':
        case 'paragraph':
          if (question.keywords && question.keywords.length > 0 && response) {
            const answer = response.toLowerCase();
            isCorrect = question.keywords.some(keyword => 
              answer.includes(keyword.toLowerCase())
            );
          }
          break;
        case 'dropdown':
          isCorrect = response === question.correctAnswer;
          break;
        default:
          isCorrect = false;
      }

      if (isCorrect) {
        marksAwarded = question.marks || 0;
        obtainedMarks += marksAwarded;
      }

      return {
        questionId: question.id,
        questionTitle: question.title,
        isCorrect,
        marksAwarded,
        totalMarks: question.marks || 0,
        response,
        correctAnswer: question.type === 'multiple_choice' 
          ? question.options[question.correctAnswer]
          : question.type === 'checkboxes'
            ? question.correctAnswers?.map(i => question.options[i]).join(', ')
            : question.type === 'text' || question.type === 'paragraph'
              ? question.keywords?.join(', ')
              : question.type === 'dropdown'
                ? question.options[question.correctAnswer]
                : ''
      };
    });

    return {
      totalPossibleMarks,
      obtainedMarks,
      percentage: totalPossibleMarks > 0 ? Math.round((obtainedMarks / totalPossibleMarks) * 100) : 0,
      questionResults
    };
  };

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'text':
        return (
          <div className="preview-text-input">
            <input 
              type="text" 
              placeholder="Your answer"
              value={responses[question.id] || ''} 
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              className="preview-input"
            />
          </div>
        );
      case 'paragraph':
        return (
          <div className="preview-paragraph-input">
            <textarea 
              placeholder="Your answer"
              value={responses[question.id] || ''} 
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              className="preview-textarea"
              rows={4}
            />
          </div>
        );
      case 'multiple_choice':
        return (
          <div className="preview-options">
            {question.options.map((option, index) => (
              <div className="preview-option" key={index}>
                <label className="preview-option-label">
                  <input 
                    type="radio"
                    name={`question-${question.id}`}
                    checked={responses[question.id] === index}
                    onChange={() => handleInputChange(question.id, index)}
                  />
                  <span className="preview-option-text">{option}</span>
                </label>
              </div>
            ))}
          </div>
        );
      case 'checkboxes':
        return (
          <div className="preview-options">
            {question.options.map((option, index) => (
              <div className="preview-option" key={index}>
                <label className="preview-option-label">
                  <input 
                    type="checkbox"
                    name={`question-${question.id}-option-${index}`}
                    checked={(responses[question.id] || []).includes(index)}
                    onChange={() => handleInputChange(question.id, null, true, index)}
                  />
                  <span className="preview-option-text">{option}</span>
                </label>
              </div>
            ))}
          </div>
        );
      case 'dropdown':
        return (
          <div className="preview-dropdown">
            <select 
              value={responses[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              className="preview-select"
            >
              <option value="" disabled>Choose</option>
              {question.options.map((option, index) => (
                <option key={index} value={index}>{option}</option>
              ))}
            </select>
          </div>
        );
      case 'date':
        return (
          <div className="preview-date">
            <input 
              type="date"
              value={responses[question.id] || ''} 
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              className="preview-date-input"
            />
          </div>
        );
      default:
        return <div>Unknown question type</div>;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const missingRequired = questions
      .filter(q => q.required && !responses[q.id])
      .map(q => q.title);
      
    if (missingRequired.length > 0) {
      alert(`Please answer the following required questions: ${missingRequired.join(', ')}`);
      return;
    }
    
    const evaluationResults = evaluateAnswers();
    setResults(evaluationResults);
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="preview-results">
        <h2 className="results-title">Quiz Results</h2>
        <div className="results-summary">
          <p className="results-total-marks">
            Total Possible Marks: {results.totalPossibleMarks}
          </p>
          <p className="results-score">
            Your Score: {results.obtainedMarks}/{results.totalPossibleMarks} 
            ({results.percentage}%)
          </p>
        </div>
        
        <div className="results-details">
          {results.questionResults.map((result, index) => (
            <div key={index} className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
              <h3 className="result-question">{result.questionTitle}</h3>
              <p className="result-answer">
                <strong>Your answer:</strong> {result.response || 'No answer provided'}
              </p>
              {!result.isCorrect && result.correctAnswer && (
                <p className="result-correct">
                  <strong>Correct answer:</strong> {result.correctAnswer}
                </p>
              )}
              <p className="result-marks">
                Marks: {result.marksAwarded}/{result.totalMarks}
              </p>
            </div>
          ))}
        </div>
        
        <button 
          className="preview-close-btn" 
          onClick={() => {
            setResults(null);
            setResponses({});
          }}
        >
          Try Again
        </button>
      </div>
    );
  };

  return (
    <div className="preview-container">
      <div className="preview-header">
        <button className="preview-close-btn" onClick={onClose}>
          × Exit Preview
        </button>
      </div>
      
      <div className="preview-content">
        {results ? (
          renderResults()
        ) : (
          <div className="preview-form">
            <div className="preview-title-card">
              <h1 className="preview-title">{title}</h1>
              <p className="preview-description">{description}</p>
              <div className="preview-divider"></div>
              <p className="preview-required-note">* Required</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              {questions.map((question) => (
                <div className="preview-question-card" key={question.id}>
                  <div className="preview-question-header">
                    <h2 className="preview-question-title">
                      {question.title} {question.required && <span className="preview-required">*</span>}
                    </h2>
                    {question.marks > 0 && (
                      <span className="preview-marks">({question.marks} marks)</span>
                    )}
                  </div>
                  {renderQuestionInput(question)}
                </div>
              ))}
              
              <div className="preview-actions">
                <button type="submit" className="preview-submit-btn">
                  Submit Answers
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPreview;