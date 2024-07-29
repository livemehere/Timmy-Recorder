import { atom } from 'jotai';
import { useImmerAtom } from 'jotai-immer';

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
  videoSources: {
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
