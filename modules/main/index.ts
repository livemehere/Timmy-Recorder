import { OpenDialogSyncOptions, app, dialog, ipcMain, shell, Notification, NotificationConstructorOptions, Menu, MenuItem } from 'electron';
import { MainWindow } from '@main/windows/MainWindow';
import * as os from 'os';
import { DEEP_LINK_PROTOCOL } from '@shared/config';
import { settings } from '@main/Settings';
import { ObsManager } from '@main/utils/osn';

const IS_MAC = os.platform() === 'darwin';
class Main {
  mainWindow: MainWindow | null = null;
  osnManager = new ObsManager({ debug: true });

  async start() {
    /* 하드웨어 가속 끄면 확실히 성능 안잡아먹음 (대신 앱이 빡셀때 버벅임) */
    app.disableHardwareAcceleration();
    await app.whenReady();
    this.appSettings();
    await this.createMainWindow();
    this.handleInvoke();
    this.osnManager.init();
  }

  appSettings() {
    this.singleInstance();
    this.handleDeepLink();
    this.setMenuAndLocalShortCut();
    this.setGlobalShortCut();
  }

  singleInstance() {
    /* Single Instance */
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
    } else {
      app.on('second-instance', () => {
        if (this.mainWindow) {
          if (this.mainWindow.window.isMinimized()) {
            this.mainWindow.window.show();
          }
          this.mainWindow.window.focus();
        }
      });
    }

    /* Quit when all windows are closed */
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
        this.osnManager.shutdown();
      }
    });

    app.on('before-quit', () => {
      this.osnManager.shutdown();
    });
  }

  handleDeepLink() {
    /* register deepLink */
    if (os.platform() === 'darwin') {
      app.setAsDefaultProtocolClient(DEEP_LINK_PROTOCOL);
      app.on('open-url', (event, url) => {
        this.mainWindow?.get().webContents.send('deepLink', url.replace(`${DEEP_LINK_PROTOCOL}://`, '/'));
      });
    } else {
      // TODO: handle deepLink on windows
    }
  }

  setGlobalShortCut() {
    // const ret = globalShortcut.register('CommandOrControl+X', () => {
    //   console.log('CommandOrControl+X is pressed');
    // });
    // if (!ret) {
    //   console.log('registration failed');
    // }
  }

  setMenuAndLocalShortCut() {
    const menu = new Menu();
    // First menu item label is the app name
    menu.append(
      new MenuItem({
        submenu: [
          {
            label: 'Quit',
            accelerator: IS_MAC ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      })
    );
    Menu.setApplicationMenu(menu);
  }

  async createMainWindow() {
    const mainWindow = new MainWindow({
      bounds: settings.get('bounds')
    });
    this.mainWindow = mainWindow;
    mainWindow.get().on('resized', () => {
      settings.set('bounds', mainWindow.get().getBounds());
    });
    mainWindow.get().on('moved', () => {
      settings.set('bounds', mainWindow.get().getBounds());
    });
  }

  handleInvoke() {
    ipcMain.handle('test', async () => {
      const res = shell.openPath('/Users');
      console.log(res);
      return 'test';
    });

    ipcMain.handle('shell:openDir', async (_, path: string) => {
      shell.showItemInFolder(path);
      return 'test';
    });

    /* Open URL in default browser */
    ipcMain.handle('shell:openExternal', async (_, url: string) => {
      return shell.openExternal(url);
    });

    /* Open File Selector */
    ipcMain.handle('dialog:open', async (_, options: OpenDialogSyncOptions) => {
      return dialog.showOpenDialogSync(options);
    });

    /* Move file to trash */
    ipcMain.handle('shell:trashItem', async (_, paths: string[]) => {
      for (const path of paths) {
        await shell.trashItem(path);
      }
    });

    ipcMain.handle('notification:show', async (_, options: NotificationConstructorOptions) => {
      console.log(options);
      new Notification(options).show();
    });
  }
}

const main = new Main();
main.start().catch((e) => {
  console.error('Error starting Main: ', e);
});
