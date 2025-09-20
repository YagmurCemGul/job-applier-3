export const APP_CONFIG = {
  NAME: 'Job Applier 3',
  VERSION: '1.0.0',
  WINDOW: {
    MIN_WIDTH: 1200,
    MIN_HEIGHT: 800,
    DEFAULT_WIDTH: 1400,
    DEFAULT_HEIGHT: 900,
  },
} as const;

export const SCRAPER_PLATFORMS = {
  LINKEDIN: 'linkedin',
  INDEED: 'indeed',
  HIRING_CAFE: 'hiring.cafe',
} as const;

export const LLM_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
} as const;

export const JOB_STATUSES = {
  DISCOVERED: 'discovered',
  REVIEWING: 'reviewing',
  PREPARING: 'preparing',
  APPLIED: 'applied',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  INTERVIEW_COMPLETED: 'interview_completed',
  OFFER_RECEIVED: 'offer_received',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export const DATABASE_TABLES = {
  JOBS: 'jobs',
  APPLICATIONS: 'applications',
  ANSWERS: 'answer_vault',
  SETTINGS: 'settings',
  LOGS: 'logs',
} as const;

export const KEYCHAIN_SERVICE = 'com.jobapplier3.app';

export const API_ENDPOINTS = {
  OPENAI: 'https://api.openai.com/v1',
  ANTHROPIC: 'https://api.anthropic.com/v1',
  GOOGLE: 'https://generativelanguage.googleapis.com/v1beta',
} as const;