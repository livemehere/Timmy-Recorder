import useInvoke from '@renderer/src/hooks/useInvoke';
import type { SceneOption } from '@shared/shared-type';
import { useGlobalAtom } from '@renderer/src/store/globalAtom';

export default function useObs() {
  const { isRecording, setCurrentScene } = useGlobalAtom();
  const { invoke: invokeUpdateScene } = useInvoke<undefined>('osn:updateScene');

  const start = (scene?: SceneOption) => {
    if (isRecording) {
      throw new Error('Already recording');
    }
    if (scene) {
      invokeUpdateScene(scene).then(() => {
        setCurrentScene(scene);
        setTimeout(() => {
          start();
        }, 500);
      });
    } else {
      window.app.invoke('osn:start');
    }
  };

  const stop = () => {
    if (!isRecording) {
      return;
    }
    window.app.invoke('osn:stop');
    setCurrentScene(undefined);
  };

  return {
    start,
    stop
  };
}
