import { TSettingCategoryEnumKey } from '@main/utils/osn/obs_enums';
import useInvoke from '@renderer/src/hooks/useInvoke';
import { CategorySetting } from '@main/utils/osn/obs_types';
import { createContext, useState } from 'react';
import { Listbox, ListboxItem, Switch, Tab, Tabs } from '@nextui-org/react';
import { SetSettingArgs } from '../../../../../typings/preload';
import useObsSettingSubCategory, { useInvalidateAllSubCategory } from '@renderer/src/hooks/queries/useObsSettingSubCategory';

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
  const { data: categoryOptions } = useObsSettingSubCategory(categoryEnumKey);
  const [openSubCategory, setOpenSubCategory] = useState<string>();
  return (
    <CategoryContext.Provider value={{ openSubCategory, setOpenSubCategory }}>
      <div>
        <div>서브 카테고리</div>
        <Tabs>
          {categoryOptions?.map((sub, i) => (
            <Tab key={sub.nameSubCategory} title={sub.nameSubCategory}>
              <SubCategory key={i} subCategory={sub} categoryEnumKey={categoryEnumKey} />
            </Tab>
          ))}
        </Tabs>
      </div>
    </CategoryContext.Provider>
  );
}

function SubCategory({ subCategory, categoryEnumKey }: { subCategory: CategorySetting['data'][0]; categoryEnumKey: TSettingCategoryEnumKey }) {
  return (
    <div className="flex flex-col gap-20">
      <div className="flex flex-wrap gap-8">
        {subCategory.parameters.map((param, i) => (
          <div key={i}>
            <Param param={param} categoryEnumKey={categoryEnumKey} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Param({ param, categoryEnumKey }: { param: CategorySetting['data'][0]['parameters'][0]; categoryEnumKey: TSettingCategoryEnumKey }) {
  const [directInput, setDirectInput] = useState('');
  const invalidate = useInvalidateAllSubCategory();
  const { invoke } = useInvoke<void, SetSettingArgs>('osn:setSetting', {
    initialRun: false,
    onInvoke: () => {
      invalidate();
      console.log(`invoke setSetting : ${categoryEnumKey} ${param.name}`);
    }
  });
  const paramValues = param.values.map((p) => Object.values(p)[0]);

  /* 현재 값 */
  const selectedParam = new Set([param.currentValue as string]);
  const boolValue = param.currentValue as boolean;
  const isBooleanValue = param.type === 'OBS_PROPERTY_BOOL';
  const currentValueString = typeof param.currentValue === 'boolean' ? (param.currentValue ? 'True' : 'False') : param.currentValue;

  return (
    <div className="my-2">
      <div>파라미터 : {param.name}</div>
      <div className="mb-4 text-xs opacity-80">{param.description}</div>
      <div className="text-sm">
        <span className="mr-2">수동입력</span>
        <input type="text" value={directInput} onChange={(e) => setDirectInput(e.target.value)} />
        <button
          className="ml-2 border-1 px-2 py-0.5 hover:bg-neutral-50/20"
          onClick={() => {
            invoke<SetSettingArgs>({
              categoryEnumKey: categoryEnumKey,
              parameter: param.name,
              value: directInput === 'true' ? true : directInput === 'false' ? false : directInput
            });
          }}>
          SET
        </button>
      </div>
      <div className="mb-3 text-sm text-blue-500">현제 값 : {currentValueString}</div>
      {isBooleanValue ? (
        <div>
          <Switch
            size="sm"
            isSelected={boolValue}
            onValueChange={(v) => {
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
