import { useQuery } from '@tanstack/react-query';
import { WindowInfo } from '@shared/shared-type';

export const WINDOW_LIST_QUERY_KEY = ['window-list'];
/**
 * @description OBS 캡처 가능한 윈도우 창 목록을 반환.
 * */
export default function useWindowList() {
  return useQuery({
    queryKey: WINDOW_LIST_QUERY_KEY,
    refetchInterval: 1000,
    queryFn: () => {
      return window.app.invoke<WindowInfo[]>('osn:getWindowList');
    }
  });
}
