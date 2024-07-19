import { atom, useAtom } from 'jotai';

interface GlobalAtom {
  isRecording: boolean;
}
export const globalAtom = atom<GlobalAtom>({
  isRecording: false
});

export function useGlobalAtom() {
  const [state, setState] = useAtom(globalAtom);
  const setIsRecording = (isRecording: boolean) => {
    setState((prev) => ({ ...prev, isRecording }));
  };

  return {
    state,
    setIsRecording
  };
}
