import { useQuery } from '@tanstack/react-query';
import { IPerformanceState } from '@shared/shared-type';

export const OBS_PERFORMANCE_QUERY_KEY = ['obs-performance'];
/**
 * @description OBS 성능 정보를 반환.
 * */
export default function useObsPerformance() {
  return useQuery({
    queryKey: OBS_PERFORMANCE_QUERY_KEY,
    queryFn: async () => {
      return window.app.invoke<IPerformanceState>('osn:getPerformance');
    },
    refetchInterval: 1000
  });
}
