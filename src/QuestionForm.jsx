import React, { useState } from 'react';
import QuestionCard from './QuestionCard';

const QuestionForm = () => {
  const [questions, setQuestions] = useState([
    // Sample initial questions
    {
      id: '1',
      title: 'Sample Question',
      type: 'multiple_choice',
      options: ['Option 1', 'Option 2', 'Option 3'],
      correctAnswer: 0,
      required: false
    }
  ]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [jsonOutput, setJsonOutput] = useState('');

  const handleUpdate = (id, property, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [property]: value } : q
    ));
  };

  const handleDelete = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
    if (selectedQuestionId === id) {
      setSelectedQuestionId(null);
    }
  };

  const handleDuplicate = (id) => {
    const questionToDuplicate = questions.find(q => q.id === id);
    if (questionToDuplicate) {
      const newQuestion = {
        ...questionToDuplicate,
        id: Date.now().toString(),
        title: `${questionToDuplicate.title} (Copy)`
      };
      setQuestions([...questions, newQuestion]);
    }
  };

  const handleExportJson = (questionData) => {
    setJsonOutput(JSON.stringify(questionData, null, 2));
  };

  const handleExportAllJson = () => {
    const allQuestionsData = questions.map(question => {
      const questionData = {
        id: question.id,
        title: question.title,
        type: question.type,
        required: question.required
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
        default:
          break;
      }

      return questionData;
    });

    setJsonOutput(JSON.stringify(allQuestionsData, null, 2));
  };

  const addNewQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      title: 'New Question',
      type: 'text',
      required: false
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionId(newQuestion.id);
  };

  return (
    <div className="qp-form-builder">
      <h2>Question Form Builder</h2>
      
      <div className="qp-questions-container">
        {questions.map(question => (
          <QuestionCard
            key={question.id}
            question={question}
            isSelected={selectedQuestionId === question.id}
            onClick={() => setSelectedQuestionId(question.id)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onExportJson={handleExportJson}
          />
        ))}
        
        <button 
          className="qp-add-question-button"
          onClick={addNewQuestion}
        >
          Add Question
        </button>
      </div>
      
      <div className="qp-actions">
        <button 
          className="qp-export-all-button"
          onClick={handleExportAllJson}
        >
          Export All Questions (JSON)
        </button>
      </div>
      
      {jsonOutput && (
        <div className="qp-json-output">
          <h3>JSON Output</h3>
          <pre>{jsonOutput}</pre>
        </div>
      )}
    </div>
  );
};

export default QuestionForm;