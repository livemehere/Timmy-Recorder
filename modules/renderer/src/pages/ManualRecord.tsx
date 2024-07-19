import Recorder from '@renderer/src/components/Recorder';
import Title from '@renderer/src/components/ui/Title';
import Container from '../components/ui/Container';
import useObs from '@renderer/src/hooks/useObs';
import Monitor from '@renderer/src/components/Monitor';

type Props = {};

export default function ManualRecord({}: Props) {
  const { monitorList, selectedMonitor } = useObs({});

  return (
    <Container>
      <Title>수동 녹화</Title>
      <Title.Sub>화면 목록</Title.Sub>
      <div className="flex gap-3">{monitorList?.map((m) => <Monitor key={m.id} data={m} />)}</div>
      <Recorder />
    </Container>
  );
}
