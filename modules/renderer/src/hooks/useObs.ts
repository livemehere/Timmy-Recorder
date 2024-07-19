import useInvoke from '@renderer/src/hooks/useInvoke';
import type { MonitorInfo, MonitorScene, SceneOption, WindowInfo, WindowScene } from '@shared/shared-type';
import { VIDEO_BIT_RATES } from '@shared/shared-const';
import type { SettingsData } from '@main/Settings';
import { useMemo } from 'react';
import { IPerformanceState } from '@shared/shared-type';
import { useGlobalAtom } from '@renderer/src/store/globalAtom';

interface Option {
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
    initialRun: true
  });

  const { data: monitorList } = useInvoke<MonitorInfo[]>('osn:getMonitorList', {
    initialRun: true
  });

  const { data: windowList, isFetching: windowIsFetching } = useInvoke<WindowInfo[]>('osn:getWindowList', {
    initialRun: true,
    fetchTicker: option?.interval?.windowList ? 1000 : undefined
  });

  const { data: performance } = useInvoke<IPerformanceState>('osn:getPerformance', {
    initialRun: true,
    fetchTicker: option?.interval?.performance ? 1000 : undefined
  });

  const { data: formats } = useInvoke<string[]>('osn:formatValues', {
    initialRun: true
  });

  const { data: fpsValues } = useInvoke<number[]>('osn:getFpsValues', {
    initialRun: true
  });

  const { data: bitRateValues } = useInvoke<typeof VIDEO_BIT_RATES>('osn:getBitrateValues', {
    initialRun: true
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
