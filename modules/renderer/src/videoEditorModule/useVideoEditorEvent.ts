import { EventListener, TVideoEditorEventKey, TVideoEditorEventMap, videoEditorManager } from '@renderer/src/videoEditorModule/videoEditorManager';
import { useEffect, useRef } from 'react';

export default function useVideoEditorEvent<K extends TVideoEditorEventKey>(event: K, listener: EventListener<TVideoEditorEventMap, K>) {
  const cb = useRef(listener);
  useEffect(() => {
    cb.current = listener;
  }, [listener]);

  useEffect(() => {
    videoEditorManager.addEventListener(event, cb.current);
    return () => {
      videoEditorManager.removeEventListener(event, cb.current);
    };
  }, [event, cb]);
}
