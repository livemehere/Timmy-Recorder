import * as osn from 'obs-studio-node';
import path from 'path';
import electron, { app, screen } from 'electron';
import { uid } from 'uid';
import { byOS, isMac, OS } from '@main/utils/byOS';
import OBSWebSocket from 'obs-websocket-js';

const HOST_NAME = 'Obj-Manager-Host';
const OBS_NODE_PKG_PATH = path.join(process.cwd(), 'node_modules', 'obs-studio-node');
const OBS_DATA_PATH = path.join(process.cwd(), 'osn-data');

interface ObsManagerProps {
  debug?: boolean;
  host?: string;
  obsStudioNodePkgPath?: string;
  osnDataPath?: string;
}

export class ObsManager {
  debug: boolean;
  host: string;
  obsStudioNodePkgPath: string;
  osnDataPath: string;

  constructor(props: ObsManagerProps) {
    this.host = props.host || HOST_NAME + uid(8);
    this.obsStudioNodePkgPath = props.obsStudioNodePkgPath || OBS_NODE_PKG_PATH;
    this.osnDataPath = props.osnDataPath || OBS_DATA_PATH;
    this.debug = props.debug || false;
  }

  private debugLog(...args: any[]) {
    if (this.debug) {
      console.log(...args);
    }
  }

  init() {
    osn.NodeObs.IPC.host(this.host);
    osn.NodeObs.SetWorkingDirectory(this.obsStudioNodePkgPath);
    const apiInitRes = osn.NodeObs.OBS_API_initAPI('en-US', this.osnDataPath, '1.0.0');

    if (apiInitRes !== 0) {
      throw new Error('Failed to initialize OBS');
    }
    this.debugLog('OBS Successfully initialized');

    console.log(osn.NodeObs.IPC.setServerPath(this.host));
    const network = osn.NodeObs.Network.create();
    console.log('bindIP', network.bindIP);

    const obs = new OBSWebSocket.default();
    obs.connect('ws://default').then((res) => {
      console.log('res', res);
    });

    this.setSetting('Output', 'Mode', 'Simple');
    const availableEncoders = this.getAvailableValues('Output', 'Recording', isMac() ? 'RecAEncoder' : 'RecEncoder');
    this.setSetting('Output', 'RecEncoder', availableEncoders.slice(-1)[0] || 'x264');
    this.setSetting('Output', 'FilePath', app.getPath('desktop'));
    this.setSetting('Output', 'RecFormat', 'mkv');
    this.setSetting('Output', 'VBitrate', 10000); // 10 Mbps
    this.setSetting('Video', 'FPSCommon', 60);

    // const scene = this.setupScene();
    // this.setupSources(scene);
    // console.log('scene', scene);

    // osn.NodeObs.OBS_service_startRecording();
  }

  getDisplayList() {
    const primaryDisplays = electron.screen.getPrimaryDisplay();
    return primaryDisplays;
  }

  shutdown() {
    this.debugLog('Shutting down OBS process');
    try {
      osn.NodeObs.OBS_service_removeCallback();
      osn.NodeObs.IPC.disconnect();
    } catch (e) {
      throw Error(`Exception when shutting down OBS process${e}`);
    }
  }

  setSetting(category: string, parameter: string, value: any) {
    let oldValue;
    // Getting settings container
    const settings = osn.NodeObs.OBS_settings_getSettings(category).data;

    settings.forEach((subCategory: any) => {
      subCategory.parameters.forEach((param: any) => {
        if (param.name === parameter) {
          oldValue = param.currentValue;
          param.currentValue = value;
        }
      });
    });
    // Saving updated settings container
    if (value != oldValue) {
      osn.NodeObs.OBS_settings_saveSettings(category, settings);
    }

    this.debugLog(`Setting ${category}.${parameter} changed from ${oldValue} to ${value}`);
  }

  getAvailableValues(category: string, subcategory: string, parameter: any) {
    const categorySettings = osn.NodeObs.OBS_settings_getSettings(category).data;
    if (!categorySettings) {
      console.warn(`There is no category ${category} in OBS settings`);
      return [];
    }

    const subcategorySettings = categorySettings.find((sub: any) => sub.nameSubCategory === subcategory);
    if (!subcategorySettings) {
      console.warn(`There is no subcategory ${subcategory} for OBS settings category ${category}`);
      return [];
    }

    const parameterSettings = subcategorySettings.parameters.find((param: any) => param.name === parameter);
    if (!parameterSettings) {
      console.warn(`There is no parameter ${parameter} for OBS settings category ${category}.${subcategory}`);
      return [];
    }

    return parameterSettings.values.map((value: any) => Object.values(value)[0]);
  }

  setupScene() {
    console.log('setupScene');
    const videoSource = osn.InputFactory.create(byOS({ [OS.Windows]: 'monitor_capture', [OS.Mac]: 'display_capture' }), 'desktop-video');
    console.log('videoSource', videoSource);

    const { physicalWidth, physicalHeight, aspectRatio } = this.displayInfo();

    // Update source settings:
    const settings = videoSource.settings;
    settings['width'] = physicalWidth;
    settings['height'] = physicalHeight;
    videoSource.update(settings);
    videoSource.save();

    // Set output video size to 1920x1080
    const outputWidth = 1920;
    const outputHeight = Math.round(outputWidth / aspectRatio);
    this.setSetting('Video', 'Base', `${outputWidth}x${outputHeight}`);
    this.setSetting('Video', 'Output', `${outputWidth}x${outputHeight}`);
    const videoScaleFactor = physicalWidth / outputWidth;

    // A scene is necessary here to properly scale captured screen size to output video size
    const scene = osn.SceneFactory.create('test-scene');
    const sceneItem = scene.add(videoSource);
    sceneItem.scale = { x: 1.0 / videoScaleFactor, y: 1.0 / videoScaleFactor };

    return scene;
  }

  displayInfo() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;
    const { scaleFactor } = primaryDisplay;
    return {
      width,
      height,
      scaleFactor: scaleFactor,
      aspectRatio: width / height,
      physicalWidth: width * scaleFactor,
      physicalHeight: height * scaleFactor
    };
  }

  setupSources(scene: osn.IScene) {
    osn.Global.setOutputSource(1, scene);
    this.setSetting('Output', 'Track1Name', 'Mixed: all sources');
  }
}
