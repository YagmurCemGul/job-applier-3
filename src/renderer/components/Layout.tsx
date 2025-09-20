import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/jobs', label: 'Jobs', icon: '💼' },
    { path: '/applications', label: 'Applications', icon: '📝' },
    { path: '/answer-vault', label: 'Answer Vault', icon: '🗄️' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const getPageTitle = () => {
    const currentNav = navItems.find(item => item.path === location.pathname);
    return currentNav?.label || 'Job Applier 3';
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Job Applier 3</h1>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '0 20px', marginTop: 'auto' }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Version 1.0.0
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <h1 className="page-title">{getPageTitle()}</h1>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => window.electronAPI?.window?.minimize()}
              style={{ padding: '8px 12px', fontSize: '12px' }}
            >
              −
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => window.electronAPI?.window?.maximize()}
              style={{ padding: '8px 12px', fontSize: '12px' }}
            >
              ⌘
            </button>
            <button
              className="btn btn-danger"
              onClick={() => window.electronAPI?.window?.close()}
              style={{ padding: '8px 12px', fontSize: '12px' }}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="content-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;