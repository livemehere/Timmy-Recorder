import { atom, useAtom } from 'jotai';
import { AutoRecordAbleWindow } from '@renderer/src/utils/autoRecord';
import { ObsOutputSignalInfo } from '@main/utils/osn/obs_types';
import { SceneOption } from '@shared/shared-type';

interface GlobalAtom {
  currentAutoRecordWindow?: AutoRecordAbleWindow;
  obsSignalInfo?: ObsOutputSignalInfo;
  currentScene?: SceneOption;
}
export const globalAtom = atom<GlobalAtom>({
  currentAutoRecordWindow: undefined,
  obsSignalInfo: undefined,
  currentScene: undefined
});

export function useGlobalAtom() {
  const [state, setState] = useAtom(globalAtom);
  const isRecording = state.obsSignalInfo?.type === 'recording' && state.obsSignalInfo?.signal === 'start';
  const obsError = state.obsSignalInfo?.error;
  const selectedMonitorInfo = state.currentScene?.captureType === 'monitor_capture' ? state.currentScene.monitorInfo : undefined;
  const selectedWindowInfo = state.currentScene?.captureType === 'window_capture' ? state.currentScene.windowInfo : undefined;

  const setCurrentAutoRecordWindow = (currentAutoRecordWindow: AutoRecordAbleWindow | undefined) => {
    setState((prev) => ({ ...prev, currentAutoRecordWindow }));
  };

  const setObsSignalInfo = (obsSignalInfo: ObsOutputSignalInfo | undefined) => {
    setState((prev) => ({ ...prev, obsSignalInfo }));
  };

  const setCurrentScene = (currentScene: SceneOption | undefined) => {
    setState((prev) => ({ ...prev, currentScene }));
  };

  return {
    state,
    isRecording,
    obsError,
    selectedMonitorInfo,
    selectedWindowInfo,
    setCurrentAutoRecordWindow,
    setObsSignalInfo,
    setCurrentScene
  };
}
