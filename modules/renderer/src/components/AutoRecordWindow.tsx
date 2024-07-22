import SceneCard, { SceneCardProps } from '@renderer/src/components/SceneCard';

type Props = {
  label: string;
  thumbnail: string;
  onClickBtn: () => void;
};

export default function AutoRecordWindow({ label, thumbnail, ...props }: Props & Omit<SceneCardProps, 'label' | 'buttonLabel'>) {
  return <SceneCard {...props} thumbnail={thumbnail} label={label} buttonLabel="자동 감지 시작" />;
}
