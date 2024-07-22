import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';

import useObs from '@renderer/src/hooks/useObs';

export default function Recorder() {
  const { isRecording, start, stop, monitorList, windowList, windowIsFetching, selectedMonitor, selectedWindow, invokeUpdateScene } = useObs({
    interval: {
      windowList: true
    }
  });

  const fcWindow = windowList?.find((win) => win.name.includes('FC') && win.name.includes('fczf'));
  // const autoRecord = async () => {
  //   if (fcWindow) {
  //     if (!isRecording) {
  //       await invokeUpdateScene({ captureType: 'window_capture', windowInfo: fcWindow });
  //       setTimeout(() => {
  //         start();
  //       }, 500);
  //     }
  //   } else {
  //     if (isRecording) {
  //       stop();
  //     }
  //   }
  // };
  //
  // useEffect(() => {
  //   autoRecord();
  // }, [fcWindow]);

  return (
    <div className="flex flex-col items-center">
      {fcWindow ? 'FC온라인 발견' : 'FC온라인 미발견'}
      <div>Recorder {isRecording ? '녹화 중' : '대기 중'}</div>
      <section className="m-auto mb-2 inline-flex justify-center gap-1 rounded-full bg-neutral-950 p-1">
        <button className="rounded-full px-2 py-1 text-sm hover:bg-neutral-800" onClick={() => start()}>
          녹화 시작
        </button>
        <button className="rounded-full px-2 py-1 text-sm hover:bg-neutral-800" onClick={stop}>
          녹화 중지
        </button>
      </section>
      <section className="flex gap-6">
        <Listbox
          value={selectedMonitor}
          onChange={(value) => {
            invokeUpdateScene({ captureType: 'monitor_capture', monitorInfo: value });
          }}>
          <div className="flex flex-col gap-2">
            <ListboxButton>{selectedMonitor?.label || '모니터를 선택하세요'}</ListboxButton>
            <ListboxOptions>
              {monitorList?.map((monitor) => (
                <ListboxOption key={monitor.monitorIndex} value={monitor} className="cursor-pointer">
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
          <div className="flex flex-col gap-2">
            <ListboxButton>
              {selectedWindow?.name || '윈도우를 선택하세요'} {windowIsFetching && '...'}
            </ListboxButton>
            <ListboxOptions>
              {windowList?.map((window) => (
                <ListboxOption key={window.value} value={window} className="cursor-pointer">
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
