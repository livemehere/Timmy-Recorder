import { Tab, Tabs } from '@nextui-org/react';
import Title from '@renderer/src/components/ui/Title';
import Container from '@renderer/src/components/ui/Container';
import Category from '@renderer/src/components/settings/Category';
import useObsSettingCategoryEnums from '@renderer/src/hooks/queries/useObsSettingCategoryEnums';

export default function Settings() {
  const { data: settingCategories } = useObsSettingCategoryEnums();

  return (
    <Container>
      <Title>설정</Title>
      <div className="min-h-[1000px]">
        <Tabs>
          {settingCategories?.map((category, i) => (
            <Tab key={category} title={category}>
              <Category key={i} categoryEnumKey={category} />
            </Tab>
          ))}
        </Tabs>
      </div>
    </Container>
  );
}
