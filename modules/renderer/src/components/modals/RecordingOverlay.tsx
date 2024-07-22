import { ModalProps } from 'async-modal-react/dist/types/modal';
import useObs from '@renderer/src/hooks/useObs';
import { Button } from '@nextui-org/react';
import { AutoRecordAbleWindow } from '@renderer/src/utils/autoRecord';

export interface ExampleProps extends ModalProps {
  currentAutoRecordWindow?: AutoRecordAbleWindow;
  cancelAutoRecording: () => void;
}

/** Layout 컴포넌트에서 촬영중이 아니면 모달을 모두 지우기 때문에 굳이 resolve 하지 않아도 됨. */
const RecordingOverlay = ({ currentAutoRecordWindow, cancelAutoRecording }: ExampleProps) => {
  const { stop, isRecording } = useObs();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 mb-4 h-10 w-10 animate-ping rounded-full bg-red-500"></div>
        <div className="mb-4 h-10 w-10 rounded-full bg-red-500"></div>
      </div>
      <h2>{isRecording ? '녹화중입니다' : currentAutoRecordWindow ? `${currentAutoRecordWindow.label}을 찾고있습니다...` : ''}</h2>
      {isRecording ? (
        <Button
          className="mt-4"
          color="danger"
          variant="shadow"
          onClick={() => {
            cancelAutoRecording();
            stop();
          }}>
          {currentAutoRecordWindow ? '자동감지 종료 및 저장' : '녹화 종료 및 저장'}
        </Button>
      ) : (
        <Button
          className="mt-4"
          color="danger"
          variant="shadow"
          onClick={() => {
            cancelAutoRecording();
          }}>
          자동 감지 취소
        </Button>
      )}
    </div>
  );
};

export default RecordingOverlay;
