import React from 'react';
import { useApp } from '../hooks/useApp';

const Dashboard: React.FC = () => {
  const { state } = useApp();

  const stats = {
    totalJobs: state.jobs.length,
    appliedJobs: state.applications.filter(app => app.status === 'applied').length,
    pendingApplications: state.applications.filter(app => 
      ['discovered', 'reviewing', 'preparing'].includes(app.status)
    ).length,
    interviewsScheduled: state.applications.filter(app => 
      app.status === 'interview_scheduled'
    ).length,
  };

  const recentJobs = state.jobs.slice(0, 5);
  const recentApplications = state.applications.slice(0, 5);

  return (
    <div>
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '30px' 
      }}>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
              {stats.totalJobs}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Total Jobs Scraped</div>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
              {stats.appliedJobs}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Applications Sent</div>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
              {stats.pendingApplications}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Pending Applications</div>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>
              {stats.interviewsScheduled}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Interviews Scheduled</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Recent Jobs */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Jobs</h3>
          </div>
          
          {recentJobs.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💼</div>
              <div>No jobs scraped yet</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                Start by configuring and running a scraper
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentJobs.map((job) => (
                <div key={job.id} style={{ 
                  padding: '16px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {job.title}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
                    {job.company} • {job.location}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`status-badge status-${job.status.replace('_', '-')}`}>
                      {job.status}
                    </span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {job.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Applications</h3>
          </div>
          
          {recentApplications.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <div>No applications yet</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                Start applying to jobs to see them here
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentApplications.map((application) => {
                const job = state.jobs.find(j => j.id === application.jobId);
                return (
                  <div key={application.id} style={{ 
                    padding: '16px', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {job?.title || 'Unknown Job'}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
                      {job?.company || 'Unknown Company'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`status-badge status-${application.status.replace('_', '-')}`}>
                        {application.status}
                      </span>
                      {application.dateApplied && (
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {new Date(application.dateApplied).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '30px' }}>
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary">
            🔍 Start Job Scraping
          </button>
          <button className="btn btn-secondary">
            📝 Create Application
          </button>
          <button className="btn btn-secondary">
            🤖 Generate Cover Letter
          </button>
          <button className="btn btn-secondary">
            ⚙️ Configure Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;