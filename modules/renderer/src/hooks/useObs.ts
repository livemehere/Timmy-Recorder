import useInvoke from '@renderer/src/hooks/useInvoke';
import type { MonitorInfo, MonitorScene, SceneOption, WindowInfo, WindowScene } from '@shared/shared-type';
import { VIDEO_BIT_RATES } from '@shared/shared-const';
import type { SettingsData } from '@main/Settings';
import { useMemo } from 'react';
import { IPerformanceState } from '@shared/shared-type';
import { useGlobalAtom } from '@renderer/src/store/globalAtom';

type InitialRun = {
  monitorList?: boolean;
  windowList?: boolean;
  performance?: boolean;
  currentSettings?: boolean;
  formats?: boolean;
  fpsValues?: boolean;
  bitRateValues?: boolean;
};

interface Option {
  initialRun?: boolean | InitialRun;
  interval?: {
    windowList?: boolean;
    performance?: boolean;
  };
}

export default function useObs(option?: Option) {
  const {
    state: { isRecording },
    setIsRecording
  } = useGlobalAtom();
  const { data: currenSettings, reFetch: reFetchSetting } = useInvoke<SettingsData['obs']>('osn:getSettings', {
    initialRun: option?.initialRun === true || (typeof option?.initialRun === 'object' && option.initialRun.currentSettings)
  });

  const { data: monitorList } = useInvoke<MonitorInfo[]>('osn:getMonitorList', {
    initialRun: option?.initialRun === true || (typeof option?.initialRun === 'object' && option.initialRun.monitorList)
  });

  const { data: windowList, isFetching: windowIsFetching } = useInvoke<WindowInfo[]>('osn:getWindowList', {
    initialRun: option?.initialRun === true || (typeof option?.initialRun === 'object' && option.initialRun.windowList),
    fetchTicker: option?.interval?.windowList ? 1000 : undefined
  });

  const { data: performance } = useInvoke<IPerformanceState>('osn:getPerformance', {
    initialRun: option?.initialRun === true || (typeof option?.initialRun === 'object' && option.initialRun.performance),
    fetchTicker: option?.interval?.performance ? 1000 : undefined
  });

  const { data: formats } = useInvoke<string[]>('osn:formatValues', {
    initialRun: option?.initialRun === true || (typeof option?.initialRun === 'object' && option.initialRun.formats)
  });

  const { data: fpsValues } = useInvoke<number[]>('osn:getFpsValues', {
    initialRun: option?.initialRun === true || (typeof option?.initialRun === 'object' && option.initialRun.fpsValues)
  });

  const { data: bitRateValues } = useInvoke<typeof VIDEO_BIT_RATES>('osn:getBitrateValues', {
    initialRun: option?.initialRun === true || (typeof option?.initialRun === 'object' && option.initialRun.bitRateValues)
  });

  const { invoke: invokeSetFormat } = useInvoke<undefined>('osn:setFormat', {
    onInvoke: () => {
      reFetchSetting();
    }
  });
  const { invoke: invokeSetFps } = useInvoke<undefined>('osn:setFps', {
    onInvoke: () => {
      reFetchSetting();
    }
  });
  const { invoke: invokeUpdateScene } = useInvoke<undefined>('osn:updateScene', {
    onInvoke: () => {
      reFetchSetting();
    }
  });

  const { invoke: invokeSetBitrate } = useInvoke<undefined>('osn:setBitrate', {
    onInvoke: () => {
      reFetchSetting();
    }
  });

  const selectedMonitor = useMemo(() => {
    if (!monitorList || !currenSettings || currenSettings.latestSceneOption.captureType !== 'monitor_capture') return undefined;
    return monitorList.find((monitor) => monitor.monitorIndex === (currenSettings.latestSceneOption as MonitorScene).monitorInfo.monitorIndex);
  }, [currenSettings, monitorList]);

  const selectedWindow = useMemo(() => {
    if (!windowList || !currenSettings || currenSettings.latestSceneOption.captureType !== 'window_capture') return undefined;
    return windowList.find((window) => window.name === (currenSettings.latestSceneOption as WindowScene).windowInfo.name);
  }, [currenSettings, windowList]);

  const selectedFormat = useMemo(() => {
    if (!formats || !currenSettings) return undefined;
    return formats.find((format) => format === currenSettings.videoFormat);
  }, [currenSettings, formats]);

  const selectedFPS = useMemo(() => {
    if (!fpsValues || !currenSettings) return undefined;
    return fpsValues.find((fps) => fps === currenSettings.videoFps);
  }, [currenSettings, fpsValues]);

  const selectedBitRate = useMemo(() => {
    if (!bitRateValues || !currenSettings) return undefined;
    return bitRateValues.find((bitRate) => bitRate.value === currenSettings.videoBitRate.value);
  }, [currenSettings, bitRateValues]);

  const start = (scene?: SceneOption) => {
    if (isRecording) {
      throw new Error('Already recording');
    }
    if (scene) {
      invokeUpdateScene(scene).then(() => {
        setTimeout(() => {
          start();
          setIsRecording(true);
        }, 500);
      });
    } else {
      window.app.invoke('osn:start');
      setIsRecording(true);
    }
  };

  const stop = () => {
    if (!isRecording) {
      throw new Error('Not recording');
    }
    window.app.invoke('osn:stop');
    setIsRecording(false);
  };

  return {
    isRecording,
    start,
    stop,
    performance,
    currenSettings,
    reFetchSetting,
    monitorList,
    windowList,
    windowIsFetching,
    formats,
    fpsValues,
    bitRateValues,
    selectedMonitor,
    selectedWindow,
    selectedFormat,
    selectedFPS,
    selectedBitRate,
    invokeSetFormat,
    invokeSetFps,
    invokeUpdateScene,
    invokeSetBitrate
  };
}
