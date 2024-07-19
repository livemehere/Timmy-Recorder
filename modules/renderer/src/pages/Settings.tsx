import { Radio, RadioGroup } from '@nextui-org/react';
import Title from '@renderer/src/components/ui/Title';
import useObs from '@renderer/src/hooks/useObs';
import Container from '@renderer/src/components/ui/Container';

type Props = {};

export default function Settings({}: Props) {
  const { formats, invokeSetFormat, currenSettings } = useObs();
  return (
    <Container>
      <Title>설정</Title>
      <RadioGroup
        value={currenSettings?.videoFormat}
        label="동영상 포맷"
        orientation="horizontal"
        description="저장장될 파일의 확장자를 선택합니다."
        onChange={async (v) => {
          await invokeSetFormat(v.target.value);
        }}>
        {formats?.map((format) => (
          <Radio key={format} value={format} className="cursor-pointer">
            {format}
          </Radio>
        ))}
      </RadioGroup>
    </Container>
  );
}
