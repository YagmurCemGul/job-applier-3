import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DatabaseService } from './database/DatabaseService';
import { LoggerService } from './services/LoggerService';
import { KeychainService } from './services/KeychainService';
import { APP_CONFIG } from '../shared/constants';

// Load environment variables
dotenv.config();

class Application {
  private mainWindow: BrowserWindow | null = null;
  private databaseService: DatabaseService;
  private loggerService: LoggerService;
  private keychainService: KeychainService;

  constructor() {
    this.loggerService = new LoggerService();
    this.databaseService = new DatabaseService(this.loggerService);
    this.keychainService = new KeychainService();
    
    this.setupApp();
    this.setupIPC();
  }

  private setupApp(): void {
    // App event listeners
    app.whenReady().then(() => {
      this.createMainWindow();
      this.createMenu();
      
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('before-quit', async () => {
      await this.cleanup();
    });
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: APP_CONFIG.WINDOW.DEFAULT_WIDTH,
      height: APP_CONFIG.WINDOW.DEFAULT_HEIGHT,
      minWidth: APP_CONFIG.WINDOW.MIN_WIDTH,
      minHeight: APP_CONFIG.WINDOW.MIN_HEIGHT,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
      titleBarStyle: 'hiddenInset',
      show: false,
    });

    // Load the renderer
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      this.loggerService.info('Main window created and shown');
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private createMenu(): void {
    const template: any[] = [
      {
        label: APP_CONFIG.NAME,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      {
        label: 'Window',
        submenu: [{ role: 'minimize' }, { role: 'close' }],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupIPC(): void {
    // Database operations
    ipcMain.handle('db:getJobs', async () => {
      return await this.databaseService.getJobs();
    });

    ipcMain.handle('db:getApplications', async () => {
      return await this.databaseService.getApplications();
    });

    ipcMain.handle('db:saveJob', async (_, job) => {
      return await this.databaseService.saveJob(job);
    });

    ipcMain.handle('db:saveApplication', async (_, application) => {
      return await this.databaseService.saveApplication(application);
    });

    // Keychain operations
    ipcMain.handle('keychain:getPassword', async (_, service, account) => {
      return await this.keychainService.getPassword(account);
    });

    ipcMain.handle('keychain:setPassword', async (_, service, account, password) => {
      return await this.keychainService.setPassword(account, password);
    });

    // Logging
    ipcMain.handle('log:info', async (_, message, category) => {
      this.loggerService.info(message, category);
    });

    ipcMain.handle('log:error', async (_, message, category, details) => {
      this.loggerService.error(message, category, details);
    });

    // Window operations
    ipcMain.handle('window:minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('window:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('window:close', () => {
      this.mainWindow?.close();
    });
  }

  private async cleanup(): Promise<void> {
    this.loggerService.info('Application shutting down');
    await this.databaseService.close();
  }
}

// Initialize application
new Application();