export type SceneOption =
  | {
      captureType: 'monitor_capture';
      monitorInfo: MonitorInfo;
    }
  | {
      captureType: 'window_capture';
      windowInfo: WindowInfo;
    };

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
