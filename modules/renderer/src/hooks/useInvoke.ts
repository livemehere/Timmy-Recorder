import { useEffect, useRef, useState } from 'react';
import { TInvokeChannel } from '../../../../typings/preload';

interface Option<R = any, Args = any> {
  args?: Args;
  fetchTicker?: number; // ms
  initialRun?: boolean;
  onInitialChange?: (data: R) => void;
  onInvoke?: <Param = any>(data: Param) => void;
}

export default function useInvoke<R = any, Args = any>(channel: TInvokeChannel, option?: Option<R, Args>) {
  const defaultArgs = option?.args;
  const [data, setData] = useState<R>();
  const initialCalled = useRef(false);
  const ticker = useRef<number>();
  const [isFetching, setIsFetching] = useState(false);

  /* 단 한번만 실행됨 (이후부터는 수동으로) */
  useEffect(() => {
    if (!option?.initialRun || initialCalled.current) return;
    _invoke(defaultArgs).then((res) => {
      setData(res);
      option?.onInitialChange?.(res);
      initialCalled.current = true;
    });
  }, [channel, option?.initialRun, option?.onInitialChange, option?.args]);

  useEffect(() => {
    if (option?.fetchTicker) {
      ticker.current = window.setInterval(() => {
        reFetch(defaultArgs);
      }, option.fetchTicker);
    }
    return () => {
      if (ticker.current) {
        clearInterval(ticker.current);
      }
    };
  }, [channel, option?.fetchTicker, option?.args]);

  const reFetch = (args?: Args) => {
    _invoke(args).then((res) => {
      setData(res);
    });
  };

  const _invoke = async <NewArgs = any>(args?: NewArgs) => {
    setIsFetching(true);
    const res = await window.app.invoke<R>(channel, args);
    setIsFetching(false);
    option?.onInvoke?.(args);
    return res;
  };

  return {
    data,
    invoke: _invoke,
    reFetch,
    isFetching
  };
}
