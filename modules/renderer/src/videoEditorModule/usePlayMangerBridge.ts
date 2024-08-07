import { useEffect } from 'react';
import { TVideoEditorEventMap, videoEditorManager } from '@renderer/src/videoEditorModule/videoEditorManager';
import { useEditorAtom } from '@renderer/src/store/editorAtom';

export default function useVideoEditorManagerBridge() {
  const { setState } = useEditorAtom();
  useEffect(() => {
    const onPlayerStateChange = (e: TVideoEditorEventMap['playerStateChange']) => {
      setState((draft) => {
        draft.playerState = e.detail.state;
      });
    };
    const onResourceChange = (e: TVideoEditorEventMap['resourceChange']) => {
      setState((draft) => {
        draft.resources = e.detail.resources;
      });
    };
    const onLayerChange = (e: TVideoEditorEventMap['layerChange']) => {
      setState((draft) => {
        draft.layers = e.detail.layers;
      });
    };
    videoEditorManager.addEventListener('playerStateChange', onPlayerStateChange);
    videoEditorManager.addEventListener('resourceChange', onResourceChange);
    videoEditorManager.addEventListener('layerChange', onLayerChange);

    setState((draft) => {
      draft.layers = videoEditorManager.layers;
    });

    return () => {
      videoEditorManager.removeEventListener('playerStateChange', onPlayerStateChange);
      videoEditorManager.removeEventListener('resourceChange', onResourceChange);
      videoEditorManager.removeEventListener('layerChange', onLayerChange);
    };
  }, []);
}
