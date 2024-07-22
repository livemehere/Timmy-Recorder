import { OpenDialogSyncOptions, app, dialog, ipcMain, shell, Notification, NotificationConstructorOptions, Menu, MenuItem, protocol } from 'electron';
import { MainWindow } from '@main/windows/MainWindow';
import * as os from 'os';
import { DEEP_LINK_PROTOCOL } from '@shared/config';
import { settings } from '@main/Settings';
import { FPS_VALUES, VIDEO_BIT_RATES, VIDEO_FORMATS } from '@shared/shared-const';
import { SceneOption } from '@shared/shared-type';
import { ObsManager } from '@main/utils/osn';
import { isMac } from '@main/utils/byOS';
import { convertToMediaPath } from '@shared/path';
import path from 'path';
import * as fs from 'fs';
import { convertImageFramesToVideo } from '@main/utils/ffmpeg';
import { FrameToVideoArgs, SetSettingArgs } from '../../typings/preload';
import { EOBSSettingsCategories, TSettingCategoryEnumKey } from '@main/utils/osn/obs_enums';
import debugLog from '@shared/debugLog';

const IS_MAC = os.platform() === 'darwin';
class Main {
  mainWindow: MainWindow | null = null;
  osnManager?: ObsManager;

  async start() {
    /* 하드웨어 가속 끄면 확실히 성능 안잡아먹음 (대신 앱이 빡셀때 버벅임) */
    // app.disableHardwareAcceleration();
    await app.whenReady();
    this.appSettings();
    await this.createMainWindow();
    this.handleInvoke();
    if (!isMac()) {
      this.osnManager = new ObsManager({ debug: true });
      this.osnManager.init();
    }
  }

  appSettings() {
    this.singleInstance();
    this.handleDeepLink();
    this.handleFileProtocol();
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
        this.osnManager?.shutdown();
      }
    });

    app.on('before-quit', () => {
      this.osnManager?.shutdown();
    });
  }

  handleFileProtocol() {
    protocol.registerFileProtocol(DEEP_LINK_PROTOCOL, (request, callback) => {
      const pathname = request.url.replace(convertToMediaPath(''), '');
      callback(pathname);
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

    /** OSN Setting */
    ipcMain.handle('osn:getSettingCategories', async () => {
      return this.osnManager?.getSettingCategories();
    });

    ipcMain.handle('osn:getSubCategoryAndParams', async (_, categoryEnumKey: TSettingCategoryEnumKey) => {
      return this.osnManager?.getCategorySettings(EOBSSettingsCategories[categoryEnumKey]);
    });

    /** 자유도 높게 모든 OBS 설정을 set 하고 setting.json 에 저장합니다 */
    ipcMain.handle('osn:setSetting', async (_, { categoryEnumKey, parameter, value }: SetSettingArgs) => {
      this.osnManager?.setSetting(EOBSSettingsCategories[categoryEnumKey], parameter, value);
      let manualObsSettings = settings.get('manualObsSettings');
      if (!manualObsSettings) {
        manualObsSettings = [];
      }
      const foundIndex = manualObsSettings.findIndex((setting) => setting.categoryEnumKey === categoryEnumKey && setting.parameter === parameter);
      const newVal = { categoryEnumKey, parameter, value };
      if (foundIndex !== -1) {
        manualObsSettings[foundIndex] = newVal;
      } else {
        manualObsSettings.push(newVal);
      }
      settings.set('manualObsSettings', manualObsSettings);
      debugLog(`Save Manual OBS Setting`, `categoryEnumKey: ${categoryEnumKey}, parameter: ${parameter}, value: ${value})`);
      return 'ok';
    });

    /* OSN */
    ipcMain.handle('osn:start', async () => {
      return this.osnManager?.startRecording();
    });

    ipcMain.handle('osn:stop', async () => {
      return this.osnManager?.stopRecording();
    });

    ipcMain.handle('osn:formatValues', async () => {
      return VIDEO_FORMATS;
    });

    ipcMain.handle('osn:setFormat', async (_, format: (typeof VIDEO_FORMATS)[number]) => {
      return this.osnManager?.setFormat(format);
    });

    ipcMain.handle('osn:setFps', async (_, fps: (typeof FPS_VALUES)[number]) => {
      return this.osnManager?.setFps(fps);
    });

    ipcMain.handle('osn:getFpsValues', async () => {
      return FPS_VALUES;
    });

    // get performance
    ipcMain.handle('osn:getPerformance', async () => {
      return this.osnManager?.getPerformance();
    });

    // get current obs settings
    ipcMain.handle('osn:getSettings', async () => {
      return this.osnManager?.getSavedObsSettings();
    });

    // get monitor list
    ipcMain.handle('osn:getMonitorList', async () => {
      return this.osnManager?.getMonitorList();
    });

    // get thumbnail
    ipcMain.handle('osn:getThumbnail', async (_, displayId: number) => {
      return this.osnManager?.getMonitorThumbnail(displayId);
    });

    // update scene
    ipcMain.handle('osn:updateScene', async (_, option: SceneOption) => {
      return this.osnManager?.updateScene(option);
    });

    // bitrate list
    ipcMain.handle('osn:getBitrateValues', async () => {
      return VIDEO_BIT_RATES;
    });

    // set bitrate
    ipcMain.handle('osn:setBitrate', async (_, bitrate: (typeof VIDEO_BIT_RATES)[number]) => {
      return this.osnManager?.setBitrate(bitrate);
    });

    // get window list
    ipcMain.handle('osn:getWindowList', async () => {
      return this.osnManager?.getWindowList();
    });

    // TODO: outputName 기반으로 'userData' 에 폴더 저장 하도록 구조 작업 필요
    // video editor
    ipcMain.handle('video-editor:save-frame', async (_, data: { frame: number; imageBase64: string; outputName: string }) => {
      const { frame, imageBase64, outputName } = data;
      const dirPath = path.resolve(process.cwd(), 'temp', outputName);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }
      const filePath = path.resolve(dirPath, `${outputName}-${frame}.png`);
      fs.writeFile(filePath, imageBase64, 'base64', (err) => {
        if (err) {
          console.log(`Error writing file: ${err} frame: ${frame}`);
        } else {
          console.log(`File is written successfully: ${filePath}`);
        }
      });
    });

    // TODO: 마찬가지로 어차피 생성한 프레임 이미지 기반으로만 비디오 생성하기 때문에, outputName 기반으로 main 단에서 알아서 하도록 수정 필요
    // ffmpeg frames to video
    ipcMain.handle('video-editor:frames-to-video', async (_, data: FrameToVideoArgs) => {
      // const { imagePath, outputPath, fps, width, height } = data;
      return convertImageFramesToVideo({
        imagePath: path.resolve(process.cwd(), 'temp', 'test-output', 'test-output-%d.png'),
        outputPath: path.resolve(process.cwd(), 'temp', 'output.mp4'),
        fps: 60,
        width: 1280,
        height: 720
      });
    });
  }
}

const main = new Main();
main.start().catch((e) => {
  console.error('Error starting Main: ', e);
});
