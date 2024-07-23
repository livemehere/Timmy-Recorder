import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TSettingCategoryEnumKey } from '@main/utils/osn/obs_enums';
import { CategorySetting } from '@main/utils/osn/obs_types';

export const OBS_SETTINGS_SUB_CATEGORY_QUERY_KEY = ['obs-settings-sub-category'];
/**
 * @description 해당 카테고리의 하위 카테고리와 현재 값, 변경 가능한 값 목록 등 정보를 반환.
 * */
export default function useObsSettingSubCategory(categoryEnumKey: TSettingCategoryEnumKey) {
  return useQuery({
    queryKey: [...OBS_SETTINGS_SUB_CATEGORY_QUERY_KEY, categoryEnumKey],
    queryFn: async () => {
      return window.app.invoke<CategorySetting>('osn:getSubCategoryAndParams', categoryEnumKey).then((res) => res.data);
    }
  });
}

export function useInvalidateAllSubCategory() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === OBS_SETTINGS_SUB_CATEGORY_QUERY_KEY[0]
    });
  };

  return invalidate;
}
