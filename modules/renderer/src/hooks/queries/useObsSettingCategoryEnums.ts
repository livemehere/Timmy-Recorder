import { useQuery } from '@tanstack/react-query';
import { TSettingCategoryEnumKey } from '@main/utils/osn/obs_enums';

export const OBS_SETTING_CATEGORY_ENUMS_QUERY_KEY = ['obs-settings-categories'];
/**
 * @description OBS 에서 설정 가능한 카테고리 Enum 목록을 반환.
 * */
export default function useObsSettingCategoryEnums() {
  return useQuery<TSettingCategoryEnumKey[]>({
    queryKey: OBS_SETTING_CATEGORY_ENUMS_QUERY_KEY,
    queryFn: async () => {
      const categories = await window.app.invoke('osn:getSettingCategories');
      return categories;
    }
  });
}
