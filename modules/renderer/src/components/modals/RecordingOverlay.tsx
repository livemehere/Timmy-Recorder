import { ModalProps } from 'async-modal-react/dist/types/modal';
import useObs from '@renderer/src/hooks/useObs';
import { Button } from '@nextui-org/react';

export interface ExampleProps extends ModalProps {}

/** Layout 컴포넌트에서 촬영중이 아니면 모달을 모두 지우기 때문에 굳이 resolve 하지 않아도 됨. */
const RecordingOverlay = ({}: ExampleProps) => {
  const { stop } = useObs();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 mb-4 h-10 w-10 animate-ping rounded-full bg-red-500"></div>
        <div className="mb-4 h-10 w-10 rounded-full bg-red-500"></div>
      </div>
      <h2>녹화중입니다</h2>
      <Button
        className="mt-4"
        color="primary"
        variant="shadow"
        onClick={() => {
          stop();
        }}>
        녹화 종료 및 저장
      </Button>
    </div>
  );
};

export default RecordingOverlay;
