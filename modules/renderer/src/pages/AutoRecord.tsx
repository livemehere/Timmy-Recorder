import Recorder from '@renderer/src/components/Recorder';
import Container from '../components/ui/Container';
import Title from '@renderer/src/components/ui/Title';
import AutoRecordWindow from '@renderer/src/components/AutoRecordWindow';
import useObs from '@renderer/src/hooks/useObs';
import { autoRecordAbleWindows } from '@renderer/src/utils/autoRecord';
import { useEffect } from 'react';
import { useGlobalAtom } from '@renderer/src/store/globalAtom';

export default function AutoRecord() {
  const {
    state: { currentAutoRecordWindow },
    setCurrentAutoRecordWindow
  } = useGlobalAtom();
  const { start, stop, windowList, isRecording, invokeUpdateScene } = useObs({
    initialRun: {
      windowList: true
    },
    interval: {
      windowList: true
    }
  });

  const targetWindow = windowList?.find((win) => currentAutoRecordWindow?.matcher(win));
  const autoRecord = async () => {
    if (targetWindow) {
      if (!isRecording) {
        await invokeUpdateScene({ captureType: 'window_capture', windowInfo: targetWindow });
        setTimeout(() => {
          start();
        }, 500);
      }
    } else {
      if (isRecording) {
        stop();
      }
    }
  };

  useEffect(() => {
    autoRecord();
  }, [targetWindow]);

  return (
    <Container>
      <Title>자동 녹화</Title>
      <Title.Sub>자동녹화 지원 목록</Title.Sub>
      <div className="flex gap-2">
        {autoRecordAbleWindows.map((win) => (
          <AutoRecordWindow
            key={win.label}
            label={win.label}
            active={currentAutoRecordWindow?.label === win.label}
            activeLabel={<div>{targetWindow ? '찾았습니다!' : '감지 중'}</div>}
            onClickBtn={() => {
              setCurrentAutoRecordWindow(win);
            }}
            thumbnail={win.thumbnail}
          />
        ))}
      </div>
      <Recorder />
    </Container>
  );
}
