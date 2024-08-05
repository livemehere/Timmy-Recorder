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

interface TEditorAtom {
  output: {
    fps: number;
    width: number;
    height: number;
    format: 'mp4';
    outputFilename: string;
    outputDir: string;
  };
  resources: TResource[];
  layers: {
    id: string;
    name: string;
    resources: TResource[];
  }[];
}
const defaultValue: TEditorAtom = {
  output: {
    fps: 60,
    width: 1280,
    height: 720,
    format: 'mp4',
    outputFilename: 'output',
    outputDir: ''
  },
  resources: [],
  layers: []
};
export const editorAtom = atom<TEditorAtom>(defaultValue);

/** immer */
export function useEditorAtom() {
  const [state, setState] = useImmerAtom(editorAtom);

  const appendResource = (resource: TResource) => {
    setState((prev) => {
      prev.resources.push(resource);
    });
  };

  return {
    state,
    setState,
    appendResource
  };
}
