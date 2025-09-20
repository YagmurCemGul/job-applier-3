import React from 'react';
import { useApp } from '../hooks/useApp';

const Applications: React.FC = () => {
  const { state } = useApp();

  const getJobForApplication = (jobId: string) => {
    return state.jobs.find(job => job.id === jobId);
  };

  const groupedApplications = state.applications.reduce((groups, app) => {
    if (!groups[app.status]) {
      groups[app.status] = [];
    }
    groups[app.status].push(app);
    return groups;
  }, {} as Record<string, typeof state.applications>);

  const statusColumns = [
    { key: 'discovered', title: 'Discovered', color: '#3b82f6' },
    { key: 'reviewing', title: 'Reviewing', color: '#f59e0b' },
    { key: 'preparing', title: 'Preparing', color: '#ef4444' },
    { key: 'applied', title: 'Applied', color: '#10b981' },
    { key: 'interview_scheduled', title: 'Interview', color: '#8b5cf6' },
    { key: 'offer_received', title: 'Offer', color: '#06b6d4' },
    { key: 'rejected', title: 'Rejected', color: '#6b7280' },
  ];

  return (
    <div>
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: '4px' }}>Application Pipeline</h2>
            <p style={{ margin: 0, color: '#6b7280' }}>
              Track your job applications through each stage
            </p>
          </div>
          <button className="btn btn-primary">
            + New Application
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px',
        height: 'calc(100vh - 250px)',
        overflowX: 'auto'
      }}>
        {statusColumns.map(column => (
          <div key={column.key} className="card" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '500px'
          }}>
            <div style={{ 
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: `3px solid ${column.color}`
            }}>
              <h3 style={{ 
                margin: 0, 
                color: column.color,
                fontSize: '16px',
                fontWeight: '600'
              }}>
                {column.title}
              </h3>
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280',
                marginTop: '4px'
              }}>
                {groupedApplications[column.key]?.length || 0} applications
              </div>
            </div>

            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {groupedApplications[column.key]?.map(application => {
                const job = getJobForApplication(application.jobId);
                return (
                  <div
                    key={application.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ marginBottom: '8px' }}>
                      <h4 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '14px', 
                        fontWeight: '600',
                        color: '#1d1d1f',
                        lineHeight: '1.3'
                      }}>
                        {job?.title || 'Unknown Position'}
                      </h4>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6b7280',
                        marginBottom: '6px'
                      }}>
                        {job?.company || 'Unknown Company'}
                      </div>
                      {job?.location && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#9ca3af'
                        }}>
                          📍 {job.location}
                        </div>
                      )}
                    </div>

                    {application.dateApplied && (
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#6b7280',
                        marginBottom: '8px'
                      }}>
                        Applied: {new Date(application.dateApplied).toLocaleDateString()}
                      </div>
                    )}

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '8px'
                    }}>
                      <div style={{ 
                        fontSize: '10px', 
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {job?.source || 'Unknown'}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {application.coverLetter && (
                          <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            backgroundColor: '#10b981', 
                            borderRadius: '50%'
                          }} title="Cover letter attached"></span>
                        )}
                        {application.tailoredCV && (
                          <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            backgroundColor: '#3b82f6', 
                            borderRadius: '50%'
                          }} title="CV tailored"></span>
                        )}
                        {Object.keys(application.answers).length > 0 && (
                          <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            backgroundColor: '#f59e0b', 
                            borderRadius: '50%'
                          }} title="Questions answered"></span>
                        )}
                      </div>
                    </div>

                    {application.notes && (
                      <div style={{ 
                        marginTop: '8px',
                        padding: '6px',
                        backgroundColor: '#ffffff',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#6b7280',
                        fontStyle: 'italic',
                        border: '1px solid #e5e7eb'
                      }}>
                        &ldquo;{application.notes.substring(0, 50)}{application.notes.length > 50 ? '...' : ''}&rdquo;
                      </div>
                    )}
                  </div>
                );
              })}

              {(!groupedApplications[column.key] || groupedApplications[column.key].length === 0) && (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#9ca3af',
                  fontSize: '14px',
                  padding: '40px 20px',
                  borderStyle: 'dashed',
                  border: '2px dashed #e5e7eb',
                  borderRadius: '8px'
                }}>
                  No applications in this stage
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      {state.applications.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Application Summary</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                {state.applications.length}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Applications</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {state.applications.filter(app => app.status === 'applied').length}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Applications Sent</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                {state.applications.filter(app => app.status === 'interview_scheduled').length}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Interviews Scheduled</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4' }}>
                {state.applications.filter(app => app.status === 'offer_received').length}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Offers Received</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;