import { atom } from 'jotai';
import { useImmerAtom } from 'jotai-immer';
import { Layer, Resource, TOutputChange, TVideoEditorState } from '@renderer/src/videoEditorModule/videoEditorManager';

interface TEditorAtom {
  playerState: TVideoEditorState;
  output?: TOutputChange;
  resources: Resource[];
  layers: Layer[];
}

const defaultValue: TEditorAtom = {
  playerState: 'pause',
  output: undefined,
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
