import { ModalProps } from 'async-modal-react/dist/types/modal';
import useObs from '@renderer/src/hooks/useObs';

export interface ExampleProps extends ModalProps {}

/** Layout 컴포넌트에서 촬영중이 아니면 모달을 모두 지우기 때문에 굳이 resolve 하지 않아도 됨. */
const RecordingOverlay = ({}: ExampleProps) => {
  const { stop } = useObs();

  return (
    <div>
      <h2>녹화중입니다</h2>
      <button
        onClick={() => {
          stop();
        }}>
        저장하기
      </button>
    </div>
  );
};

export default RecordingOverlay;
