import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';
import { TPreloadAPI } from '../../typings/preload';

let seq = 0;
const map = new Map<
  number,
  {
    channel: string;
    listener: any;
  }
>();
const preloadAPI: TPreloadAPI = {
  invoke: async (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, callback) => {
    seq++;
    const listener = (event: IpcRendererEvent, args: any) => callback(args);
    map.set(seq, { channel, listener });
    ipcRenderer.on(channel, listener);
    return seq;
  },
  off: (id) => {
    const v = map.get(id);
    if (!v) return;
    const { channel, listener } = v;
    ipcRenderer.off(channel, listener);
    map.delete(id);
  },
  onMessage: (channel, callback) => {
    const listener = (...args: any[]) => callback(...args);
    map.set(seq, { channel, listener });
    ipcRenderer.on(channel, listener);
    return seq;
  }
};

contextBridge.exposeInMainWorld('app', preloadAPI);
