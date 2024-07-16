import { ModalProps } from 'async-modal-react/dist/types/modal';

export interface ExampleProps extends ModalProps {}

const ExampleModal = ({ close, resolve, reject }: ExampleProps) => {
  return (
    <div>
      <h2>ExampleModal</h2>
      <button onClick={() => resolve(`resolve!`)}>RESOLVE</button>
      <button onClick={() => reject('reject T-T')}>REJECT</button>
      <button onClick={close}>Close</button>
    </div>
  );
};

export default ExampleModal;
