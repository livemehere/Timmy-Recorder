import { Badge, Button, Card, CardFooter, Skeleton } from '@nextui-org/react';
import { HTMLAttributes } from 'react';

export type SceneCardProps = {
  thumbnail?: string;
  label: string;
  buttonLabel: string;
  onClickBtn: () => void;
  active?: boolean;
  activeLabel?: React.ReactNode;
} & HTMLAttributes<HTMLSpanElement>;

export default function SceneCard({ thumbnail, label, buttonLabel, onClickBtn, active, activeLabel, ...props }: SceneCardProps) {
  return (
    <Badge {...props} content={activeLabel ?? <div>녹화중</div>} color="danger" placement="top-right" isInvisible={!active}>
      <Card isFooterBlurred radius="lg" className="aspect-[16/9] w-[280px] rounded-md">
        <Skeleton isLoaded={!!thumbnail} className="h-full">
          <img alt={label} className="" src={thumbnail} />
        </Skeleton>
        <CardFooter className="absolute bottom-1 z-10 ml-1 w-[calc(100%_-_8px)] justify-between overflow-hidden rounded-large border-1 border-white/20 py-1 shadow-small before:rounded-xl before:bg-white/10">
          <p className="text-tiny text-white/80">{label}</p>
          <Button className="bg-red-500/80 text-tiny text-white" variant="flat" color="default" radius="lg" size="sm" onClick={onClickBtn}>
            {buttonLabel}
          </Button>
        </CardFooter>
      </Card>
    </Badge>
  );
}
