import { useState } from 'react';
import useInvoke from '@renderer/src/hooks/useInvoke';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { MonitorInfo, WindowInfo } from '@shared/shared-type';
import { VIDEO_BIT_RATES } from '@shared/shared-const';

type Props = {};

export default function Recorder({}: Props) {
  const [selectedMonitor, setSelectedMonitor] = useState<MonitorInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedFPS, setSelectedFPS] = useState<number | null>(null);
  const [selectedBitRate, setSelectedBitRate] = useState<(typeof VIDEO_BIT_RATES)[number] | null>(null);
  const [selectedWindow, setSelectedWindow] = useState<WindowInfo | null>(null);
  const { data: formats } = useInvoke<string[]>('osn:formatValues', true, (formats) => {
    setSelectedFormat(formats[0]);
  });
  const { data: fpsValues } = useInvoke<number[]>('osn:getFpsValues', true, (fpsValues) => {
    setSelectedFPS(fpsValues[0]);
  });
  const { data: monitorList } = useInvoke<MonitorInfo[]>('osn:getMonitorList', true, (monitors) => {
    setSelectedMonitor(monitors[0]);
  });

  const { data: bitRateValues } = useInvoke<typeof VIDEO_BIT_RATES>('osn:getBitrateValues', true, (bitRateValues) => {
    setSelectedBitRate(bitRateValues[0]);
  });

  const { data: windowList } = useInvoke<WindowInfo[]>('osn:getWindowList', true, (windowList) => {
    setSelectedWindow(windowList[0]);
  });

  const { invoke: invokeSetFormat } = useInvoke<undefined>('osn:setFormat');
  const { invoke: invokeSetFps } = useInvoke<undefined>('osn:setFps');
  const { invoke: invokeUpdateScene } = useInvoke<undefined>('osn:updateScene');
  const { invoke: invokeSetBitrate } = useInvoke<undefined>('osn:setBitrate');

  const start = () => {
    window.app.invoke('osn:start');
  };

  const stop = () => {
    window.app.invoke('osn:stop');
  };

  return (
    <div className={'flex flex-col items-center'}>
      <div>Recorder</div>
      <section className={'m-auto mb-2 inline-flex justify-center gap-1 rounded-full bg-neutral-950 p-1'}>
        <button className={'rounded-full px-2 py-1 text-sm hover:bg-neutral-800'} onClick={start}>
          녹화 시작
        </button>
        <button className={'rounded-full px-2 py-1 text-sm hover:bg-neutral-800'} onClick={stop}>
          녹화 중지
        </button>
      </section>
      <section className={'flex gap-6'}>
        <Listbox
          value={selectedFormat}
          onChange={(value) => {
            setSelectedFormat(value);
            invokeSetFormat(value);
          }}>
          <div className={'flex flex-col gap-2'}>
            <ListboxButton>{selectedFormat}</ListboxButton>
            <ListboxOptions>
              {formats?.map((format) => (
                <ListboxOption key={format} value={format} className={'cursor-pointer'}>
                  {format}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
        <Listbox
          value={selectedFPS}
          onChange={(value) => {
            setSelectedFPS(value);
            invokeSetFps(value);
          }}>
          <div className={'flex flex-col gap-2'}>
            <ListboxButton>{selectedFPS}</ListboxButton>
            <ListboxOptions>
              {fpsValues?.map((fps) => (
                <ListboxOption key={fps} value={fps} className={'cursor-pointer'}>
                  {fps}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
        <Listbox
          value={selectedBitRate}
          onChange={(value) => {
            setSelectedBitRate(value);
            invokeSetBitrate(value);
          }}>
          <div className={'flex flex-col gap-2'}>
            <ListboxButton>{selectedBitRate?.label}</ListboxButton>
            <ListboxOptions>
              {bitRateValues?.map((bitRate) => (
                <ListboxOption key={bitRate.value} value={bitRate} className={'cursor-pointer'}>
                  {bitRate.label}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
        <Listbox
          value={selectedMonitor}
          onChange={(value) => {
            setSelectedMonitor(value);
            invokeUpdateScene({ captureType: 'monitor_capture', monitorInfo: value });
          }}>
          <div className={'flex flex-col gap-2'}>
            <ListboxButton>{selectedMonitor?.label}</ListboxButton>
            <ListboxOptions>
              {monitorList?.map((monitor) => (
                <ListboxOption key={monitor.monitorIndex} value={monitor} className={'cursor-pointer'}>
                  {monitor.label}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
        <Listbox
          value={selectedWindow}
          onChange={(value) => {
            setSelectedWindow(value);
            invokeUpdateScene({ captureType: 'window_capture', windowInfo: value });
          }}>
          <div className={'flex flex-col gap-2'}>
            <ListboxButton>{selectedWindow?.name}</ListboxButton>
            <ListboxOptions>
              {windowList?.map((window) => (
                <ListboxOption key={window.value} value={window} className={'cursor-pointer'}>
                  {window.name}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </section>
    </div>
  );
}
