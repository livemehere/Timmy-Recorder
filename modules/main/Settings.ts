import { dataPath } from '@main/DataPath';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import debugLog from '@shared/debugLog';

export interface SettingsData {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

type SettingsKey = keyof SettingsData;
type SettingsValue<T extends SettingsKey> = SettingsData[T];

export function parseJsonFile(path: string, defaults?: any) {
  try {
    return JSON.parse(readFileSync(path).toString());
  } catch (e) {
    return defaults;
  }
}

class Settings {
  path = join(dataPath.root, 'settings.json');
  data: SettingsData;

  constructor() {
    this.data = parseJsonFile(this.path, {});
    debugLog('불러온 settings.json 값 ::', this.data);
  }

  set<K extends SettingsKey>(key: K, value: SettingsValue<K>) {
    this.data[key] = value;
    writeFileSync(this.path, JSON.stringify(this.data));
  }

  get<K extends SettingsKey>(key: K): SettingsValue<K> {
    return this.data[key];
  }
}

export const settings = new Settings();
