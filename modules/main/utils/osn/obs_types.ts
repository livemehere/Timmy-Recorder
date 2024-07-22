export interface CategorySetting {
  data: {
    nameSubCategory: string;
    parameters: {
      name: string;
      type: string;
      description: string;
      subType: string;
      currentValue: string;
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
