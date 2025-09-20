import { Page } from 'playwright';
import { BaseJobScraper } from './BaseJobScraper';
import { JobPosting, ScraperResult, ScraperConfig } from '../../shared/types';
import { JOB_STATUSES } from '../../shared/constants';
import { LoggerService } from '../services/LoggerService';

export class LinkedInScraper extends BaseJobScraper {
  constructor(logger: LoggerService) {
    super(logger, 'linkedin');
  }

  async scrapeJobs(config: ScraperConfig): Promise<ScraperResult> {
    const result: ScraperResult = {
      success: false,
      jobs: [],
      errors: [],
      warnings: [],
    };

    try {
      const page = await this.createPage();
      
      // Navigate to LinkedIn
      await page.goto('https://www.linkedin.com/login');
      await this.randomHumanDelay();

      // Login
      const loginSuccess = await this.login(page, config.credentials.email, config.credentials.password);
      if (!loginSuccess) {
        result.errors.push('Failed to login to LinkedIn');
        return result;
      }

      // Navigate to jobs page
      await page.goto('https://www.linkedin.com/jobs');
      await this.randomHumanDelay();

      // Scrape jobs for each search term and location combination
      for (const searchTerm of config.searchTerms) {
        for (const location of config.locations) {
          this.logger.info(`Scraping LinkedIn jobs for "${searchTerm}" in "${location}"`, 'LinkedInScraper');
          
          const jobs = await this.searchJobs(page, searchTerm, location, config);
          result.jobs.push(...jobs);
          
          // Check for anti-bot measures
          const canContinue = await this.handleAntiBot(page);
          if (!canContinue) {
            result.warnings.push('Anti-bot measures detected, stopping scraping');
            break;
          }
          
          await this.randomHumanDelay(config.delayMin, config.delayMax);
        }
      }

      result.success = true;
      this.logger.info(`Scraped ${result.jobs.length} jobs from LinkedIn`, 'LinkedInScraper');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      result.errors.push(errorMessage);
      this.logger.error('LinkedIn scraping failed', 'LinkedInScraper', { error: errorMessage });
    } finally {
      await this.cleanup();
    }

    return result;
  }

  async login(page: Page, email: string, password: string): Promise<boolean> {
    try {
      // Fill email
      await this.humanType(page, '#username', email);
      
      // Fill password
      await this.humanType(page, '#password', password);
      
      // Click login button
      await this.humanClick(page, 'button[type="submit"]');
      
      // Wait for navigation
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Check if login was successful
      const currentUrl = page.url();
      if (currentUrl.includes('/feed') || currentUrl.includes('/jobs')) {
        this.logger.info('LinkedIn login successful', 'LinkedInScraper');
        return true;
      }
      
      // Check for 2FA or other challenges
      if (await page.locator('input[id*="challenge"]').isVisible()) {
        this.logger.warn('2FA challenge detected - manual intervention required', 'LinkedInScraper');
        return false;
      }
      
      return false;
    } catch (error) {
      this.logger.error('LinkedIn login failed', 'LinkedInScraper', { error });
      return false;
    }
  }

  async detectCaptcha(page: Page): Promise<boolean> {
    try {
      // Common CAPTCHA selectors for LinkedIn
      const captchaSelectors = [
        '[data-test-id="captcha"]',
        '.captcha-container',
        '#captcha',
        '[aria-label*="captcha"]',
        '[aria-label*="security check"]',
      ];

      for (const selector of captchaSelectors) {
        if (await page.locator(selector).isVisible()) {
          return true;
        }
      }

      // Check for text that indicates CAPTCHA
      const bodyText = await page.textContent('body');
      if (bodyText && bodyText.toLowerCase().includes('security check')) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  async detectRateLimit(page: Page): Promise<boolean> {
    try {
      // Check for rate limit indicators
      const rateLimitSelectors = [
        '[data-test-id="rate-limit"]',
        '.rate-limit-message',
      ];

      for (const selector of rateLimitSelectors) {
        if (await page.locator(selector).isVisible()) {
          return true;
        }
      }

      // Check for text that indicates rate limiting
      const bodyText = await page.textContent('body');
      if (bodyText) {
        const lowerText = bodyText.toLowerCase();
        if (lowerText.includes('too many requests') || 
            lowerText.includes('rate limit') ||
            lowerText.includes('slow down')) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  private async searchJobs(page: Page, searchTerm: string, location: string, _config: ScraperConfig): Promise<JobPosting[]> {
    const jobs: JobPosting[] = [];

    try {
      // Fill search form
      await page.fill('input[data-test-id="jobs-search-box-keyword-id-ember"]', searchTerm);
      await page.fill('input[data-test-id="jobs-search-box-location-id-ember"]', location);
      
      // Click search
      await this.humanClick(page, 'button[data-test-id="jobs-search-box-submit-button"]');
      
      // Wait for results to load
      await page.waitForSelector('.jobs-search-results-list', { timeout: 10000 });
      
      // Get job cards
      const jobCards = await page.locator('.job-card-container').all();
      
      for (const card of jobCards.slice(0, 10)) { // Limit to first 10 results per search
        try {
          const job = await this.extractJobFromCard(card, page);
          if (job) {
            jobs.push(job);
          }
        } catch (error) {
          this.logger.warn('Failed to extract job from card', 'LinkedInScraper', { error });
        }
        
        await this.randomHumanDelay(500, 1500);
      }
      
    } catch (error) {
      this.logger.error('Failed to search jobs', 'LinkedInScraper', { error, searchTerm, location });
    }

    return jobs;
  }

  private async extractJobFromCard(card: any, page: Page): Promise<JobPosting | null> {
    try {
      const title = await card.locator('.job-card-list__title').textContent();
      const company = await card.locator('.job-card-container__company-name').textContent();
      const location = await card.locator('.job-card-container__metadata-item').first().textContent();
      const url = await card.locator('a').first().getAttribute('href');
      
      if (!title || !company || !url) {
        return null;
      }

      // Click to get more details
      await card.click();
      await this.randomHumanDelay(1000, 2000);
      
      // Extract description
      const description = await page.locator('.jobs-description-content__text').textContent() || '';
      
      const job: JobPosting = {
        id: this.generateJobId(url, title, company),
        title: title.trim(),
        company: company.trim(),
        location: location?.trim() || '',
        description: description.trim(),
        requirements: this.extractRequirements(description),
        url: url.startsWith('http') ? url : `https://www.linkedin.com${url}`,
        source: 'linkedin',
        datePosted: new Date(), // LinkedIn doesn't always show exact dates
        dateScraped: new Date(),
        status: JOB_STATUSES.DISCOVERED,
      };

      return job;
    } catch (error) {
      this.logger.warn('Failed to extract job details', 'LinkedInScraper', { error });
      return null;
    }
  }

  private extractRequirements(description: string): string[] {
    const requirements: string[] = [];
    
    // Look for common requirement patterns
    const patterns = [
      /(?:require[sd]?|must have|should have|need|essential)[:\s]*([^.]+)/gi,
      /(?:experience with|knowledge of|proficient in)[:\s]*([^.]+)/gi,
      /(?:\d+\+?\s*years?)[^.]+/gi,
    ];

    patterns.forEach(pattern => {
      const matches = description.match(pattern);
      if (matches) {
        requirements.push(...matches.map(match => match.trim()));
      }
    });

    return requirements.slice(0, 10); // Limit to 10 requirements
  }
}