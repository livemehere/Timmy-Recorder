import { useEffect, useRef, useState } from 'react';
import { TInvokeChannel } from '../../../../typings/preload';

interface Option {
  fetchTicker?: number; // ms
  initialRun?: boolean;
}

export default function useInvoke<R = any>(channel: TInvokeChannel, onInitialChange: (data: R) => void = () => {}, option?: Option) {
  const [data, setData] = useState<R>();
  const initialCalled = useRef(false);
  const ticker = useRef<number>();
  const [isFetching, setIsFetching] = useState(false);

  /* 단 한번만 실행됨 (이후부터는 수동으로) */
  useEffect(() => {
    if (!option?.initialRun || initialCalled.current) return;
    _invoke().then((res) => {
      setData(res);
      onInitialChange(res);
      initialCalled.current = true;
    });
  }, [channel, option?.initialRun]);

  useEffect(() => {
    if (option?.fetchTicker) {
      ticker.current = window.setInterval(() => {
        reFetch();
      }, option.fetchTicker);
    }
    return () => {
      if (ticker.current) {
        clearInterval(ticker.current);
      }
    };
  }, [channel, option?.fetchTicker]);

  const reFetch = () => {
    _invoke().then((res) => {
      setData(res);
    });
  };

  const _invoke = async <Args = any>(args?: Args) => {
    setIsFetching(true);
    const res = await window.app.invoke<R>(channel, args);
    setIsFetching(false);
    return res;
  };

  return {
    data,
    invoke: _invoke,
    reFetch,
    isFetching
  };
}
