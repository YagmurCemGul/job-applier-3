import { chromium, Browser, Page } from 'playwright';
import { ScraperResult, ScraperConfig } from '../../shared/types';
import { LoggerService } from '../services/LoggerService';
import { randomDelay, sleep } from '../../shared/utils';

export interface BaseScraper {
  scrapeJobs(config: ScraperConfig): Promise<ScraperResult>;
  login(page: Page, email: string, password: string): Promise<boolean>;
  detectCaptcha(page: Page): Promise<boolean>;
  detectRateLimit(page: Page): Promise<boolean>;
}

export abstract class BaseJobScraper implements BaseScraper {
  protected browser: Browser | null = null;
  protected logger: LoggerService;
  protected platform: string;

  constructor(logger: LoggerService, platform: string) {
    this.logger = logger;
    this.platform = platform;
  }

  abstract scrapeJobs(config: ScraperConfig): Promise<ScraperResult>;
  abstract login(page: Page, email: string, password: string): Promise<boolean>;
  abstract detectCaptcha(page: Page): Promise<boolean>;
  abstract detectRateLimit(page: Page): Promise<boolean>;

  protected async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: process.env.NODE_ENV === 'production',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });
      this.logger.info(`Browser initialized for ${this.platform}`, 'Scraper');
    }
    return this.browser;
  }

  protected async createPage(): Promise<Page> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    // Set random user agent
    await page.setExtraHTTPHeaders({
      'User-Agent': this.getRandomUserAgent()
    });
    
    // Set viewport to random size within reasonable bounds
    await page.setViewportSize({
      width: 1200 + Math.floor(Math.random() * 400),
      height: 800 + Math.floor(Math.random() * 300),
    });

    // Add some human-like behavior
    await page.addInitScript(() => {
      // Remove webdriver property
      delete (window as any).navigator.webdriver;
      
      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
    });

    return page;
  }

  protected async randomHumanDelay(min?: number, max?: number): Promise<void> {
    const delayMin = min || 1000;
    const delayMax = max || 3000;
    const delay = randomDelay(delayMin, delayMax);
    await sleep(delay);
  }

  protected async humanType(page: Page, selector: string, text: string): Promise<void> {
    await page.click(selector);
    await this.randomHumanDelay(200, 500);
    
    // Type with random delays between characters
    for (const char of text) {
      await page.keyboard.type(char);
      await sleep(randomDelay(50, 150));
    }
  }

  protected async humanClick(page: Page, selector: string): Promise<void> {
    await this.randomHumanDelay(500, 1000);
    await page.click(selector);
    await this.randomHumanDelay(500, 1000);
  }

  protected generateJobId(url: string, title: string, company: string): string {
    const urlHash = Buffer.from(url).toString('base64').slice(0, 8);
    const titleHash = Buffer.from(title).toString('base64').slice(0, 4);
    const companyHash = Buffer.from(company).toString('base64').slice(0, 4);
    return `${this.platform}_${urlHash}_${titleHash}_${companyHash}`;
  }

  protected getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  protected async handleAntiBot(page: Page): Promise<boolean> {
    // Check for common anti-bot measures
    const captchaDetected = await this.detectCaptcha(page);
    const rateLimitDetected = await this.detectRateLimit(page);

    if (captchaDetected) {
      this.logger.warn('CAPTCHA detected - manual intervention required', 'Scraper');
      return false;
    }

    if (rateLimitDetected) {
      this.logger.warn('Rate limit detected - need to slow down', 'Scraper');
      await sleep(randomDelay(30000, 60000)); // Wait 30-60 seconds
      return false;
    }

    return true;
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.logger.info(`Browser closed for ${this.platform}`, 'Scraper');
    }
  }
}