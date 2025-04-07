import React from 'react';

const FormTitle = ({ title, description, onTitleChange, onDescriptionChange }) => {
  return (
    <div className="qp-card qp-title-card">
      <div className="qp-card-content">
        <div className="qp-title-container">
          <input
            type="text"
            className="qp-title-input"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
          <input
            type="text"
            className="qp-description-input"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default FormTitle;