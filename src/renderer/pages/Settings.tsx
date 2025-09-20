import React from 'react';

const Settings: React.FC = () => {
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Settings</h2>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>
            Configure your application preferences and API keys
          </p>
        </div>
        
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
          <div style={{ color: '#6b7280', marginBottom: '16px' }}>
            Settings configuration coming soon
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af', maxWidth: '400px', margin: '0 auto' }}>
            This will include LLM API key management, scraper configurations, 
            application preferences, and other system settings.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;