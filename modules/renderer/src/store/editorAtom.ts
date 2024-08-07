import { atom } from 'jotai';
import { useImmerAtom } from 'jotai-immer';
import { Layer, Resource, TVideoEditorState } from '@renderer/src/videoEditorModule/videoEditorManager';

interface TEditorAtom {
  playerState: TVideoEditorState;
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
  resources: Resource[];
  layers: Layer[];
}

const defaultValue: TEditorAtom = {
  playerState: 'pause',
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
  layers: []
};

export const editorAtom = atom<TEditorAtom>(defaultValue);
editorAtom.debugLabel = 'editorAtom';

/** immer */
export function useEditorAtom() {
  const [state, setState] = useImmerAtom(editorAtom);

  return {
    state,
    setState
  };
}
