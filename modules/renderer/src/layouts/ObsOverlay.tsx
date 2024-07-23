import { useGlobalAtom } from '@renderer/src/store/globalAtom';
import useObs from '@renderer/src/hooks/useObs';
import { Button } from '@nextui-org/react';

/**
 * @description OBS 시그널을 받아, 녹화 중이면 다른 동작을 제한하고, '녹화 중지' 만 가능하도록 오버레이를 띄웁니다. 만약 오류가 발생하면 오류 메시지를 띄웁니다.
 * */
export default function ObsOverlay() {
  const {
    state: { currentAutoRecordWindow },
    isRecording,
    obsError,
    setCurrentAutoRecordWindow
  } = useGlobalAtom();
  const { stop } = useObs();

  if (!isRecording) return null;

  const errorContent = () => {
    return (
      <div>
        <h2 className="text-2xl text-red-500">녹화중 에러가 발생했습니다</h2>
        <p>{obsError}</p>
      </div>
    );
  };

  const recordingContent = () => {
    return (
      <>
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
              setCurrentAutoRecordWindow(undefined);
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
              setCurrentAutoRecordWindow(undefined);
            }}>
            자동 감지 취소
          </Button>
        )}
      </>
    );
  };

  return <div className="fixed inset-0 z-20 flex flex-col items-center justify-center bg-black/80">{obsError ? errorContent() : recordingContent()}</div>;
}
