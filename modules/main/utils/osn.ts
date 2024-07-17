import * as osn from 'obs-studio-node';
import path from 'path';
import electron, { app, screen } from 'electron';
import { uid } from 'uid';
import { byOS, isMac, OS } from '@main/utils/byOS';
import debugLog from "@shared/debugLog";

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
  isInit =false;

  constructor(props: ObsManagerProps) {
    this.host = props.host || HOST_NAME + uid(8);
    this.obsStudioNodePkgPath = props.obsStudioNodePkgPath || OBS_NODE_PKG_PATH;
    this.osnDataPath = props.osnDataPath || OBS_DATA_PATH;
    this.debug = props.debug || false;
  }


  init() {
    osn.NodeObs.IPC.host(this.host);
    osn.NodeObs.SetWorkingDirectory(this.obsStudioNodePkgPath);
    const apiInitRes = osn.NodeObs.OBS_API_initAPI('en-US', this.osnDataPath, '1.0.0');

    if (apiInitRes !== 0) {
      this.shutdown();
      throw new Error('Failed to initialize OBS');
    }
    debugLog('OBS Successfully initialized');
    this.setSetting('Output', 'Mode', 'Simple');
    // const availableEncoders = this.getAvailableValues('Output', 'Recording', isMac() ? 'RecAEncoder' : 'RecEncoder');
    // console.log(availableEncoders)
    this.setSetting('Output', 'RecEncoder', 'x264');
    this.setSetting('Output', 'FilePath', app.getPath('desktop'));
    this.setSetting('Output', 'RecFormat', 'mkv');
    this.setSetting('Output', 'VBitrate', 10000); // 10 Mbps
    this.setSetting('Video', 'FPSCommon', 60);

    const scene = this.setupScene();
    this.setupSources(scene);
    this.isInit = true;
    // console.log('scene', scene);

    // osn.NodeObs.OBS_service_startRecording();
  }

  getDisplayList() {
    const primaryDisplays = electron.screen.getPrimaryDisplay();
    return primaryDisplays;
  }

  shutdown() {
    debugLog('Shutting down OBS process');
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

    debugLog(`Setting ${category}.${parameter} changed from ${oldValue} to ${value}`);
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
    let currentTrack = 2;

    // getAudioDevices(byOS({ [OS.Windows]: 'wasapi_output_capture', [OS.Mac]: 'coreaudio_output_capture' }), 'desktop-audio').forEach(metadata => {
    //   if (metadata.device_id === 'default') return;
    //   const source = osn.InputFactory.create(byOS({ [OS.Windows]: 'wasapi_output_capture', [OS.Mac]: 'coreaudio_output_capture' }), 'desktop-audio', { device_id: metadata.device_id });
    //   setSetting('Output', `Track${currentTrack}Name`, metadata.name);
    //   source.audioMixers = 1 | (1 << currentTrack-1); // Bit mask to output to only tracks 1 and current track
    //   osn.Global.setOutputSource(currentTrack, source);
    //   currentTrack++;
    // });
    //
    // getAudioDevices(byOS({ [OS.Windows]: 'wasapi_input_capture', [OS.Mac]: 'coreaudio_input_capture' }), 'mic-audio').forEach(metadata => {
    //   if (metadata.device_id === 'default') return;
    //   const source = osn.InputFactory.create(byOS({ [OS.Windows]: 'wasapi_input_capture', [OS.Mac]: 'coreaudio_input_capture' }), 'mic-audio', { device_id: metadata.device_id });
    //   setSetting('Output', `Track${currentTrack}Name`, metadata.name);
    //   source.audioMixers = 1 | (1 << currentTrack-1); // Bit mask to output to only tracks 1 and current track
    //   osn.Global.setOutputSource(currentTrack, source);
    //   currentTrack++;
    // });

    this.setSetting('Output', 'RecTracks', parseInt('1'.repeat(currentTrack-1), 2)); // Bit mask of used tracks: 1111 to use first four (from available six)
  }

  startRecording(){
    if(!this.isInit){
      throw new Error('OBS is not initialized')
    }
    debugLog('Starting recording...');
    osn.NodeObs.OBS_service_startRecording();
  }

  stopRecording(){
    if(!this.isInit){
      throw new Error('OBS is not initialized')
    }
    debugLog('Stopping recording...');
    osn.NodeObs.OBS_service_stopRecording();
    debugLog('Stopped!');
  }
}
