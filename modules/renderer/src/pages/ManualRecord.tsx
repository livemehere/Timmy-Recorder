import Recorder from '@renderer/src/components/Recorder';

type Props = {};

export default function ManualRecord({}: Props) {
  return (
    <div>
      <h1>수동 녹화</h1>
      <Recorder />
    </div>
  );
}
