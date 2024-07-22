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
      <h3>Tips.</h3>
      <ul>
        <li>윈도우 녹화시 화면이 내려가면 정상적으로 녹호되지 않을 수 있습니다.</li>
      </ul>
    </div>
  );
}
