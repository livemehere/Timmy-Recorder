import { useEffect, useRef, useState } from 'react';
import { TInvokeChannel } from '../../../../typings/preload';

export default function useInvoke<R = any>(channel: TInvokeChannel, initialRun = false, onInitialChange: (data: R) => void = () => {}) {
  const [data, setData] = useState<R>();
  const initialCalled = useRef(false);

  /* 단 한번만 실행됨 (이후부터는 수동으로) */
  useEffect(() => {
    if (!initialRun || initialCalled.current) return;
    _invoke().then((res) => {
      setData(res);
      onInitialChange(res);
      initialCalled.current = true;
    });
  }, [channel, initialRun]);

  const _invoke = <Args = any>(args?: Args) => {
    return window.app.invoke<R>(channel, args);
  };

  return {
    data,
    invoke: _invoke
  };
}
