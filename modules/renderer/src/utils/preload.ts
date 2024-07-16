import { NotificationConstructorOptions, OpenDialogSyncOptions } from 'electron';

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
