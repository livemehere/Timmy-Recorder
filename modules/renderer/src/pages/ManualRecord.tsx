import Title from '@renderer/src/components/ui/Title';
import Container from '../components/ui/Container';
import useObs from '@renderer/src/hooks/useObs';
import Monitor from '@renderer/src/components/Monitor';
import cn from '@renderer/src/utils/cn';
import Window from '@renderer/src/components/Window';

export default function ManualRecord() {
  const { monitorList, selectedMonitor, start, isRecording, windowList, selectedWindow } = useObs({
    initialRun: {
      monitorList: true,
      windowList: true
    },
    interval: {
      windowList: true
    }
  });

  return (
    <Container>
      <Title>수동 녹화</Title>
      <Title.Sub>화면 목록</Title.Sub>
      <div className="flex gap-2">
        {monitorList?.map((m) => (
          <Monitor
            className={cn('opacity-90')}
            key={m.id}
            data={m}
            active={isRecording && selectedMonitor?.id === m.id}
            onClickBtn={() => {
              start({
                captureType: 'monitor_capture',
                monitorInfo: m
              });
            }}
          />
        ))}
      </div>
      <Title.Sub>윈도우 목록</Title.Sub>
      <div className="flex flex-wrap gap-2">
        {windowList?.map((w) => (
          <Window
            key={w.value}
            data={w}
            active={isRecording && selectedWindow?.value === w.value}
            onClickBtn={() => {
              start({
                captureType: 'window_capture',
                windowInfo: w
              });
            }}
          />
        ))}
      </div>
    </Container>
  );
}
