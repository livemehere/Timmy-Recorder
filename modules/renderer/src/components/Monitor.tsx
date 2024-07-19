import { MonitorInfo } from '@shared/shared-type';
import { useEffect, useState } from 'react';
import SceneCard, { SceneCardProps } from '@renderer/src/components/SceneCard';

type Props = {
  data: MonitorInfo;
  onClickBtn: () => void;
};

export default function Monitor({ data, ...props }: Props & Omit<SceneCardProps, 'label' | 'buttonLabel'>) {
  const [thumbnail, setThumbnail] = useState('');

  useEffect(() => {
    window.app.invoke('osn:getThumbnail', data.id).then((res) => {
      setThumbnail(res);
    });
  }, [data]);

  return <SceneCard {...props} thumbnail={thumbnail} label={data.label} buttonLabel="녹화하기" />;
}
