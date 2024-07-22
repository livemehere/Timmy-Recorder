import { atom, useAtom } from 'jotai';
import { AutoRecordAbleWindow } from '@renderer/src/utils/autoRecord';

interface GlobalAtom {
  isRecording: boolean;
  currentAutoRecordWindow?: AutoRecordAbleWindow;
}
export const globalAtom = atom<GlobalAtom>({
  isRecording: false,
  currentAutoRecordWindow: undefined
});

export function useGlobalAtom() {
  const [state, setState] = useAtom(globalAtom);
  const setIsRecording = (isRecording: boolean) => {
    setState((prev) => ({ ...prev, isRecording }));
  };

  const setCurrentAutoRecordWindow = (currentAutoRecordWindow: AutoRecordAbleWindow | undefined) => {
    setState((prev) => ({ ...prev, currentAutoRecordWindow }));
  };

  return {
    state,
    setIsRecording,
    setCurrentAutoRecordWindow
  };
}
