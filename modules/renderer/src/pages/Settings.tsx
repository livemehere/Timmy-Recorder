import { Radio, RadioGroup, Spacer } from '@nextui-org/react';
import Title from '@renderer/src/components/ui/Title';
import useObs from '@renderer/src/hooks/useObs';
import Container from '@renderer/src/components/ui/Container';
import Category from '@renderer/src/components/settings/Category';

type Props = {};

export default function Settings({}: Props) {
  const { settingCategories, formats, invokeSetFormat, currenSettings, selectedFPS, invokeSetFps, fpsValues, bitRateValues, selectedBitRate, invokeSetBitrate } = useObs({
    initialRun: {
      currentSettings: true,
      formats: true,
      fpsValues: true,
      bitRateValues: true,
      settingCategories: true
    }
  });
  console.log(settingCategories);
  return (
    <Container>
      <Title>설정</Title>
      <RadioGroup
        value={currenSettings?.videoFormat}
        label="동영상 포맷"
        orientation="horizontal"
        description="저장될 파일의 확장자를 선택합니다."
        onChange={async (v) => {
          await invokeSetFormat(v.target.value);
        }}>
        {formats?.map((format) => (
          <Radio key={format} value={format} className="cursor-pointer">
            {format}
          </Radio>
        ))}
      </RadioGroup>
      <Spacer y={8} />
      <RadioGroup
        value={selectedFPS?.toString()}
        label="FPS"
        orientation="horizontal"
        description="평균 프레임을 선택합니다."
        onChange={async (v) => {
          await invokeSetFps(+v.target.value);
        }}>
        {fpsValues?.map((fps) => (
          <Radio key={fps} value={fps.toString()} className="cursor-pointer">
            {fps}
          </Radio>
        ))}
      </RadioGroup>
      <Spacer y={8} />
      <RadioGroup
        value={selectedBitRate?.value.toString()}
        label="비트레이트"
        orientation="vertical"
        description="동영상 품질을 선택합니다."
        onChange={async (v) => {
          const bitRate = bitRateValues?.find((bitRate) => bitRate.value === +v.target.value);
          await invokeSetBitrate(bitRate);
        }}>
        {bitRateValues?.map((bitRate) => (
          <Radio key={bitRate.value} value={bitRate.value.toString()} className="cursor-pointer">
            {bitRate.label}
          </Radio>
        ))}
      </RadioGroup>
      <Title.Sub>상세 설정</Title.Sub>
      {settingCategories?.map((category, i) => <Category key={i} categoryEnumKey={category} />)}
    </Container>
  );
}
