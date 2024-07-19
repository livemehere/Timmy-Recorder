import { MonitorInfo } from '@shared/shared-type';
import { useEffect, useState } from 'react';
import { Button, Card, CardFooter, Skeleton } from '@nextui-org/react';

type Props = {
  data: MonitorInfo;
};

export default function Monitor({ data }: Props) {
  const [thumbnail, setThumbnail] = useState('');

  useEffect(() => {
    window.app.invoke('osn:getThumbnail', data.id).then((res) => {
      setThumbnail(res);
    });
  }, [data]);

  return (
    <Card isFooterBlurred radius="lg" className="h-[168.75px] w-[300px] rounded-md">
      <Skeleton isLoaded={!!thumbnail} className="h-full">
        <img alt={data.label} className="" src={thumbnail} />
      </Skeleton>
      <CardFooter className="absolute bottom-1 z-10 ml-1 w-[calc(100%_-_8px)] justify-between overflow-hidden rounded-large border-1 border-white/20 py-1 shadow-small before:rounded-xl before:bg-white/10">
        <p className="text-tiny text-white/80">
          [{data.monitorIndex + 1}] {data.label}
        </p>
        <Button className="bg-black/20 text-tiny text-white" variant="flat" color="default" radius="lg" size="sm">
          녹화하기
        </Button>
      </CardFooter>
    </Card>
  );
}
