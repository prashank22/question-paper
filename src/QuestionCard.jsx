import React from 'react';

const QuestionCard = ({ question, isSelected, onClick, onUpdate, onDelete, onDuplicate, onExportJson }) => {
  const handleRequiredToggle = () => {
    onUpdate(question.id, 'required', !question.required);
  };

  const handleCorrectAnswerSelect = (index) => {
    if (question.type === 'multiple_choice') {
      onUpdate(question.id, 'correctAnswer', index); // Single correct answer
    } else if (question.type === 'checkboxes') {
      const newCorrectAnswers = question.correctAnswers?.includes(index)
        ? question.correctAnswers.filter((ans) => ans !== index) // Remove if already selected
        : [...(question.correctAnswers || []), index]; // Ensure it's always an array
  
      onUpdate(question.id, 'correctAnswers', newCorrectAnswers);
    }
  };

  const handleMarksChange = (e) => {
    const value = parseInt(e.target.value);
    onUpdate(question.id, 'marks', isNaN(value) ? 0 : Math.max(0, value)); // Allow 0 and positive numbers
  };

  const handleKeywordsChange = (e) => {
    onUpdate(question.id, 'keywords', e.target.value.split(',').map(k => k.trim()));
  };

  // Function to get current question data in JSON format
  const getQuestionJson = () => {
    const questionData = {
      id: question.id,
      title: question.title,
      type: question.type,
      required: question.required,
      marks: question.marks || 1, // Include marks in JSON
    };

    // Add type-specific properties
    switch (question.type) {
      case 'multiple_choice':
        questionData.options = question.options;
        questionData.correctAnswer = question.correctAnswer;
        break;
      case 'checkboxes':
        questionData.options = question.options;
        questionData.correctAnswers = question.correctAnswers || [];
        break;
      case 'dropdown':
        questionData.options = question.options;
        break;
      case 'text':
      case 'paragraph':
        questionData.keywords = question.keywords || []; // Include keywords for text answers
        break;
      case 'date':
      default:
        // No additional properties needed for these types
        break;
    }

    return questionData;
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'multiple_choice':
      case 'checkboxes':
        return (
          <div className="qp-question-options">
            {question.options.map((option, index) => (
              <div key={index} className="qp-option">
                {isSelected && (
                  <input
                    type={question.type === 'multiple_choice' ? 'radio' : 'checkbox'}
                    name={`correct-${question.id}`}
                    checked={question.type === 'multiple_choice' ? question.correctAnswer === index : question.correctAnswers?.includes(index)}
                    onChange={() => handleCorrectAnswerSelect(index)}
                  />
                )}
                <div className={question.type === 'multiple_choice' ? 'qp-radio-button' : 'qp-checkbox'}></div>
                {isSelected ? (
                  <>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...question.options];
                        newOptions[index] = e.target.value;
                        onUpdate(question.id, 'options', newOptions);
                      }}
                      className="qp-option-input"
                    />
                    {question.options.length > 1 && (
                      <button
                        className="qp-remove-option"
                        onClick={() => {
                          const newOptions = question.options.filter((_, i) => i !== index);
                          onUpdate(question.id, 'options', newOptions);
                        }}
                      >
                       Remove the option ❌
                      </button>
                    )}
                  </>
                ) : (
                  <span>{option}</span>
                )}
              </div>
            ))}
            {isSelected && (
              <div className="qp-option">
                <div className={question.type === 'multiple_choice' ? 'qp-radio-button' : 'qp-checkbox'}></div>
                <button
                  className="qp-add-option"
                  onClick={() => {
                    const newOptions = [...question.options, `Option ${question.options.length + 1}`];
                    onUpdate(question.id, 'options', newOptions);
                  }}
                >
                  Add option
                </button>
              </div>
            )}
          </div>
        );

      case 'dropdown':
        return (
          <div className="qp-dropdown-container">
            <select className="qp-dropdown">
              <option value="" disabled selected>Choose</option>
              {question.options.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            {isSelected && (
              <div className="qp-options-list">
                {question.options.map((option, index) => (
                  <div key={index} className="qp-dropdown-option">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...question.options];
                        newOptions[index] = e.target.value;
                        onUpdate(question.id, 'options', newOptions);
                      }}
                      className="qp-option-input"
                    />
                  </div>
                ))}
                <button
                  className="qp-add-option"
                  onClick={() => {
                    const newOptions = [...question.options, `Option ${question.options.length + 1}`];
                    onUpdate(question.id, 'options', newOptions);
                  }}
                >
                  Add option
                </button>
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <div className="qp-date-input">
            <input type="text" placeholder="Month, day, year" disabled />
            <span className="qp-date-icon">📅</span>
          </div>
        );

      case 'paragraph':
        return (
          <div className="qp-text-answer">
            <input type="textarea" disabled placeholder="Long answer text" />
          </div>
        );

      default:
        return (
          <div className="qp-text-answer">
            <input type="text" disabled placeholder="Short answer text" />
          </div>
        );
    }
  };

  return (
    <div 
      className={`qp-card qp-question-card ${isSelected ? 'qp-card-selected' : ''}`}
      onClick={onClick}
    >
      <div className="qp-card-content">
        <div className="qp-question-header">
          {isSelected ? (
            <input
              type="text"
              className="qp-question-title-input"
              value={question.title}
              onChange={(e) => onUpdate(question.id, 'title', e.target.value)}
            />
          ) : (
            <div className="qp-question-title">{question.title}</div>
          )}
          {isSelected && (
            <select 
              className="qp-question-type-select"
              value={question.type}
              onChange={(e) => onUpdate(question.id, 'type', e.target.value)}
            >
              <option value="text">Short answer</option>
              <option value="paragraph">Paragraph</option>
              <option value="multiple_choice">Multiple choice</option>
              <option value="checkboxes">Checkboxes</option>
              <option value="dropdown">Dropdown</option>
              <option value="date">Date</option>
            </select>
          )}
        </div>

        {renderQuestionInput()}

        {isSelected && (
          <div className="qp-question-actions">
            <button 
              className="qp-icon-button"
              title="Copy the Question" 
              onClick={() => onDuplicate(question.id)}
            >
              🗐
            </button>
            <button 
              className="qp-icon-button"
              title="Delete the Question" 
              onClick={() => onDelete(question.id)}
            >
              🗑️
            </button>
            <button 
              className="qp-icon-button"
              title="Save Individual Question" 
              onClick={() => onExportJson(getQuestionJson())}
            >
              📤
            </button>

            {/* Marks input for all question types */}
            <div className="qp-marks-input">
              <span>Marks:</span>
              <input
                type="number"
                min="0"
                value={question.marks || 0}
                onChange={handleMarksChange}
                className="qp-marks-field"
              />
            </div>

            {/* Keywords input for text/paragraph questions */}
            {(question.type === 'text' || question.type === 'paragraph') && (
              <div className="qp-keywords-input">
                <span>Keywords:</span>
                <input
                  type="text"
                  value={question.keywords ? question.keywords.join(', ') : ''}
                  onChange={handleKeywordsChange}
                  className="qp-keywords-field"
                  placeholder="correct, answer, keywords"
                />
              </div>
            )}

            <div className="qp-required-toggle">
              <span>Required</span>
              <label className="qp-switch">
                <input 
                  type="checkbox"
                  checked={question.required}
                  onChange={handleRequiredToggle}
                />
                <span className="qp-slider"></span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;  