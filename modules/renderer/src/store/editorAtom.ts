import { atom } from 'jotai';
import { useImmerAtom } from 'jotai-immer';

type ResourceType = 'video' | 'audio' | 'image' | 'text';
interface TResource {
  id: string;
  name: string;
  path: string;
  originPath: string;
  type: ResourceType;
}

export interface VideoResource extends TResource {
  width: number;
  height: number;
  duration: number;
  fps: number;
  totalFrames: number;
  displayAspectRatio: string;
  bitRate: number;
  type: 'video';
}

export interface Layer {
  position: [number, number];
  scale: [number, number];
  rotation: number;
  opacity: number;
  startFrame: number;
  endFrame?: number;
  id: string;
  name: string;
  zIndex: number;
  layerResources: LayerResource[];
}

export interface LayerResource {
  layerId: string;
  resourceId: string;
  startFrame: number;
  endFrame?: number;
  zIndex: number;
  position: [number, number];
  scale: [number, number];
  rotation: number;
  opacity: number;
}

interface TEditorAtom {
  output: {
    fps: number;
    width: number;
    height: number;
    format: 'mp4';
    outputFilename: string;
    outputDir: string;
    duration: number; // seconds
    totalFrames: number;
  };
  resources: TResource[];
  layers: Layer[];
}

export const DEFAULT_LAYER: Layer = {
  position: [0, 0],
  scale: [1, 1],
  rotation: 0,
  opacity: 1,
  startFrame: 0,
  endFrame: undefined,
  id: 'default-layer',
  name: 'default-layer',
  zIndex: 1,
  layerResources: []
};
const defaultValue: TEditorAtom = {
  output: {
    fps: 60,
    width: 1280,
    height: 720,
    format: 'mp4',
    outputFilename: 'output',
    outputDir: '',
    duration: 60,
    totalFrames: 60 * 60
  },
  resources: [],
  layers: [DEFAULT_LAYER]
};

export const editorAtom = atom<TEditorAtom>(defaultValue);
editorAtom.debugLabel = 'editorAtom';

/** immer */
export function useEditorAtom() {
  const [state, setState] = useImmerAtom(editorAtom);

  const appendResource = (resource: TResource) => {
    setState((prev) => {
      prev.resources.push(resource);
    });
  };

  const appendLayer = (layer: Layer) => {
    setState((prev) => {
      prev.layers.push(layer);
    });
  };

  const appendResourceToLayer = (layerId: string, resourceId: string) => {
    setState((prev) => {
      const layer = prev.layers.find((l) => l.id === layerId);
      if (!layer) return;
      layer.layerResources.push({
        layerId,
        resourceId,
        startFrame: 0,
        endFrame: undefined,
        zIndex: 0,
        position: [0, 0],
        scale: [1, 1],
        rotation: 0,
        opacity: 1
      });
    });
  };

  return {
    state,
    setState,
    appendResource,
    appendLayer,
    appendResourceToLayer
  };
}
