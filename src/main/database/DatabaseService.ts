import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { 
  JobPosting, 
  JobApplication, 
  AnswerVaultEntry, 
  LogEntry 
} from '../../shared/types';
import { DATABASE_TABLES } from '../../shared/constants';
import { LoggerService } from '../services/LoggerService';

export class DatabaseService {
  private db: any;
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'job-applier.db');
    
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initializeTables();
    this.logger.info('Database initialized', 'DatabaseService');
  }

  private initializeTables(): void {
    // Jobs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${DATABASE_TABLES.JOBS} (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT NOT NULL,
        salary TEXT,
        url TEXT NOT NULL,
        source TEXT NOT NULL,
        date_posted TEXT NOT NULL,
        date_scraped TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'discovered'
      )
    `);

    // Applications table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${DATABASE_TABLES.APPLICATIONS} (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        date_applied TEXT,
        status TEXT NOT NULL DEFAULT 'discovered',
        cover_letter TEXT,
        tailored_cv TEXT,
        answers TEXT NOT NULL DEFAULT '{}',
        notes TEXT,
        FOREIGN KEY (job_id) REFERENCES ${DATABASE_TABLES.JOBS}(id)
      )
    `);

    // Answer vault table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${DATABASE_TABLES.ANSWERS} (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        date_created TEXT NOT NULL,
        date_updated TEXT NOT NULL
      )
    `);

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${DATABASE_TABLES.SETTINGS} (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        date_updated TEXT NOT NULL
      )
    `);

    // Logs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${DATABASE_TABLES.LOGS} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        category TEXT NOT NULL,
        details TEXT
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON ${DATABASE_TABLES.JOBS}(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_source ON ${DATABASE_TABLES.JOBS}(source);
      CREATE INDEX IF NOT EXISTS idx_jobs_date_posted ON ${DATABASE_TABLES.JOBS}(date_posted);
      CREATE INDEX IF NOT EXISTS idx_applications_job_id ON ${DATABASE_TABLES.APPLICATIONS}(job_id);
      CREATE INDEX IF NOT EXISTS idx_applications_status ON ${DATABASE_TABLES.APPLICATIONS}(status);
      CREATE INDEX IF NOT EXISTS idx_answers_category ON ${DATABASE_TABLES.ANSWERS}(category);
      CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON ${DATABASE_TABLES.LOGS}(timestamp);
      CREATE INDEX IF NOT EXISTS idx_logs_level ON ${DATABASE_TABLES.LOGS}(level);
    `);
  }

  // Job operations
  async saveJob(job: JobPosting): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO ${DATABASE_TABLES.JOBS} 
      (id, title, company, location, description, requirements, salary, url, source, date_posted, date_scraped, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      job.id,
      job.title,
      job.company,
      job.location,
      job.description,
      JSON.stringify(job.requirements),
      job.salary,
      job.url,
      job.source,
      job.datePosted.toISOString(),
      job.dateScraped.toISOString(),
      job.status
    );
  }

  async getJobs(limit?: number, offset?: number): Promise<JobPosting[]> {
    let query = `SELECT * FROM ${DATABASE_TABLES.JOBS} ORDER BY date_scraped DESC`;
    
    if (limit) {
      query += ` LIMIT ${limit}`;
      if (offset) {
        query += ` OFFSET ${offset}`;
      }
    }

    const rows = this.db.prepare(query).all();
    
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      company: row.company,
      location: row.location,
      description: row.description,
      requirements: JSON.parse(row.requirements),
      salary: row.salary,
      url: row.url,
      source: row.source as 'linkedin' | 'indeed' | 'hiring.cafe',
      datePosted: new Date(row.date_posted),
      dateScraped: new Date(row.date_scraped),
      status: row.status,
    }));
  }

  async getJobById(id: string): Promise<JobPosting | null> {
    const row = this.db.prepare(`SELECT * FROM ${DATABASE_TABLES.JOBS} WHERE id = ?`).get(id);
    
    if (!row) return null;

    return {
      id: (row as any).id,
      title: (row as any).title,
      company: (row as any).company,
      location: (row as any).location,
      description: (row as any).description,
      requirements: JSON.parse((row as any).requirements),
      salary: (row as any).salary,
      url: (row as any).url,
      source: (row as any).source,
      datePosted: new Date((row as any).date_posted),
      dateScraped: new Date((row as any).date_scraped),
      status: (row as any).status,
    };
  }

  // Application operations
  async saveApplication(application: JobApplication): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO ${DATABASE_TABLES.APPLICATIONS}
      (id, job_id, date_applied, status, cover_letter, tailored_cv, answers, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      application.id,
      application.jobId,
      application.dateApplied?.toISOString(),
      application.status,
      application.coverLetter,
      application.tailoredCV,
      JSON.stringify(application.answers),
      application.notes
    );
  }

  async getApplications(): Promise<JobApplication[]> {
    const rows = this.db.prepare(`SELECT * FROM ${DATABASE_TABLES.APPLICATIONS} ORDER BY date_applied DESC`).all();
    
    return rows.map((row: any) => ({
      id: row.id,
      jobId: row.job_id,
      dateApplied: row.date_applied ? new Date(row.date_applied) : undefined,
      status: row.status,
      coverLetter: row.cover_letter,
      tailoredCV: row.tailored_cv,
      answers: JSON.parse(row.answers),
      notes: row.notes,
    }));
  }

  // Answer vault operations
  async saveAnswer(answer: AnswerVaultEntry): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO ${DATABASE_TABLES.ANSWERS}
      (id, question, answer, category, tags, date_created, date_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      answer.id,
      answer.question,
      answer.answer,
      answer.category,
      JSON.stringify(answer.tags),
      answer.dateCreated.toISOString(),
      answer.dateUpdated.toISOString()
    );
  }

  async getAnswers(category?: string): Promise<AnswerVaultEntry[]> {
    let query = `SELECT * FROM ${DATABASE_TABLES.ANSWERS}`;
    const params: any[] = [];

    if (category) {
      query += ` WHERE category = ?`;
      params.push(category);
    }

    query += ` ORDER BY date_updated DESC`;

    const rows = this.db.prepare(query).all(...params);
    
    return rows.map((row: any) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      category: row.category,
      tags: JSON.parse(row.tags),
      dateCreated: new Date(row.date_created),
      dateUpdated: new Date(row.date_updated),
    }));
  }

  // Settings operations
  async setSetting(key: string, value: any): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO ${DATABASE_TABLES.SETTINGS}
      (key, value, date_updated)
      VALUES (?, ?, ?)
    `);

    stmt.run(key, JSON.stringify(value), new Date().toISOString());
  }

  async getSetting(key: string): Promise<any> {
    const row = this.db.prepare(`SELECT value FROM ${DATABASE_TABLES.SETTINGS} WHERE key = ?`).get(key);
    
    if (!row) return null;
    
    return JSON.parse((row as any).value);
  }

  // Log operations
  async saveLog(logEntry: LogEntry): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO ${DATABASE_TABLES.LOGS}
      (timestamp, level, message, category, details)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      logEntry.timestamp.toISOString(),
      logEntry.level,
      logEntry.message,
      logEntry.category,
      logEntry.details ? JSON.stringify(logEntry.details) : null
    );
  }

  async close(): Promise<void> {
    this.db.close();
    this.logger.info('Database connection closed', 'DatabaseService');
  }
}