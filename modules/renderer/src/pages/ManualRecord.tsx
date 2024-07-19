import Recorder from '@renderer/src/components/Recorder';
import Title from '@renderer/src/components/ui/Title';

type Props = {};

export default function ManualRecord({}: Props) {
  return (
    <div>
      <Title>수동 녹화</Title>
      <Recorder />
    </div>
  );
}
