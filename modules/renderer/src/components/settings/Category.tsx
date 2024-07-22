import { TSettingCategoryEnumKey } from '@main/utils/osn/obs_enums';
import useInvoke from '@renderer/src/hooks/useInvoke';
import { CategorySetting } from '@main/utils/osn/obs_types';
import { useState } from 'react';
import { Selection } from '@react-types/shared/src/selection';
import { Listbox, ListboxItem } from '@nextui-org/react';
import { SetSettingArgs } from '../../../../../typings/preload';

type Props = {
  categoryEnumKey: TSettingCategoryEnumKey;
};

export default function Category({ categoryEnumKey }: Props) {
  const { data } = useInvoke<CategorySetting>('osn:getSubCategoryAndParams', {
    args: categoryEnumKey,
    initialRun: true
  });
  const categoryOptions = data?.data;
  return (
    <div>
      <h3>카테고리 : {categoryEnumKey}</h3>
      {categoryOptions?.map((sub, i) => <SubCategory key={i} subCategory={sub} categoryEnumKey={categoryEnumKey} />)}
    </div>
  );
}

function SubCategory({ subCategory, categoryEnumKey }: { subCategory: CategorySetting['data'][0]; categoryEnumKey: TSettingCategoryEnumKey }) {
  return (
    <div className="pl-4">
      <div>서브 카테고리 : {subCategory.nameSubCategory}</div>
      <div className="pl-4">
        {subCategory.parameters.map((param, i) => (
          <Param param={param} key={i} categoryEnumKey={categoryEnumKey} />
        ))}
      </div>
    </div>
  );
}

function Param({ param, categoryEnumKey }: { param: CategorySetting['data'][0]['parameters'][0]; categoryEnumKey: TSettingCategoryEnumKey }) {
  const [selectedParam, setSelectedParam] = useState<Selection>(new Set([param.currentValue]));
  const paramValues = param.values.map((p) => Object.values(p)[0]);
  const { invoke } = useInvoke<void, SetSettingArgs>('osn:setSetting', {
    initialRun: false,
    onInvoke: () => {
      console.log(`invoke setSetting : ${categoryEnumKey} ${param.name}`);
    }
  });
  /** 타입이 불리언인 경우 처리하기 */

  return (
    <div className="my-2">
      <div>파라미터 : {param.name}</div>
      <div className="text-xs opacity-80">{param.description}</div>
      <Listbox
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
    </div>
  );
}

/*
*
* <div key={sub.nameSubCategory} className="pl-4">
          <h4>{sub.nameSubCategory}</h4>
          <div>
            <Listbox
              aria-label="Multiple selection example"
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selectedParam}
              onSelectionChange={setSelectedParam}>
              <ListboxItem key="text">Text</ListboxItem>
              <ListboxItem key="number">Number</ListboxItem>
              <ListboxItem key="date">Date</ListboxItem>
              <ListboxItem key="single_date">Single Date</ListboxItem>
              <ListboxItem key="iteration">Iteration</ListboxItem>
            </Listbox>
          </div>
        </div>
* */
