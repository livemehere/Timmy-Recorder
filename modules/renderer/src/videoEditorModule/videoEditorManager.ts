import { Renderer } from '@renderer/src/videoEditorModule/Renderer';
import { convertToMediaPath } from '@shared/path';
import { getVideoMetaData } from '@renderer/src/utils/preload';
import { uid } from 'uid';
import { ExtractFramesOptions, FrameToVideoArgs } from '../../../../typings/preload';
import { TimelineRenderer } from '@renderer/src/videoEditorModule/TimelineRenderer';

export type TVideoEditorState = 'play' | 'pause' | 'reset';
export interface TOutputChange {
  outDir: string;
  outputFormat: string;
  outputFilename: string;
  outputWidth: number;
  outputHeight: number;
  duration: number;
  fps: number;
  totalFrames: number;
  outputRange: [number, number];
}
export interface TVideoEditorEventMap {
  playerStateChange: CustomEvent<{ state: TVideoEditorState }>;
  frameChange: CustomEvent<{ frame: number }>;
  resourceChange: CustomEvent<{ resources: Resource[] }>;
  layerChange: CustomEvent<{ layers: Layer[] }>;
  outputChange: CustomEvent<TOutputChange>;
}
export type TVideoEditorEventKey = keyof TVideoEditorEventMap;
export type EventListener<T, K extends keyof T> = (this: T, ev: T[K]) => void;
export type ResourceType = 'video' | 'audio' | 'image' | 'text';
export type TVideoMetaData = {
  duration: number;
  totalFrames: number;
  fps: number;
  width: number;
  height: number;
  displayAspectRatio: string;
  bitRate: number;
};

export interface Resource {
  id: string;
  name: string;
  path: string;
  originPath: string;
  width: number;
  height: number;
  type: ResourceType;
  frames: string[]; // data url or image url
  metaData?: TVideoMetaData;
}

export interface Layer {
  position: [number, number];
  scale: [number, number];
  rotation: number;
  opacity: number;
  id: string;
  name: string;
  layerResources: LayerResource[];
}

export interface LayerResource {
  layerId: string;
  resourceId: string; // Resource
  startFrame: number;
  endFrame?: number;
  zIndex: number;
  position: [number, number];
  scale: [number, number];
  rotation: number;
  opacity: number;
  frames: string[]; // reference
  crop: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  originResource?: Resource;
}

const DEFAULT_FPS = 60;
const DEFAULT_DURATION = 60;
const DEFAULT_TOTAL_FRAMES = DEFAULT_FPS * DEFAULT_DURATION;
const DEFAULT_PLAY_SPEED = 1;
export const DEFAULT_LAYER: Layer = {
  position: [0, 0],
  scale: [1, 1],
  rotation: 0,
  opacity: 1,
  id: 'default-layer',
  name: 'default-layer',
  layerResources: []
};

const DEFAULT_LAYER_RESOURCE: LayerResource = {
  layerId: '',
  resourceId: '',
  startFrame: 0,
  endFrame: undefined,
  zIndex: 1,
  position: [0, 0],
  scale: [1, 1],
  rotation: 0,
  opacity: 1,
  frames: [], // data url or image url
  crop: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  originResource: undefined
};

export class VideoEditorManager extends EventTarget {
  isInit = false;
  private _playerState: TVideoEditorState = 'pause';
  private _curFrame = 0;
  private _totalFrames = DEFAULT_TOTAL_FRAMES;
  private timer: number | null = null;
  private _playSpeed = DEFAULT_PLAY_SPEED;
  private _fps = DEFAULT_FPS;
  private _duration = DEFAULT_DURATION; // seconds
  private _renderer = new Renderer();
  private _timelineRenderer: TimelineRenderer | null = null;
  private _layers: Layer[] = [];
  private _resources: Resource[] = [];

  private _outDir: string;
  private _outputFormat = 'mp4' as const;
  private _outputFilename: string;
  private _outputWidth = 1280;
  private _outputHeight = 720;
  private _outputRange: [number, number] = [0, DEFAULT_TOTAL_FRAMES];

  constructor() {
    super();
    this.addLayer(structuredClone(DEFAULT_LAYER));
    this._renderer.setSize(this._outputWidth, this._outputHeight);
  }

