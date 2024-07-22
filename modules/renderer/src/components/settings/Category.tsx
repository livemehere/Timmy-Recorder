import { TSettingCategoryEnumKey } from '@main/utils/osn/obs_enums';
import useInvoke from '@renderer/src/hooks/useInvoke';
import { CategorySetting } from '@main/utils/osn/obs_types';
import { createContext, useContext, useState } from 'react';
import { Selection } from '@react-types/shared/src/selection';
import { Listbox, ListboxItem, Switch } from '@nextui-org/react';
import { SetSettingArgs } from '../../../../../typings/preload';
import cn from '@renderer/src/utils/cn';

type Props = {
  categoryEnumKey: TSettingCategoryEnumKey;
};

interface CategoryContextType {
  openSubCategory: string | undefined;
  setOpenSubCategory: React.Dispatch<string | undefined>;
}
const CategoryContext = createContext<CategoryContextType>({
  openSubCategory: undefined,
  setOpenSubCategory: () => {}
});

export default function Category({ categoryEnumKey }: Props) {
  const { data } = useInvoke<CategorySetting>('osn:getSubCategoryAndParams', {
    args: categoryEnumKey,
    initialRun: true
  });

  const categoryOptions = data?.data;
  const [openSubCategory, setOpenSubCategory] = useState<string>();
  return (
    <CategoryContext.Provider value={{ openSubCategory, setOpenSubCategory }}>
      <div>
        <div>서브 카테고리</div>
        <div>{categoryOptions?.map((sub, i) => <SubCategory key={i} subCategory={sub} categoryEnumKey={categoryEnumKey} />)}</div>
      </div>
    </CategoryContext.Provider>
  );
}

function SubCategory({ subCategory, categoryEnumKey }: { subCategory: CategorySetting['data'][0]; categoryEnumKey: TSettingCategoryEnumKey }) {
  const { setOpenSubCategory, openSubCategory } = useContext(CategoryContext);
  const isSelected = openSubCategory === subCategory.nameSubCategory;
  return (
    <div className="flex gap-20">
      <div
        className={cn('cursor-pointer ', { 'text-blue-500': isSelected })}
        onClick={() => {
          if (isSelected) {
            setOpenSubCategory(undefined);
          } else {
            setOpenSubCategory(subCategory.nameSubCategory);
          }
        }}>
        {subCategory.nameSubCategory}
      </div>
      {isSelected && (
        <div className="">
          {subCategory.parameters.map((param, i) => (
            <div key={i}>
              <Param param={param} categoryEnumKey={categoryEnumKey} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Param({ param, categoryEnumKey }: { param: CategorySetting['data'][0]['parameters'][0]; categoryEnumKey: TSettingCategoryEnumKey }) {
  /** boolean 값이 아닐경우에만 사용됨. */
  const [selectedParam, setSelectedParam] = useState<Selection>(new Set([param.currentValue as string]));
  const [boolValue, setBoolValue] = useState<boolean>(param.currentValue as boolean);
  const paramValues = param.values.map((p) => Object.values(p)[0]);
  const { invoke } = useInvoke<void, SetSettingArgs>('osn:setSetting', {
    initialRun: false,
    onInvoke: () => {
      console.log(`invoke setSetting : ${categoryEnumKey} ${param.name}`);
    }
  });
  /** 타입이 불리언인 경우 처리하기 */
  const isBooleanValue = param.type === 'OBS_PROPERTY_BOOL';

  return (
    <div className="my-2">
      <div>파라미터 : {param.name}</div>
      <div className="text-xs opacity-80">{param.description}</div>
      {isBooleanValue ? (
        <div>
          <Switch
            size="sm"
            isSelected={boolValue}
            onValueChange={(v) => {
              setBoolValue(v);
              invoke<SetSettingArgs>({
                categoryEnumKey: categoryEnumKey,
                parameter: param.name,
                value: v
              });
            }}>
            {boolValue ? 'ON' : 'OFF'}
          </Switch>
        </div>
      ) : (
        <Listbox
          className="rounded bg-neutral-800 p-2"
          aria-label="Multiple selection example"
          variant="flat"
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={selectedParam}
          onSelectionChange={(keys) => {
            setSelectedParam(keys);
            const selectedValue = Array.from(keys).join(', ');
            invoke<SetSettingArgs>({
              categoryEnumKey: categoryEnumKey,
              parameter: param.name,
              value: selectedValue
            });
          }}>
          {paramValues.map((value) => (
            <ListboxItem key={value}>{value}</ListboxItem>
          ))}
        </Listbox>
      )}
    </div>
  );
}
