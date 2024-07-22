import { WindowInfo } from '@shared/shared-type';
import { useEffect, useState } from 'react';
import SceneCard, { SceneCardProps } from '@renderer/src/components/SceneCard';

type Props = {
  data: WindowInfo;
  onClickBtn: () => void;
};

export default function Window({ data, ...props }: Props & Omit<SceneCardProps, 'label' | 'buttonLabel'>) {
  const [thumbnail, setThumbnail] = useState('');

  useEffect(() => {
    // window.app.invoke('osn:getThumbnail', data.id).then((res) => {
    //   setThumbnail(res);
    // });
  }, [data]);

  return <SceneCard {...props} thumbnail={thumbnail} label={data.name} buttonLabel="녹화하기" />;
}
