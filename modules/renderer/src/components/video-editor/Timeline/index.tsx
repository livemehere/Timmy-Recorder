import { useEditorAtom, VideoResource } from '@renderer/src/store/editorAtom';
import { map } from '@renderer/src/utils/math';

type Props = {};

export default function Timeline({}: Props) {
  const {
    state: { layers, output, resources }
  } = useEditorAtom();
  return (
    <>
      <div className="absolute left-0 top-0 h-full w-[2px] cursor-col-resize bg-red-500" style={{ left: '10%' }}></div>
      <div className="flex justify-between">
        <span>0fps</span>
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
