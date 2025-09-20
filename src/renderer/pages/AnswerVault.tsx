import React from 'react';

const AnswerVault: React.FC = () => {
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Answer Vault</h2>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>
            Store and manage your answers to common application questions
          </p>
        </div>
        
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗄️</div>
          <div style={{ color: '#6b7280', marginBottom: '16px' }}>
            Answer Vault feature coming soon
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af', maxWidth: '400px', margin: '0 auto' }}>
            This will allow you to store reusable answers to common job application questions,
            categorized and searchable for quick access during applications.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerVault;