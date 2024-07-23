import { useQuery } from '@tanstack/react-query';
import { MonitorInfo } from '@shared/shared-type';

export const MONITOR_LIST_QUERY_KEY = ['monitor-list'];
/**
 * @description OBS 캡처 가능한 모니터 목록을 반환.
 * */
export default function useMonitorList() {
  return useQuery({
    queryKey: MONITOR_LIST_QUERY_KEY,
    queryFn: () => {
      return window.app.invoke<MonitorInfo[]>('osn:getMonitorList');
    }
  });
}
