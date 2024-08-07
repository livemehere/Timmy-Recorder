import { LuImport } from 'react-icons/lu';
import { OpenDialogSyncOptions } from 'electron';
import { useEditorAtom } from '@renderer/src/store/editorAtom';
import { videoEditorManager } from '@renderer/src/videoEditorModule/videoEditorManager';
import { convertToMediaPath } from '@shared/path';

export default function Resources() {
  const {
    state: { resources, layers }
  } = useEditorAtom();
  const handleImportResource = async () => {
    const [path] = await window.app.invoke<string[], OpenDialogSyncOptions>('dialog:open', {
      title: '비디오 선택',
      properties: ['openFile'],
      filters: [{ name: '비디오 파일', extensions: ['mp4'] }]
    });
    videoEditorManager.addVideoResource(path);
  };

  return (
    <div className="w-full p-2">
      <h2 className="mb-2 flex items-center gap-2">
        <span>리소스</span>
        <button className="hover:opacity-80" onClick={handleImportResource}>
          <LuImport />
        </button>
      </h2>
      <ul className="flex flex-col gap-1">
        {resources.map((r) => (
          <li key={r.id} className="cursor-pointer bg-neutral-900 p-2 text-sm hover:bg-neutral-800" onClick={() => videoEditorManager.addResourceToLayer(layers[0].id, r.id)}>
            <img src={convertToMediaPath(r.frames[0])} alt="" />
            {r.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
