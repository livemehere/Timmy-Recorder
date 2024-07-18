import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';

import useObs from '@renderer/src/hooks/useObs';

type Props = {};

export default function Recorder({}: Props) {
  const {
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
  } = useObs();

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
            invokeUpdateScene({ captureType: 'monitor_capture', monitorInfo: value });
          }}>
          <div className={'flex flex-col gap-2'}>
            <ListboxButton>{selectedMonitor?.label || '모니터를 선택하세요'}</ListboxButton>
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
            invokeUpdateScene({ captureType: 'window_capture', windowInfo: value });
          }}>
          <div className={'flex flex-col gap-2'}>
            <ListboxButton>
              {selectedWindow?.name || '윈도우를 선택하세요'} {windowIsFetching && '...'}
            </ListboxButton>
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
      <section>
        <h3>Tips.</h3>
        <ul>
          <li>윈도우 녹화시 화면이 내려가면 정상적으로 녹호되지 않을 수 있습니다.</li>
        </ul>
      </section>
    </div>
  );
}
