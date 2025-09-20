import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { JobPosting } from '../../shared/types';

const Jobs: React.FC = () => {
  const { state, actions } = useApp();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  const filteredJobs = state.jobs.filter(job => {
    const matchesFilter = filter === 'all' || job.status === filter;
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: state.jobs.length,
    discovered: state.jobs.filter(j => j.status === 'discovered').length,
    reviewing: state.jobs.filter(j => j.status === 'reviewing').length,
    preparing: state.jobs.filter(j => j.status === 'preparing').length,
    applied: state.jobs.filter(j => j.status === 'applied').length,
  };

  const handleJobClick = (job: JobPosting) => {
    setSelectedJob(job);
  };

  const handleStartApplication = (job: JobPosting) => {
    // This would normally navigate to application creation
    actions.logInfo(`Starting application for ${job.title} at ${job.company}`, 'Jobs');
  };

  return (
    <div style={{ display: 'flex', gap: '30px', height: '100%' }}>
      {/* Jobs List */}
      <div style={{ flex: '1', minWidth: '400px' }}>
        {/* Header and Filters */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search jobs..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: '16px' }}
            />
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  className={`btn ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter(status)}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: 'calc(100% - 140px)', overflowY: 'auto' }}>
          {filteredJobs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <div style={{ color: '#6b7280' }}>
                {searchTerm ? 'No jobs match your search' : 'No jobs found'}
              </div>
              {!searchTerm && (
                <button className="btn btn-primary" style={{ marginTop: '16px' }}>
                  Start Scraping Jobs
                </button>
              )}
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="card"
                style={{
                  cursor: 'pointer',
                  padding: '20px',
                  border: selectedJob?.id === job.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleJobClick(job)}
              >
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ 
                    margin: '0 0 4px 0', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#1d1d1f'
                  }}>
                    {job.title}
                  </h3>
                  <div style={{ 
                    color: '#6b7280', 
                    fontSize: '14px',
                    marginBottom: '8px' 
                  }}>
                    {job.company} • {job.location}
                  </div>
                  {job.salary && (
                    <div style={{ 
                      color: '#10b981', 
                      fontSize: '14px', 
                      fontWeight: '500',
                      marginBottom: '8px'
                    }}>
                      {job.salary}
                    </div>
                  )}
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span className={`status-badge status-${job.status.replace('_', '-')}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#9ca3af',
                      textTransform: 'uppercase'
                    }}>
                      {job.source}
                    </span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {new Date(job.dateScraped).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div style={{ 
                  color: '#6b7280', 
                  fontSize: '13px', 
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {job.description}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Job Details */}
      <div style={{ flex: '1', minWidth: '400px' }}>
        {selectedJob ? (
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <h2 className="card-title">{selectedJob.title}</h2>
              <div style={{ 
                color: '#6b7280', 
                fontSize: '16px',
                marginTop: '4px'
              }}>
                {selectedJob.company} • {selectedJob.location}
              </div>
              {selectedJob.salary && (
                <div style={{ 
                  color: '#10b981', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  marginTop: '8px'
                }}>
                  {selectedJob.salary}
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px', color: '#374151' }}>Job Description</h4>
                <div style={{ 
                  color: '#6b7280', 
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedJob.description}
                </div>
              </div>

              {selectedJob.requirements.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ marginBottom: '12px', color: '#374151' }}>Requirements</h4>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '20px',
                    color: '#6b7280'
                  }}>
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} style={{ marginBottom: '8px' }}>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px', color: '#374151' }}>Details</h4>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Source:</strong> {selectedJob.source}
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Date Posted:</strong> {new Date(selectedJob.datePosted).toLocaleDateString()}
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Date Scraped:</strong> {new Date(selectedJob.dateScraped).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>URL:</strong>{' '}
                    <a 
                      href={selectedJob.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#3b82f6' }}
                    >
                      View Original Posting
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ 
              borderTop: '1px solid #e5e7eb', 
              paddingTop: '20px',
              display: 'flex',
              gap: '12px'
            }}>
              <button 
                className="btn btn-primary"
                onClick={() => handleStartApplication(selectedJob)}
                style={{ flex: 1 }}
              >
                Start Application
              </button>
              <button className="btn btn-secondary">
                Generate Cover Letter
              </button>
              <button className="btn btn-secondary">
                Save to Favorites
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👈</div>
              <div style={{ color: '#6b7280', fontSize: '18px' }}>
                Select a job to view details
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;