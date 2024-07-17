export interface SceneOption {
  captureType: 'monitor_capture' | 'window_capture';
  monitorInfo: MonitorInfo;
}

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
