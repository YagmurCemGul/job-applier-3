import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  // Database operations
  db: {
    getJobs: () => ipcRenderer.invoke('db:getJobs'),
    getApplications: () => ipcRenderer.invoke('db:getApplications'),
    saveJob: (job: any) => ipcRenderer.invoke('db:saveJob', job),
    saveApplication: (application: any) => ipcRenderer.invoke('db:saveApplication', application),
  },

  // Keychain operations
  keychain: {
    getPassword: (service: string, account: string) => 
      ipcRenderer.invoke('keychain:getPassword', service, account),
    setPassword: (service: string, account: string, password: string) => 
      ipcRenderer.invoke('keychain:setPassword', service, account, password),
  },

  // Logging
  log: {
    info: (message: string, category?: string) => 
      ipcRenderer.invoke('log:info', message, category),
    error: (message: string, category?: string, details?: any) => 
      ipcRenderer.invoke('log:error', message, category, details),
  },

  // Window operations
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },

  // Scraper operations
  scraper: {
    scrapeJobs: (config: any) => ipcRenderer.invoke('scraper:scrapeJobs', config),
    getScraperStatus: () => ipcRenderer.invoke('scraper:getStatus'),
  },

  // LLM operations
  llm: {
    generateCoverLetter: (jobPosting: any, userProfile: any) => 
      ipcRenderer.invoke('llm:generateCoverLetter', jobPosting, userProfile),
    tailorCV: (originalCV: string, jobPosting: any) => 
      ipcRenderer.invoke('llm:tailorCV', originalCV, jobPosting),
    answerQuestion: (question: string, context: any) => 
      ipcRenderer.invoke('llm:answerQuestion', question, context),
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;