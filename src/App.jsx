import React, { useState } from 'react';
import './App.css';
import FormHeader from './FormHeader.jsx';
import FormTitle from './FormTitle.jsx';
import QuestionCard from './QuestionCard.jsx';
import QuestionTypeMenu from './QuestionTypeMenu.jsx';
import ActionButtons from './ActionButton.jsx';
import FormPreview from './FormPreview.jsx';

const QuestionPaperApp = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [formTitle, setFormTitle] = useState('Untitled form');
  const [formDescription, setFormDescription] = useState('Form description');
  const [questions, setQuestions] = useState([
    {
      id: 1,
      type: 'text',
      title: 'Untitled Question',
      required: false,
      options: [],
      marks: 1, // Default marks
      keywords: [] // For text/paragraph questions
    }
  ]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(1);
  const [showQuestionTypeMenu, setShowQuestionTypeMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState(null);

  const addQuestion = (type) => {
    const newQuestion = {
      id: questions.length + 1,
      type: type || 'text',
      title: 'Untitled Question',
      required: false,
      options: type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown' ? ['Option 1'] : [],
      marks: 1, // Default marks
      keywords: [] // For text/paragraph questions
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionId(newQuestion.id);
    setShowQuestionTypeMenu(false);
  };

  const deleteQuestion = (id) => {
    if (questions.length === 1) return;
    const newQuestions = questions.filter(q => q.id !== id);
    setQuestions(newQuestions);
    setSelectedQuestionId(newQuestions[0].id);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(q => {
        if (q.id === id) {
          // When updating correct answers, clean up the opposite type
          const updatedQuestion = { ...q, [field]: value };
          
          if (field === 'correctAnswer') {
            delete updatedQuestion.correctAnswers;
          } else if (field === 'correctAnswers') {
            delete updatedQuestion.correctAnswer;
          }
          
          // When changing question type, clean up answer fields
          if (field === 'type') {
            if (value === 'multiple_choice') {
              delete updatedQuestion.correctAnswers;
              updatedQuestion.correctAnswer = q.correctAnswer || q.correctAnswers?.[0] || 0;
              delete updatedQuestion.keywords;
            } else if (value === 'checkboxes') {
              delete updatedQuestion.correctAnswer;
              updatedQuestion.correctAnswers = q.correctAnswers || (q.correctAnswer !== undefined ? [q.correctAnswer] : []);
              delete updatedQuestion.keywords;
            } else if (value === 'text' || value === 'paragraph') {
              delete updatedQuestion.correctAnswer;
              delete updatedQuestion.correctAnswers;
              updatedQuestion.keywords = q.keywords || [];
            } else {
              delete updatedQuestion.correctAnswer;
              delete updatedQuestion.correctAnswers;
              delete updatedQuestion.keywords;
            }
          }
          
          return updatedQuestion;
        }
        return q;
      })
    );
  };

  const duplicateQuestion = (id) => {
    const questionToDuplicate = questions.find(q => q.id === id);
    const newQuestion = {
      ...questionToDuplicate,
      id: questions.length + 1
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionId(newQuestion.id);
  };

  const handleQuestionClick = (id) => {
    setSelectedQuestionId(id);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Function to get complete form data in JSON format
  const getFormJson = () => {
    return {
      formTitle,
      formDescription,
      questions: questions.map(question => {
        const baseQuestion = {
          id: question.id,
          type: question.type,
          title: question.title,
          required: question.required,
          marks: question.marks || 1
        };

        switch (question.type) {
          case 'multiple_choice':
            return {
              ...baseQuestion,
              options: question.options,
              correctAnswer: question.correctAnswer ?? 0
            };
          case 'checkboxes':
            return {
              ...baseQuestion,
              options: question.options,
              correctAnswers: question.correctAnswers || []
            };
          case 'dropdown':
            return {
              ...baseQuestion,
              options: question.options
            };
          case 'text':
          case 'paragraph':
            return {
              ...baseQuestion,
              keywords: question.keywords || []
            };
          default:
            return baseQuestion;
        }
      })
    };
  };

  // Function to handle form saving/exporting
  const handleSaveForm = () => {
    const formData = getFormJson();
    const jsonString = JSON.stringify(formData, null, 2);
    
    // Create download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formTitle.replace(/\s+/g, '_')}_form.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show notification
    setNotification('Form saved successfully!');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="qp-app">
      <FormHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onPreviewClick={togglePreview}
      />
      
      {showPreview ? (
        <FormPreview 
          title={formTitle}
          description={formDescription}
          questions={questions}
          onClose={togglePreview}
        />
      ) : (
        <div className="qp-main-content">
          <div className="qp-form-container">
            <FormTitle 
              title={formTitle} 
              description={formDescription}
              onTitleChange={setFormTitle}
              onDescriptionChange={setFormDescription}
            />

            {questions.map(question => (
              <QuestionCard
                key={question.id}
                question={question}
                isSelected={selectedQuestionId === question.id}
                onClick={() => handleQuestionClick(question.id)}
                onUpdate={updateQuestion}
                onDelete={deleteQuestion}
                onDuplicate={duplicateQuestion}
                onExportJson={() => {
                  const singleQuestionData = questions.find(q => q.id === question.id);
                  // Clean up the data before exporting single question
                  const cleanQuestionData = { ...singleQuestionData };
                  if (cleanQuestionData.type === 'multiple_choice') {
                    delete cleanQuestionData.correctAnswers;
                    delete cleanQuestionData.keywords;
                  } else if (cleanQuestionData.type === 'checkboxes') {
                    delete cleanQuestionData.correctAnswer;
                    delete cleanQuestionData.keywords;
                  } else if (cleanQuestionData.type === 'text' || cleanQuestionData.type === 'paragraph') {
                    delete cleanQuestionData.correctAnswer;
                    delete cleanQuestionData.correctAnswers;
                  } else {
                    delete cleanQuestionData.correctAnswer;
                    delete cleanQuestionData.correctAnswers;
                    delete cleanQuestionData.keywords;
                  }
                  const jsonString = JSON.stringify(cleanQuestionData, null, 2);
                  const blob = new Blob([jsonString], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${question.title.replace(/\s+/g, '_')}_question.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              />
            ))}

            <ActionButtons 
              onAddQuestion={() => setShowQuestionTypeMenu(true)}
              onSaveForm={handleSaveForm}
            />
          </div>

          {showQuestionTypeMenu && (
            <div className="qp-menu-overlay">
              <QuestionTypeMenu 
                onSelectType={addQuestion}
                onClose={() => setShowQuestionTypeMenu(false)}
              />
            </div>
          )}
        </div>
      )}

      {notification && (
        <div className="qp-notification">
          {notification}
        </div>
      )}
    </div>
  );
};

export default QuestionPaperApp;