  init() {
    if (this.isInit) return;
    this.dispatchEvent('layerChange', { layers: this._layers });
    this.dispatchEvent('resourceChange', { resources: this._resources });
    this.dispatchOutputEvent();
    this.isInit = true;
  }

  // @ts-ignore
  addEventListener<K extends TVideoEditorEventKey>(type: K, listener: EventListener<TVideoEditorEventMap, K>): void {
    // @ts-ignore
    super.addEventListener(type as string, listener);
  }

  // @ts-ignore
  removeEventListener<K extends TVideoEditorEventKey>(type: K, listener: EventListener<TVideoEditorEventMap, K>): void {
    // @ts-ignore
    super.removeEventListener(type as string, listener);
  }

  // @ts-ignore
  dispatchEvent(type: TVideoEditorEventKey, detail: any): boolean {
    return super.dispatchEvent(new CustomEvent(type, { detail }));
  }

  set previewEl(el: HTMLDivElement) {
    if (this._renderer.previewEl) return;
    this._renderer.preview = el;
  }

  set timelinePreview(parent: HTMLDivElement) {
    this._timelineRenderer = new TimelineRenderer({
      parent,
      videoEditorManager: this
    });
  }

  get layers() {
    return this._layers;
  }

  get curFrame() {
    return this._curFrame;
  }

  private dispatchOutputEvent() {
    this.dispatchEvent('outputChange', {
      outDir: this._outDir,
      outputFormat: this._outputFormat,
      outputFilename: this._outputFilename,
      outputWidth: this._outputWidth,
      outputHeight: this._outputHeight,
      duration: this._duration,
      fps: this._fps,
      totalFrames: this._totalFrames,
      outputRange: this._outputRange
    });
  }

  public set outputRange(range: [number, number]) {
    this._outputRange = range;
    this.dispatchOutputEvent();
  }

  get outputRange() {
    return this._outputRange;
  }

  public set outDir(v: string) {
    this._outDir = v;
    this.dispatchOutputEvent();
  }

  public set OutputFilename(v: string) {
    this._outputFilename = v;
    this.dispatchOutputEvent();
  }

  public get playerState() {
    return this._playerState;
  }

  public set totalFrames(newTotalFrames: number) {
    this._totalFrames = newTotalFrames;
    this.dispatchOutputEvent();
  }

  get totalFrames() {
    return this._totalFrames;
  }

  public set playSpeed(newSpeed: number) {
    this._playSpeed = newSpeed;
  }

  public set fps(newFps: number) {
    this._fps = newFps;
    this._totalFrames = this._fps * this._duration;
    this.dispatchOutputEvent();
  }

  public set duration(newDuration: number) {
    this._duration = newDuration;
    this._totalFrames = this._fps * this._duration;
    this.dispatchOutputEvent();
  }

  public set curFrame(newFrame: number) {
    this._curFrame = newFrame;
    this.dispatchEvent('frameChange', { frame: newFrame });
  }

  public set playerState(newState: TVideoEditorState) {
    const isStateSame = this._playerState === newState;
    if (isStateSame) return;
    if (newState === 'play') {
      this.play();
    } else if (newState === 'pause' && this._playerState !== 'pause') {
      this.pause();
    } else if (newState === 'reset' && this._playerState !== 'reset') {
      this.reset();
    }
    this._playerState = newState;
    this.dispatchEvent('playerStateChange', { state: newState });
  }

  private play = () => {
    // TODO: fps 에 맞춰서 호출되도록 로직 추가 필요, 현재는 높거나,낮은 해상도에서 재생 속도가 다르게 표현될것임
    if (this._curFrame >= this._totalFrames) {
      this._curFrame = this._totalFrames;
      this.playerState = 'pause';
      return;
    }
    const nextFrame = this._curFrame + this._playSpeed;
    this.seek(nextFrame);
    this.timer = requestAnimationFrame(this.play.bind(this));
  };

  /** @description 특정 프레임으로 이동시킬 때 사용하세요 */
  seek(frame: number) {
    this._curFrame = frame;
    this.drawFrame(frame);
    this.dispatchEvent('frameChange', { frame: this._curFrame });
  }

  private pause = () => {
    cancelAnimationFrame(this.timer!);
  };

  private reset = () => {
    this._curFrame = 0;
    this.dispatchEvent('frameChange', { frame: 0 });
    if (this.timer) {
      cancelAnimationFrame(this.timer);
    }
  };

