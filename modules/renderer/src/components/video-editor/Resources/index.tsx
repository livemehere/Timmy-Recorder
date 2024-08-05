import { LuImport } from 'react-icons/lu';
import { OpenDialogSyncOptions } from 'electron';
import { convertToMediaPath } from '@shared/path';
import { RVideoMetaData } from '../../../../../../typings/preload';
import { TVideoMetaData } from '@renderer/src/components/video-editor/VideoSource';
import { useEditorAtom, VideoResource } from '@renderer/src/store/editorAtom';
import { uid } from 'uid';

type Props = {};

export default function Resources({}: Props) {
  const {
    appendResource,
    state: { resources }
  } = useEditorAtom();
  const handleImportResource = async () => {
    const [path] = await window.app.invoke<string[], OpenDialogSyncOptions>('dialog:open', {
      title: '비디오 선택',
      properties: ['openFile'],
      filters: [{ name: '비디오 파일', extensions: ['mp4'] }]
    });
    const convertedPath = convertToMediaPath(path);
    const metaData = await getVideoMetaData(path);
    if (!metaData) {
      alert('비디오 메타데이터를 가져올 수 없습니다.');
      return;
    }

    const videoSource: VideoResource = {
      id: uid(8),
      path: convertedPath,
      originPath: path,
      type: 'video',
      name: path.split('\\').pop() ?? '',
      ...metaData
    };
    appendResource(videoSource);
  };

  const getVideoMetaData = async (path: string): Promise<TVideoMetaData | undefined> => {
    /** metadata 추출 */
    const metaData = await window.app.invoke<RVideoMetaData>('video-editor:getMetaData', path);
    const videoStream = metaData.streams.find((s) => s.codec_type === 'video');
    if (videoStream) {
      const totalFrames = Number(videoStream.nb_frames) ?? 0;
      const duration = Number(videoStream.duration) ?? 0;
      const avgFrameRate = videoStream.avg_frame_rate;
      const fps = avgFrameRate ? +avgFrameRate.split('/')[0] : 0;
      const { width, height, display_aspect_ratio, bit_rate } = videoStream;
      return {
        duration,
        totalFrames,
        fps,
        width: Number(width),
        height: Number(height),
        displayAspectRatio: display_aspect_ratio!,
        bitRate: Number(bit_rate)
      };
    }
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
          <li key={r.id} className="bg-neutral-900 p-2 text-sm">
            {r.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
