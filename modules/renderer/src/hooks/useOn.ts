import { TOnChannel } from '../../../../typings/preload';
import { useEffect, useRef } from 'react';

export default function useOn<R = any>(channel: TOnChannel, callback: (res: R) => void) {
  const cbRef = useRef(callback);
  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const id = window.app.on(channel, (res) => {
      cbRef.current(res);
    });
    return () => {
      window.app.off(id);
    };
  }, []);
}