  addLayer(layer: Layer) {
    this._layers.push(layer);
    this.dispatchEvent('layerChange', { layers: this._layers });
  }

  addResource(resource: Resource) {
    this._resources.push(resource);
    this.dispatchEvent('resourceChange', { resources: this._resources });
  }

  async addVideoResource(originPath: string) {
    try {
      const resource = await this.generateVideoResource(originPath);
      this.addResource(resource);
    } catch (e) {
      console.error(e);
    }
  }

  private async generateVideoResource(originPath: string) {
    const convertedPath = convertToMediaPath(originPath);
    const metaData = await getVideoMetaData(originPath);
    if (!metaData) {
      throw new Error('비디오 메타데이터를 가져올 수 없습니다.');
    }
    const id = await window.app.invoke<string | undefined, string>('video-editor:getCachedResourceId', originPath);

    const videoSource: Resource = {
      id: id ?? uid(8),
      path: convertedPath,
      originPath: originPath,
      type: 'video',
      name: originPath.split('\\').pop() ?? '',
      width: metaData.width,
      height: metaData.height,
      metaData: metaData,
      frames: []
    };

    await this.extractVideoFrames({
      inputPath: originPath,
      fps: metaData.fps,
      resourceId: videoSource.id
    });
    const extractedFrames = await window.app.invoke('video-editor:getFramePaths', videoSource.id);
    videoSource.frames = extractedFrames;
    // todo frame 추출하기
    return videoSource;
  }

  async extractVideoFrames(params: Omit<ExtractFramesOptions, 'outDir'>) {
    const outDir = await window.app.invoke<string, Omit<ExtractFramesOptions, 'outDir'>>('video-editor:extractFrames', params);
    return outDir;
  }

  async generateVideo() {
    const res = await window.app.invoke<string, FrameToVideoArgs>('video-editor:frames-to-video', {
      outputName: this._outputFilename,
      outputPath: this._outDir,
      fps: this._fps,
      width: this._renderer.width,
      height: this._renderer.height,
      format: this._outputFormat
    });
    return res;
  }

  addResourceToLayer(layerId: string, resourceId: string) {
    const newLayer = this._layers.map((l) => {
      if (l.id === layerId) {
        const copy = structuredClone(l);
        const newLayerResource = structuredClone(DEFAULT_LAYER_RESOURCE);
        newLayerResource.layerId = layerId;
        newLayerResource.resourceId = resourceId;
        const resource = this._resources.find((r) => r.id === resourceId);
        if (!resource) {
          console.error(`Resource not found id : ${resourceId}`);
          return copy;
        }
        newLayerResource.frames = resource.frames;
        newLayerResource.originResource = resource;
        copy.layerResources = [...copy.layerResources, newLayerResource];
        return copy;
      } else {
        return l;
      }
    });
    this._layers = newLayer;
    this.dispatchEvent('layerChange', { layers: this._layers });
  }

  /**
   * - layer 별로 현재 프레임에 렌더링 되어야 하는 resource 를 캔버스에 그립니다.
   * - 그릴 요소가 없다면 모두 지웁니다.
   * - zIndex 값은 _layers 배열의 index 순서로 아래로 깔립니다. ex) 0 layer 는 가장 처음 그려지며, 1, 2 .. 번째 레이어에게 가려집니다.
   **/
  async drawFrame(curFrame: number) {
    let hasShowFrame = false;
    this._layers.forEach((layer, index) => {
      for (const lr of layer.layerResources) {
        if (lr.startFrame <= curFrame) {
          const relativeFrameIdx = curFrame - lr.startFrame;
          const showFrame = lr.frames[relativeFrameIdx];
          if (showFrame) {
            hasShowFrame = true;
            this._renderer.drawImage(index, convertToMediaPath(showFrame));
          }
        }
      }
    });
    if (!hasShowFrame) {
      this._renderer.clear();
    }
  }

  async saveFrames() {
    for (let i = this.outputRange[0]; i < this.outputRange[1]; i++) {
      await this.drawFrame(i);
      const dataUrl = this._renderer.getPNG();
    }
  }

  cleanUp() {
    this._timelineRenderer?.cleanUp();
  }
}

export const videoEditorManager = new VideoEditorManager();
