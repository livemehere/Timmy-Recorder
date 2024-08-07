import { NotificationConstructorOptions, OpenDialogSyncOptions } from 'electron';
import { TVideoMetaData } from '@renderer/src/videoEditorModule/videoEditorManager';
import { RVideoMetaData } from '../../../../typings/preload';

/* OS 브라우저로 링크 열기 */
export function openExternal(url: string) {
  window.app.invoke('shell:openExternal', url);
}

/* 선택한 파일 경로를 반환 */
export function openFileSelector(options: OpenDialogSyncOptions) {
  return window.app.invoke<string[]>('dialog:open', options);
}

/* 휴지통으로 파일이동(삭제아님 주의) */
export function moveFilesToTrash(paths: string[]) {
  return window.app.invoke('shell:trashItem', paths);
}

/* 디렉토리 열기 */
export function openDir(path: string) {
  return window.app.invoke('shell:openDir', path);
}

/* 데스크탑 알림(Electron API) */
export function notificationMain(options: NotificationConstructorOptions) {
  return window.app.invoke('notification:show', options);
}

/* 데스크탑 알림(브라우저 API) */
export function notificationRenderer(title: string, body: string): Promise<void> {
  return new Promise((resolve) => {
    const notification = new Notification(title, { body });
    notification.onclick = () => {
      resolve();
    };
  });
}

export async function getVideoMetaData(path: string): Promise<TVideoMetaData | undefined> {
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
}
