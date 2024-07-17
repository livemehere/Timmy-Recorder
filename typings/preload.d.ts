export type OSN = 'osn:start' | 'osn:stop';
export type TInvokeChannel = 'test' | 'dialog:open' | 'shell:openExternal' | 'shell:trashItem' | 'shell:openDir' | 'notification:show' | OSN;
export type TPreloadAPI = {
  invoke: <R = any>(channel: TInvokeChannel, ...args: any[]) => Promise<R>;
  on: (channel: string, callback: (...args: any[]) => void) => number;
  onMessage: (channel: string, callback: (...args: any[]) => void) => number;
  off: (id: number) => void;
};
