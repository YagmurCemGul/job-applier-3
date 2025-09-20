export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  url: string;
  source: 'linkedin' | 'indeed' | 'hiring.cafe';
  datePosted: Date;
  dateScraped: Date;
  status: JobApplicationStatus;
}

export interface JobApplication {
  id: string;
  jobId: string;
  dateApplied?: Date;
  status: JobApplicationStatus;
  coverLetter?: string;
  tailoredCV?: string;
  answers: Record<string, string>;
  notes?: string;
}

export type JobApplicationStatus = 
  | 'discovered'
  | 'reviewing' 
  | 'preparing'
  | 'applied'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'offer_received'
  | 'rejected'
  | 'withdrawn';

export interface ScraperConfig {
  platform: 'linkedin' | 'indeed' | 'hiring.cafe';
  credentials: {
    email: string;
    password: string;
  };
  searchTerms: string[];
  locations: string[];
  delayMin: number;
  delayMax: number;
  timeout: number;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
}

export interface ScraperResult {
  success: boolean;
  jobs: JobPosting[];
  errors: string[];
  warnings: string[];
}

export interface LLMResponse {
  success: boolean;
  content: string;
  tokens?: number;
  error?: string;
}

export interface AnswerVaultEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  dateCreated: Date;
  dateUpdated: Date;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultLLMProvider: 'openai' | 'anthropic' | 'google';
  scraperSettings: {
    batchSize: number;
    autoApply: boolean;
    requireManualReview: boolean;
  };
  notifications: {
    newJobs: boolean;
    applicationUpdates: boolean;
    errors: boolean;
  };
}

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  category: string;
  details?: any;
}