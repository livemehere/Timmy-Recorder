import { atom } from 'jotai';
import { useImmerAtom } from 'jotai-immer';

interface TResource {
  origin: {
    path: string;
    width: number;
    height: number;
    duration: number;
    fps: number;
  };
  id: string;
  name: string;
  path: string;
  width: number;
  height: number;
  duration: number;
  fps: number;
  startTime: number;
  endTime: number;
  display: 'show' | 'hidden';
  type: 'video' | 'audio' | 'image' | 'text';
}

interface TEditorAtom {
  input: {
    fps: number;
    width: number;
    height: number;
    duration: number;
  };
  output: {
    fps: number;
    width: number;
    height: number;
    format: 'mp4';
    outputFilename: string;
    outputDir: string;
  };
  videoSources: TResource[];
  layers: {
    id: string;
    name: string;
    resources: TResource[];
  }[];
}

export const editorAtom = atom<TEditorAtom | null>(null);

/** immer */
export function useEditorAtom() {
  const [state, setState] = useImmerAtom(editorAtom);

  return {
    state,
    setState
  };
}
