import { BrowserWindow } from 'electron';
import { DEBUG, IS_DEV } from '@main/config';
import { join } from 'path';
import { SettingsData } from '@main/Settings';

interface Options {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class MainWindow {
  window: BrowserWindow;
  bounds: SettingsData['bounds'];

  constructor(options: Options) {
    this.bounds = options.bounds;
    this.create().catch((e) => {
      console.error('Error creating MainWindow: ', e);
    });
  }

  get() {
    return this.window;
  }

  async create() {
    this.window = new BrowserWindow({
      ...this.bounds,
      frame: false,
      webPreferences: {
        devTools: DEBUG,
        preload: join(__dirname, 'preload.js'),
        nodeIntegration: true,
        allowRunningInsecureContent: true
      }
    });

    if (DEBUG) {
      this.window.webContents.openDevTools();
    }
    if (IS_DEV) {
      await this.window.loadURL('http://localhost:3000');
    } else {
      await this.window.loadFile(join(__dirname, 'index.html'));
    }
  }
}
