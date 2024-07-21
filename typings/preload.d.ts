export type OSN =
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
export type VideoEdit = 'video-editor:save-frame';
export type TInvokeChannel = 'test' | 'dialog:open' | 'shell:openExternal' | 'shell:trashItem' | 'shell:openDir' | 'notification:show' | OSN | VideoEdit;
export type TPreloadAPI = {
  invoke: <R = any, Args = any>(channel: TInvokeChannel, args: Args) => Promise<R>;
  on: (channel: string, callback: (...args: any[]) => void) => number;
  onMessage: (channel: string, callback: (...args: any[]) => void) => number;
  off: (id: number) => void;
};
