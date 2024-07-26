import { TSettingCategoryEnumKey } from '@main/utils/osn/obs_enums';
import type { FfprobeData } from 'fluent-ffmpeg';

export type OSN =
  | 'osn:getSettingCategories'
  | 'osn:setSetting'
  | 'osn:getSubCategoryAndParams'
  | 'osn:start'
  | 'osn:stop'
  | 'osn:formatValues'
  | 'osn:setFormat'
  | 'osn:setFps'
  | 'osn:getFpsValues'
  | 'osn:getMonitorList'
  | 'osn:updateScene'
  | 'osn:getBitrateValues'
  | 'osn:setBitrate'
  | 'osn:getWindowList'
  | 'osn:getSettings'
  | 'osn:getPerformance'
  | 'osn:getThumbnail';
export type VideoEdit = 'video-editor:create-sequence' | 'video-editor:save-frame' | 'video-editor:frames-to-video' | 'video-editor:getMetaData';
export type TInvokeChannel = 'test' | 'dialog:open' | 'shell:openExternal' | 'shell:trashItem' | 'shell:openDir' | 'notification:show' | OSN | VideoEdit;
export type TOnChannel = 'osn:signal';
export type TPreloadAPI = {
  invoke: <R = any, Args = any>(channel: TInvokeChannel, args?: Args) => Promise<R>;
  on: <R = any>(channel: TOnChannel, callback: (res: R) => void) => number;
  onMessage: (channel: string, callback: (...args: any[]) => void) => number;
  off: (id: number) => void;
};

/** 응답값 & 파라미터 타입 */

export type FrameToVideoArgs = {
  imagePath: string;
  outputPath: string;
  fps: number;
  width: number;
  height: number;
};

export type SetSettingArgs = {
  categoryEnumKey: TSettingCategoryEnumKey;
  parameter: string;
  value: string | boolean;
};

export type RVideoMetaData = FfprobeData;

export type CreateBlankVideoParams = {
  outputPath: string;
  filename: string;
  fps: number;
  duration: number;
  width: number;
  height: number;
};
