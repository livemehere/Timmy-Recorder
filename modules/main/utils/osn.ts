import * as osn from 'obs-studio-node';
import path from 'path';
import { app, screen, desktopCapturer } from 'electron';
import { uid } from 'uid';
import { byOS, isMac, OS } from '@main/utils/byOS';
import debugLog from '@shared/debugLog';
import { MonitorInfo, SceneOption, WindowInfo } from '@shared/shared-type';
import { FPS_VALUES, VIDEO_BIT_RATES, VIDEO_FORMATS } from '@shared/shared-const';

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
  isInit = false;

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

    this.getWindowList();

    if (apiInitRes !== 0) {
      this.shutdown();
      throw new Error('Failed to initialize OBS');
    }
    debugLog('OBS Successfully initialized');
    // TODO: set 하는 곳에서 저장해두고, 최초 실행시에 불러와서 적용하도록 수정
    this.setSetting('Output', 'Mode', 'Simple');
    // const availableEncoders = this.getAvailableValues('Output', 'Recording', isMac() ? 'RecAEncoder' : 'RecEncoder');
    // console.log(availableEncoders)
    this.setSetting('Output', 'RecEncoder', 'x264');
    this.setSetting('Output', 'FilePath', app.getPath('desktop'));
    this.setSetting('Output', 'RecFormat', VIDEO_FORMATS[0]);
    this.setSetting('Output', 'VBitrate', VIDEO_BIT_RATES[0]); // 10 Mbps
    this.setSetting('Video', 'FPSCommon', FPS_VALUES[0]);

    const defaultMonitor = this.getMonitorList()[0];

    this.updateScene({
      captureType: 'monitor_capture',
      monitorInfo: defaultMonitor
    });
    this.isInit = true;
  }

  setFps(fps: (typeof FPS_VALUES)[number]) {
    if (!this.isInit) {
      throw new Error('OBS is not initialized');
    }
    this.setSetting('Video', 'FPSCommon', fps);
  }

  setBitrate(bitrate: (typeof VIDEO_BIT_RATES)[number]) {
    if (!this.isInit) {
      throw new Error('OBS is not initialized');
    }
    this.setSetting('Output', 'VBitrate', bitrate.value);
  }

  setFormat(format: (typeof VIDEO_FORMATS)[number]) {
    if (!this.isInit) {
      throw new Error('OBS is not initialized');
    }
    this.setSetting('Output', 'RecFormat', format);
  }

  updateScene(option: SceneOption) {
    const scene = this.setupScene(option);
    this.setupSources(scene);
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

  private getAvailableValues(category: string, subcategory: string, parameter: any) {
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

  getMonitorList(): MonitorInfo[] {
    const screens = screen.getAllDisplays();
    return screens.map<MonitorInfo>((screen, index) => {
      const { width: originWidth, height: originHeight } = screen.size;
      const aspectRatio = originWidth / originHeight;

      return {
        monitorIndex: index,
        label: `${screen.label}-${screen.id}`,
        width: originWidth,
        height: originHeight,
        scaleFactor: screen.scaleFactor,
        physicalWidth: originWidth * screen.scaleFactor,
        physicalHeight: originHeight * screen.scaleFactor,
        aspectRatio
      };
    });
  }

  async getWindowList(): Promise<WindowInfo[]> {
    const videoSource = osn.InputFactory.create(byOS({ [OS.Windows]: 'window_capture', [OS.Mac]: 'window_capture' }), 'desktop-video', {});
    // @ts-ignore
    const _windows = videoSource.properties.get('window').details.items as WindowInfo[];
    return _windows;
  }

  setupScene(option: SceneOption) {
    let videoSource: osn.IInput;
    if (option.captureType === 'monitor_capture') {
      videoSource = osn.InputFactory.create(byOS({ [OS.Windows]: 'monitor_capture', [OS.Mac]: 'display_capture' }), 'desktop-video', {
        monitor: option.monitorInfo.monitorIndex
      });
      const settings = videoSource.settings;
      settings['width'] = option.monitorInfo.physicalWidth;
      settings['height'] = option.monitorInfo.physicalHeight;
      // TODO: x,y 좌표값 설정 찾기
      // settings['screenX'] = 300;
      // settings['screenY'] = 300;
      videoSource.update(settings);
      videoSource.save();

      // Set output video size to monitor size
      const outputWidth = option.monitorInfo.width;
      const outputHeight = Math.round(outputWidth / option.monitorInfo.aspectRatio);
      this.setSetting('Video', 'Base', `${outputWidth}x${outputHeight}`);
      this.setSetting('Video', 'Output', `${outputWidth}x${outputHeight}`);
      const videoScaleFactor = option.monitorInfo.physicalWidth / outputWidth;

      // A scene is necessary here to properly scale captured screen size to output video size
      const scene = osn.SceneFactory.create('test-scene');
      const sceneItem = scene.add(videoSource);
      sceneItem.scale = { x: 1.0 / videoScaleFactor, y: 1.0 / videoScaleFactor };
      return scene;
    } else if (option.captureType === 'window_capture') {
      debugLog('윈도우를 캡쳐합니다');
      console.log(option);
      videoSource = osn.InputFactory.create(byOS({ [OS.Windows]: 'window_capture', [OS.Mac]: 'window_capture' }), 'window-video', {});
      const settings = videoSource.settings;
      settings['window'] = option.windowInfo.value;
      videoSource.update(settings);
      videoSource.save();

      const outputWidth = videoSource.width;
      const outputHeight = videoSource.height;
      const videoScaleFactor = 1.0;
      // this.setSetting('Video', 'Base', `${outputWidth}x${outputHeight}`);
      // this.setSetting('Video', 'Output', `${outputWidth}x${outputHeight}`);

      const scene = osn.SceneFactory.create('test-scene');
      const sceneItem = scene.add(videoSource);
      sceneItem.scale = { x: 1.0 / videoScaleFactor, y: 1.0 / videoScaleFactor };

      const s = scene.getItems()[0];
      console.log(s.source.name);
      console.log('bounds', s.bounds);
      console.log('position', s.position);
      console.log('visible', s.visible);
      console.log('width,height', s.source.width, s.source.height);

      return scene;
    }
    throw new Error(`지원하지 않는 captureType입니다. (${option}은 지원하지 않습니다.)`);
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

    this.setSetting('Output', 'RecTracks', parseInt('1'.repeat(currentTrack - 1), 2)); // Bit mask of used tracks: 1111 to use first four (from available six)
  }

  startRecording() {
    if (!this.isInit) {
      throw new Error('OBS is not initialized');
    }
    debugLog('Starting recording...');
    osn.NodeObs.OBS_service_startRecording();
  }

  stopRecording() {
    if (!this.isInit) {
      throw new Error('OBS is not initialized');
    }
    debugLog('Stopping recording...');
    osn.NodeObs.OBS_service_stopRecording();
    debugLog('Stopped!');
  }
}
