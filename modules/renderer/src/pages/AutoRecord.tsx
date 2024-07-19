import Recorder from '@renderer/src/components/Recorder';

type Props = {};

export default function AutoRecord({}: Props) {
  return (
    <div>
      <h1>자동 녹화</h1>
      <Recorder />
    </div>
  );
}
