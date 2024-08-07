import { useEditorAtom } from '@renderer/src/store/editorAtom';
import { map } from '@renderer/src/utils/math';
import { useEffect, useRef } from 'react';
import { LayerResource, videoEditorManager } from '@renderer/src/videoEditorModule/videoEditorManager';
import useVideoEditorEvent from '@renderer/src/videoEditorModule/useVideoEditorEvent';

export default function Timeline() {
  const {
    state: { layers, output }
  } = useEditorAtom();

  const curFrameDisplay = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLDivElement>(null);
  useEffect(() => {
    videoEditorManager.timelineSelector = '#timeline';
  }, []);

  const setFrame = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!output) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const frame = map(e.clientX - rect.left, 0, rect.width, 0, output.totalFrames);
    videoEditorManager.seek(Math.floor(frame));
  };

  const extractVideoFrames = async (layerResource: LayerResource) => {
    // await window.app.invoke<string, Omit<ExtractFramesOptions, 'outDir'>>('video-editor:extractFrames', {
    //   inputPath: layerResource.originResource!.originPath,
    //   fps: layerResource.originResource!.metaData!.fps,
    //   resourceId: layerResource.resourceId
    // });
  };

  useVideoEditorEvent(
    'frameChange',
    (e) => {
      if (!output) return;
      const curFrame = e.detail.frame;
      if (indicator.current && curFrameDisplay.current) {
        const width = map(curFrame, 0, output.totalFrames, 0, 100);
        indicator.current.style.left = `${width}%`;
        curFrameDisplay.current.innerText = curFrame.toFixed(0);
      }
    },
    [Boolean(output)]
  );

  return (
    <>
      {/*<div ref={indicator} className="absolute left-0 top-0 h-full w-[2px] cursor-col-resize bg-red-500" style={{ left: '0%' }}></div>*/}
      {/*<div className="mb-2 flex justify-between bg-neutral-700 px-2" onPointerDown={setFrame}>*/}
      {/*  <span>0fps</span>*/}
      {/*  <span ref={curFrameDisplay}>0</span>*/}
      {/*  <span>{output?.totalFrames}fps</span>*/}
      {/*</div>*/}
      <div
        id="timeline"
        style={{
          width: '100%',
          height: 300
        }}></div>
    </>
  );
}
