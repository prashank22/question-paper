import React from 'react';

const ActionButtons = ({ onAddQuestion, onSaveForm }) => {
  return (
   <> <div className="qp-action-buttons">
      <button 
        className="qp-floating-button qp-add-button"
        title="Add Question" 
        onClick={onAddQuestion}
      > 
        +
      </button>
    </div>
    <div>
        <button 
      className="qp-floating-button qp-save-button"
      onClick={onSaveForm}
      title="Save as JSON" >
        💾
      </button>
    </div>
    </>
  );
};

export default ActionButtons;