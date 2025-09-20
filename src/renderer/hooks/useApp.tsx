import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { JobPosting, JobApplication, AppSettings } from '../../shared/types';

interface AppState {
  jobs: JobPosting[];
  applications: JobApplication[];
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_JOBS'; payload: JobPosting[] }
  | { type: 'SET_APPLICATIONS'; payload: JobApplication[] }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'ADD_JOB'; payload: JobPosting }
  | { type: 'UPDATE_JOB'; payload: JobPosting }
  | { type: 'ADD_APPLICATION'; payload: JobApplication }
  | { type: 'UPDATE_APPLICATION'; payload: JobApplication };

const initialState: AppState = {
  jobs: [],
  applications: [],
  settings: null,
  loading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_JOBS':
      return { ...state, jobs: action.payload };
    case 'SET_APPLICATIONS':
      return { ...state, applications: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'ADD_JOB':
      return { ...state, jobs: [action.payload, ...state.jobs] };
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === action.payload.id ? action.payload : job
        ),
      };
    case 'ADD_APPLICATION':
      return { ...state, applications: [action.payload, ...state.applications] };
    case 'UPDATE_APPLICATION':
      return {
        ...state,
        applications: state.applications.map((app) =>
          app.id === action.payload.id ? action.payload : app
        ),
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    loadJobs: () => Promise<void>;
    loadApplications: () => Promise<void>;
    saveJob: (job: JobPosting) => Promise<void>;
    saveApplication: (application: JobApplication) => Promise<void>;
    logInfo: (message: string, category?: string) => void;
    logError: (message: string, category?: string, details?: any) => void;
  };
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    loadJobs: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const jobs = await window.electronAPI.db.getJobs();
        dispatch({ type: 'SET_JOBS', payload: jobs });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load jobs';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        actions.logError('Failed to load jobs', 'useApp', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    loadApplications: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const applications = await window.electronAPI.db.getApplications();
        dispatch({ type: 'SET_APPLICATIONS', payload: applications });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load applications';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        actions.logError('Failed to load applications', 'useApp', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    saveJob: async (job: JobPosting) => {
      try {
        await window.electronAPI.db.saveJob(job);
        dispatch({ type: 'ADD_JOB', payload: job });
        actions.logInfo(`Job saved: ${job.title} at ${job.company}`, 'useApp');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save job';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        actions.logError('Failed to save job', 'useApp', error);
      }
    },

    saveApplication: async (application: JobApplication) => {
      try {
        await window.electronAPI.db.saveApplication(application);
        dispatch({ type: 'ADD_APPLICATION', payload: application });
        actions.logInfo(`Application saved for job ${application.jobId}`, 'useApp');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save application';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        actions.logError('Failed to save application', 'useApp', error);
      }
    },

    logInfo: (message: string, category?: string) => {
      window.electronAPI.log.info(message, category);
    },

    logError: (message: string, category?: string, details?: any) => {
      window.electronAPI.log.error(message, category, details);
    },
  };

  useEffect(() => {
    // Load initial data
    actions.loadJobs();
    actions.loadApplications();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Extend window object to include electronAPI
declare global {
  interface Window {
    electronAPI: {
      db: {
        getJobs: () => Promise<JobPosting[]>;
        getApplications: () => Promise<JobApplication[]>;
        saveJob: (job: JobPosting) => Promise<void>;
        saveApplication: (application: JobApplication) => Promise<void>;
      };
      log: {
        info: (message: string, category?: string) => void;
        error: (message: string, category?: string, details?: any) => void;
      };
      keychain: {
        getPassword: (service: string, account: string) => Promise<string | null>;
        setPassword: (service: string, account: string, password: string) => Promise<boolean>;
      };
      window: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
      };
      scraper: {
        scrapeJobs: (config: any) => Promise<any>;
        getScraperStatus: () => Promise<any>;
      };
      llm: {
        generateCoverLetter: (jobPosting: any, userProfile: any) => Promise<any>;
        tailorCV: (originalCV: string, jobPosting: any) => Promise<any>;
        answerQuestion: (question: string, context: any) => Promise<any>;
      };
    };
  }
}