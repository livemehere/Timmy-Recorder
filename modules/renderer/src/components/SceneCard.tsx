import { Badge, Button, Card, CardFooter, Skeleton } from '@nextui-org/react';

export type SceneCardProps = {
  thumbnail?: string;
  label: string;
  buttonLabel: string;
  onClickBtn: () => void;
  active?: boolean;
};

export default function SceneCard({ thumbnail, label, buttonLabel, onClickBtn, active }: SceneCardProps) {
  return (
    <Badge content={<div>녹화중</div>} color="danger" placement="top-right" isInvisible={!active}>
      <Card isFooterBlurred radius="lg" className="h-[168.75px] w-[300px] rounded-md">
        <Skeleton isLoaded={!!thumbnail} className="h-full">
          <img alt={label} className="" src={thumbnail} />
        </Skeleton>
        <CardFooter className="absolute bottom-1 z-10 ml-1 w-[calc(100%_-_8px)] justify-between overflow-hidden rounded-large border-1 border-white/20 py-1 shadow-small before:rounded-xl before:bg-white/10">
          <p className="text-tiny text-white/80">{label}</p>
          <Button className="bg-black/20 text-tiny text-white" variant="flat" color="default" radius="lg" size="sm" onClick={onClickBtn}>
            {buttonLabel}
          </Button>
        </CardFooter>
      </Card>
    </Badge>
  );
}
