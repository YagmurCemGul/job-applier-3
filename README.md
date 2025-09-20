# Job Applier 3

A powerful Electron + React desktop application for macOS that automates job application processes using web scraping, AI-powered content generation, and intelligent application management.

## 🚀 Features

### Core Modules

1. **🤖 Web Scrapers**
   - LinkedIn job scraper with anti-bot protection
   - Indeed job scraper (extensible)
   - Hiring.cafe scraper (extensible)
   - Login automation with rate limiting
   - CAPTCHA and rate limit detection
   - Human-like browsing behavior

2. **🧠 LLM Provider Abstraction**
   - OpenAI GPT integration
   - Anthropic Claude support (ready)
   - Google Gemini support (ready)
   - Cover letter generation
   - CV tailoring for specific jobs
   - Application question answering

3. **🗄️ Data Management**
   - SQLite database with encryption capability
   - Answer Vault for storing reusable responses
   - Settings management
   - macOS Keychain integration for API keys
   - Secure credential storage

4. **📊 Application Pipeline**
   - Kanban board view for application tracking
   - Job status management (discovered → applied → interview → offer)
   - Application progress visualization
   - Notes and documentation

### Technical Features

- **TypeScript** for type safety
- **Clean Architecture** with separation of concerns
- **Comprehensive Logging** with Winston
- **ESLint & Prettier** for code quality
- **Jest** testing framework
- **esbuild** for fast compilation
- **dotenv** for environment configuration

## 🛠️ Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- macOS (primary target platform)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YagmurCemGul/job-applier-3.git
   cd job-applier-3
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

5. **Build the application:**
   ```bash
   npm run build
   ```

6. **Start the application:**
   ```bash
   npm start
   ```

## 🔧 Development

### Development Mode

Run the application in development mode with hot reload:

```bash
npm run dev
```

This starts both the main process and renderer in development mode.

### Code Quality

- **Lint:** `npm run lint`
- **Format:** `npm run format`
- **Type Check:** `npm run type-check`
- **Test:** `npm run test`

### Project Structure

```
src/
├── main/                 # Electron main process
│   ├── database/        # SQLite database services
│   ├── llm/            # LLM provider implementations
│   ├── scrapers/       # Web scraping modules
│   ├── services/       # Core services (logging, keychain)
│   ├── main.ts         # Main process entry point
│   └── preload.ts      # Preload script for renderer
├── renderer/            # React frontend
│   ├── components/     # Reusable UI components
│   ├── pages/         # Application pages
│   ├── hooks/         # Custom React hooks
│   ├── styles/        # CSS styles
│   └── index.tsx      # Renderer entry point
└── shared/             # Shared types and utilities
    ├── types/         # TypeScript type definitions
    ├── constants/     # Application constants
    └── utils/         # Utility functions
```

## 🔑 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# LLM API Keys (stored in keychain for security)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

# Database Configuration
DB_PATH=./data/job-applier.db

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Scraper Configuration
SCRAPER_DELAY_MIN=2000
SCRAPER_DELAY_MAX=5000
SCRAPER_TIMEOUT=30000
```

### API Keys Setup

The application uses macOS Keychain to securely store API keys. On first run:

1. Navigate to Settings
2. Enter your LLM provider API keys
3. Keys are automatically stored in Keychain

## 📱 Usage

### 1. Job Scraping

1. Configure scraper settings in the Settings page
2. Add your LinkedIn/Indeed credentials
3. Set search terms and locations
4. Run the scraper to discover new jobs

### 2. Application Management

1. View discovered jobs in the Jobs page
2. Start applications from the job details
3. Track progress in the Applications kanban board
4. Move applications through stages as they progress

### 3. AI-Powered Content

1. Generate tailored cover letters for specific jobs
2. Customize your CV for job requirements
3. Get AI assistance for application questions
4. Store and reuse answers in the Answer Vault

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## 🔒 Security Features

- **Keychain Integration:** Secure API key storage
- **Database Encryption:** SQLite encryption support
- **Rate Limiting:** Respectful web scraping
- **Anti-Detection:** Human-like browsing patterns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Run linting and tests: `npm run lint && npm test`
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## 📋 TODO

- [ ] Complete Answer Vault implementation
- [ ] Add Settings page functionality
- [ ] Implement Indeed and Hiring.cafe scrapers
- [ ] Add Anthropic Claude and Google Gemini providers
- [ ] Create comprehensive test suite
- [ ] Add application auto-submission
- [ ] Implement job alert notifications
- [ ] Add export/import functionality
- [ ] Create application analytics

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for educational and personal use only. Always respect website terms of service and rate limits when scraping. Use responsibly and ethically.

## 🆘 Support

For support, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ for job seekers everywhere**