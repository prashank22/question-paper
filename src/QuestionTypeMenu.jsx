import React from 'react';

const QuestionTypeMenu = ({ onSelectType, onClose }) => {
  const questionTypes = [
    { id: 'text', label: 'ShortAnswer', icon: 'S' },
    { id: 'paragraph', label: 'Paragraph', icon: '¶' },
    { id: 'multiple_choice', label: 'Multiple choice', icon: '◉' },
    { id: 'checkboxes', label: 'Checkboxes', icon: '☑' },
    { id: 'dropdown', label: 'Dropdown', icon: '▼' },

    { id: 'date', label: 'Date', icon: '📅' },
    
  ];

  return (
    <div className="qp-question-type-menu">
      <div className="qp-menu-backdrop" onClick={onClose}></div>
      <div className="qp-menu-content">
        {questionTypes.map(type => (
          <div 
            key={type.id}
            className="qp-menu-item"
            onClick={() => onSelectType(type.id)}
          >
            <span className="qp-menu-item-icon">{type.icon}</span>
            <span className="qp-menu-item-label">{type.label}</span>
            {type.id === 'rating' && <span className="qp-new-badge">New</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionTypeMenu;