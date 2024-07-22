export interface CategorySetting {
  data: {
    nameSubCategory: string;
    parameters: {
      name: string;
      type: string | 'OBS_PROPERTY_BOOL';
      description: string;
      subType: string;
      currentValue: string | boolean;
      values: {
        [key: string]: string;
      }[];
      visible: boolean;
      enabled: boolean;
      masked: boolean;
    }[];
  }[];
  type: number;
}
