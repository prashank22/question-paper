import React from 'react';

const FormHeader = ({ activeTab, setActiveTab,onPreviewClick }) => {
  return (
    <div className="qp-header">
      <div className="qp-header-tabs">
        <button 
          className={`qp-tab ${activeTab === 'questions' ? 'qp-tab-active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Questions
        </button>
        
        
      </div>
      <div className="qp-header-actions">
        <button className="qp-button" onClick={onPreviewClick}>
          Preview
        </button>
        <button className="qp-button-purple">
          Send
        </button>
        
      </div>
      
    </div>
  );
};

export default FormHeader;