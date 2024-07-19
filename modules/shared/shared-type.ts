export type MonitorScene = {
  captureType: 'monitor_capture';
  monitorInfo: MonitorInfo;
};

export type WindowScene = {
  captureType: 'window_capture';
  windowInfo: WindowInfo;
};

export type SceneOption = MonitorScene | WindowScene;

export interface MonitorInfo {
  monitorIndex: number;
  label: string;
  width: number;
  height: number;
  physicalWidth: number;
  physicalHeight: number;
  scaleFactor: number;
  aspectRatio: number;
}

export interface WindowInfo {
  name: string;
  value: string;
  enabled: boolean;
}

/** OSN */
export interface IPerformanceState {
  CPU: number;
  numberDroppedFrames: number;
  percentageDroppedFrames: number;
  streamingBandwidth: number;
  streamingDataOutput: number;
  recordingBandwidth: number;
  recordingDataOutput: number;
  frameRate: number;
  averageTimeToRenderFrame: number;
  memoryUsage: number;
  diskSpaceAvailable: string;
}
