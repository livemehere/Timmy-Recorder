import { useImperativeHandle, useRef } from 'react';

type Props = {
  /** @description 마우스로 값을 변경한 경우 */
  onForceChange: (v: number) => void;
  controls: React.Ref<any>;
};

export type TProgressControls = {
  seek: (ratio: number) => void;
};

export default function ProgressBar({ onForceChange, controls }: Props) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const state = useRef({
    isDown: false
  });

  const getRatio = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return x / rect.width;
  };

  useImperativeHandle<any, TProgressControls>(controls, () => ({
    seek: (ratio: number) => {
      progressBarRef.current!.style.width = `${ratio * 100}%`;
    }
  }));

  return (
    <div id="sequence-progress-bar">
      <div
        className="h-[10px] bg-neutral-400"
        onPointerDown={(e) => {
          state.current.isDown = true;
          onForceChange(getRatio(e));
        }}
        onPointerMove={(e) => {
          if (state.current.isDown) {
            onForceChange(getRatio(e));
          }
        }}
        onPointerUp={() => (state.current.isDown = false)}>
        <div ref={progressBarRef} className="h-full bg-red-500" style={{ width: 0 }}></div>
      </div>
    </div>
  );
}
