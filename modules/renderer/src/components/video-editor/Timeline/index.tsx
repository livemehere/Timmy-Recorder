import { useEditorAtom, VideoResource } from '@renderer/src/store/editorAtom';
import { map } from '@renderer/src/utils/math';
import { useEffect, useRef, useState } from 'react';

type Props = {};

export default function Timeline({}: Props) {
  const {
    state: { layers, output, resources }
  } = useEditorAtom();

  const timer = useRef<number>(0);
  const curFrameDisplay = useRef<HTMLDivElement>(null);
  const [playSpeed, setPlaySpeed] = useState(1);
  const curFrame = useRef(0);
  const indicator = useRef<HTMLDivElement>(null);

  const setIndicator = (frame: number) => {
    if (indicator.current) {
      const width = map(frame, 0, output.totalFrames, 0, 100);
      indicator.current.style.left = `${width}%`;
      curFrameDisplay.current!.innerText = frame.toFixed(0);
    }
  };

  const play = () => {
    if (curFrame.current >= output.totalFrames) {
      curFrame.current = output.totalFrames;
      setIndicator(curFrame.current);
      return;
    }
    curFrame.current += playSpeed;
    setIndicator(curFrame.current);
    timer.current = requestAnimationFrame(play);
  };

  const pause = () => {
    cancelAnimationFrame(timer.current);
  };

  useEffect(() => {
    play();
    return () => {
      cancelAnimationFrame(timer.current);
    };
  }, []);

  return (
    <>
      <div ref={indicator} className="absolute left-0 top-0 h-full w-[2px] cursor-col-resize bg-red-500" style={{ left: '0%' }}></div>
      <div
        className="mb-2 flex justify-between bg-neutral-700 px-2"
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const frame = map(e.clientX - rect.left, 0, rect.width, 0, output.totalFrames);
          curFrame.current = frame;
          setIndicator(frame);
        }}>
        <span>0fps</span>
        <span ref={curFrameDisplay}></span>
        <span>{output.totalFrames}fps</span>
      </div>
      <ul className="h-full overflow-scroll">
        {layers.map((l) => {
          return (
            <li key={l.id} className="h-[30px] bg-neutral-800">
              {l.layerResources.map((lr) => {
                const origin = resources.find((r) => r.id === lr.resourceId) as VideoResource;
                const width = map(origin.totalFrames, 0, output.totalFrames, 0, 100);
                return (
                  <div key={lr.resourceId} className="h-full bg-blue-500" style={{ width: `${width}%` }}>
                    {origin.totalFrames}fps {width.toFixed(1)}%
                  </div>
                );
              })}
            </li>
          );
        })}
      </ul>
    </>
  );
}
