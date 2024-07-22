// import * as osn from 'obs-studio-node';
import path from 'path';
import { app, desktopCapturer, screen } from 'electron';
import { uid } from 'uid';
import debugLog from '@shared/debugLog';
import { IPerformanceState, MonitorInfo, SceneOption, WindowInfo } from '@shared/shared-type';
import { FPS_VALUES, VIDEO_BIT_RATES, VIDEO_FORMATS } from '@shared/shared-const';
import { IListProperty, IScene } from 'obs-studio-node/module';
import { settings, SettingsData } from '@main/Settings';
import { isMac } from '@main/utils/byOS';
import { EOBSSettingsCategories } from '@main/utils/osn/obs_enums';
import { CategorySetting } from '@main/utils/osn/obs_types';

const HOST_NAME = 'Obj-Manager-Host';
const OBS_NODE_PKG_PATH = path.join(process.cwd(), 'node_modules', 'obs-studio-node').replace('app.asar', 'app.asar.unpacked');
const OBS_DATA_PATH = path.join(process.cwd(), 'osn-data');
let osn: any;

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

    if (!isMac()) {
      osn = require('obs-studio-node');
    }

    /** 최초 1회 기본값 세팅 */
    const savedObsSetting = settings.get('obs');
    if (!savedObsSetting) {
      settings.set('obs', {
        outDir: app.getPath('desktop'),
        videoFormat: VIDEO_FORMATS[1], // mp4
        videoBitRate: VIDEO_BIT_RATES[3], // 1080p (12Mbps)
        videoFps: FPS_VALUES[2], // 60fps
        latestSceneOption: {
          captureType: 'monitor_capture',
          monitorInfo: this.getMonitorList()[0]
        }
      });
    }
  }

  init() {
    /** OSN 실행 */
    osn.NodeObs.IPC.host(this.host);
    osn.NodeObs.SetWorkingDirectory(this.obsStudioNodePkgPath);
    const apiInitRes = osn.NodeObs.OBS_API_initAPI('en-US', this.osnDataPath, '1.0.0');
    if (apiInitRes !== 0) {
      this.shutdown();
      throw new Error('Failed to initialize OBS');
    }
    debugLog('OBS Successfully Running');

    // 720p (7.5Mbps)

    /** OBS 기본 셋업 */
    const savedObsSettings = settings.get('obs');
    this.setSetting('Output', 'Mode', 'Advanced');

    console.dir(this.getCategorySettings(EOBSSettingsCategories.Video), { depth: 5 });

    /** GPU 엔코더 사용가능하면 사용. */
    const availableEncoders = this.getAvailableValues('Output', 'Recording', 'RecEncoder');
    console.log('@@ Encoders >> ', availableEncoders);
    const gpuEncoder = availableEncoders.slice(-1)[0] as string | undefined;
    this.setSetting('Output', 'RecEncoder', gpuEncoder || 'x264');

    /** 고품질 사용 가능하면 사용 (GPU 엔코더가 있어야 가능할 것임) */
    // const availableQualities = this.getAvailableValues('Output', 'Recording', 'Recgpu') as string[];
    // console.log(availableQualities);
    // const quality = availableQualities.includes('HQ') ? 'HQ' : 'Stream';
    // this.setSetting('Output', 'RecQuality', quality);
    const categories = this.getSettingCategories();
    console.log(this.getCategorySettings(EOBSSettingsCategories[categories[0]]));

    this.setSetting('Output', 'FilePath', savedObsSettings.outDir);
    this.setSetting('Output', 'RecFormat', savedObsSettings.videoFormat);
    this.setSetting('Output', 'VBitrate', savedObsSettings.videoBitRate.value); // 10 Mbps
    this.setSetting('Video', 'FPSCommon', savedObsSettings.videoFps);
    this.updateScene(savedObsSettings.latestSceneOption);
    this.isInit = true;
  }

  getSavedObsSettings(): SettingsData['obs'] {
    return settings.get('obs');
  }

  getPerformance(): IPerformanceState {
    return osn.NodeObs.OBS_API_getPerformanceStatistics();
  }

  setOutputDirectory(path: string) {
    if (!this.isInit) {
      throw new Error('OBS is not initialized');
    }
    this.setSetting('Output', 'FilePath', path);
    settings.set('obs', { ...settings.get('obs'), outDir: path });
  }

  setFps(fps: (typeof FPS_VALUES)[number]) {
    if (!this.isInit) {
      throw new Error('OBS is not initialized');
    }
    this.setSetting('Video', 'FPSCommon', fps);
    settings.set('obs', { ...settings.get('obs'), videoFps: fps });
  }

  setBitrate(bitrate: (typeof VIDEO_BIT_RATES)[number]) {
    if (!this.isInit) {
      throw new Error('OBS is not initialized');
    }
    this.setSetting('Output', 'VBitrate', bitrate.value);
    settings.set('obs', { ...settings.get('obs'), videoBitRate: bitrate });
  }

  setFormat(format: (typeof VIDEO_FORMATS)[number]) {
    if (!this.isInit) {
      throw new Error('OBS is not initialized');
    }
    this.setSetting('Output', 'RecFormat', format);
    settings.set('obs', { ...settings.get('obs'), videoFormat: format });
  }

  updateScene(option: SceneOption) {
    const scene = this.setupScene(option);
    this.setupSources(scene);
    settings.set('obs', { ...settings.get('obs'), latestSceneOption: option });
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

    debugLog(`>> Setting ${category}.${parameter} changed from ${oldValue} to ${value}`);
  }

  /** 설정 가능한 세팅 카테고리 배열을 반환합니다. */
  getSettingCategories() {
    return Object.keys(EOBSSettingsCategories) as (keyof typeof EOBSSettingsCategories)[];
  }

  /** 큰 카테고리의 서브카테고리 및 각 사용가능한 값의 배열을 반환합니다. */
  getCategorySettings(category: EOBSSettingsCategories): CategorySetting {
    return osn.NodeObs.OBS_settings_getSettings(category) ?? [];
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

  async getMonitorThumbnail(displayId: number) {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        width: 1280,
        height: 720
      }
    });
    const display = sources.find((capture) => +capture.display_id === displayId);
    if (!display) {
      throw new Error('display not found');
    }
    return display.thumbnail.toDataURL();
  }

  /** 호출 시점에서 녹화 가능한 모니터 목록을 반환합니다. */
  getMonitorList(): MonitorInfo[] {
    const screens = screen.getAllDisplays();
    return screens.map<MonitorInfo>((screen, index) => {
      const { width: originWidth, height: originHeight } = screen.size;
      const aspectRatio = originWidth / originHeight;

      return {
        id: screen.id,
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

  /** 호출 시점에서 녹화 가능한 윈도우창 목록을 반환합니다. */
  async getWindowList(): Promise<WindowInfo[]> {
    const videoSource = osn.InputFactory.create('window_capture', 'desktop-video');
    const _windows = (videoSource.properties.get('window') as IListProperty).details.items as WindowInfo[];
    return _windows;
  }

  setupScene(option: SceneOption) {
    const videoSource = osn.InputFactory.create(option.captureType, 'target-video');
    const scene = osn.SceneFactory.create('capture-scene');

    /** video 소스 셋업 (모니터 or 윈도우) */
    if (option.captureType === 'monitor_capture') {
      debugLog(`Start Video source setup with monitor`);
      debugLog(option);

      /** 모니터 캡처 설정 */
      const settings = videoSource.settings;
      settings['monitor'] = option.monitorInfo.monitorIndex;
      settings['width'] = option.monitorInfo.physicalWidth;
      settings['height'] = option.monitorInfo.physicalHeight;
      videoSource.update(settings);
      videoSource.save();

      /** 모니터 비율 조정(?) */
      const videoScaleFactor = option.monitorInfo.scaleFactor;
      const sceneItem = scene.add(videoSource);
      sceneItem.scale = { x: 1.0 / videoScaleFactor, y: 1.0 / videoScaleFactor };

      /** 결과물 사이즈 */
      const outputWidth = option.monitorInfo.width;
      const outputHeight = Math.round(outputWidth / option.monitorInfo.aspectRatio);
      this.setSetting('Video', 'Base', `${outputWidth}x${outputHeight}`);
      this.setSetting('Video', 'Output', `${outputWidth}x${outputHeight}`);

      debugLog(`Output Size: ${outputWidth}x${outputHeight}`);
      debugLog('Video source setup complete');
    } else if (option.captureType === 'window_capture') {
      debugLog(`Start Video source setup with window`);
      debugLog(option);

      /** 윈도우 캡처 설정 */
      const settings = videoSource.settings;
      settings['window'] = option.windowInfo.value;
      videoSource.update(settings);
      videoSource.save();

      /** 윈도우 비율 조정(?) - 필요없나? */
      const videoScaleFactor = 1.0;
      const sceneItem = scene.add(videoSource);
      sceneItem.scale = { x: 1.0 / videoScaleFactor, y: 1.0 / videoScaleFactor };

      /** 소스 입력 후 딜레이시간이 필요함 */
      setTimeout(() => {
        const outputWidth = videoSource.width;
        const outputHeight = videoSource.height;
        this.setSetting('Video', 'Base', `${outputWidth}x${outputHeight}`);
        this.setSetting('Video', 'Output', `${outputWidth}x${outputHeight}`);
        debugLog(`Output Size: ${outputWidth}x${outputHeight}`);
        debugLog('Video source setup complete');
      }, 500);
    }
    return scene;
  }

  setupSources(scene: IScene) {
    osn.Global.setOutputSource(1, scene);

    this.setSetting('Output', 'Track1Name', 'Mixed: all sources');
    const currentTrack = 2;

    // this.getAudioDevices('wasapi_output_capture', 'desktop-audio').forEach((metadata: any) => {
    //   if (metadata.device_id === 'default') return;
    //   const source = osn.InputFactory.create('wasapi_output_capture', 'desktop-audio', { device_id: metadata.device_id });
    //   this.setSetting('Output', `Track${currentTrack}Name`, metadata.name);
    //   source.audioMixers = 1 | (1 << (currentTrack - 1)); // Bit mask to output to only tracks 1 and current track
    //   osn.Global.setOutputSource(currentTrack, source);
    //   currentTrack++;
    // });

    // getAudioDevices(byOS({ [OS.Windows]: 'wasapi_input_capture', [OS.Mac]: 'coreaudio_input_capture' }), 'mic-audio').forEach(metadata => {
    //   if (metadata.device_id === 'default') return;
    //   const source = osn.InputFactory.create(byOS({ [OS.Windows]: 'wasapi_input_capture', [OS.Mac]: 'coreaudio_input_capture' }), 'mic-audio', { device_id: metadata.device_id });
    //   setSetting('Output', `Track${currentTrack}Name`, metadata.name);
    //   source.audioMixers = 1 | (1 << currentTrack-1); // Bit mask to output to only tracks 1 and current track
    //   osn.Global.setOutputSource(currentTrack, source);
    //   currentTrack++;
    // });

    this.setSetting('Output', 'RecTracks', parseInt('1'.repeat(currentTrack - 1), 2)); // Bit mask of used tracks: 1111 to use first four (from available six)
    //
    // setTimeout(() => {
    //   console.log(scene.getItems().length);
    //   console.log(scene.getItems()[0].source.width, scene.getItems()[0].source.height);
    // }, 100);
  }

  getAudioDevices(type: string, subtype: string) {
    const dummyDevice = osn.InputFactory.create(type, subtype, { device_id: 'does_not_exist' });
    const devices = dummyDevice.properties.get('device_id').details.items.map(({ name, value }: { name: string; value: string }) => {
      return { device_id: value, name };
    });
    dummyDevice.release();
    return devices;
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
