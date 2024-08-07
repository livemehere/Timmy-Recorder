import { dataPath } from '@main/DataPath';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import debugLog from '@shared/debugLog';
import * as fs from 'fs';

export interface VideoEditorStorageData {
  resourceIdMap: { [key: string]: string };
}

type SettingsKey = keyof VideoEditorStorageData;
type SettingsValue<T extends SettingsKey> = VideoEditorStorageData[T];

export function parseJsonFile(path: string, defaults?: any) {
  try {
    return JSON.parse(readFileSync(path).toString());
  } catch (e) {
    return defaults;
  }
}

class VideoEditorStorage {
  dir = join(dataPath.root, 'video-editor');
  filename = 'video-editor-storage.json';
  data: VideoEditorStorageData;

  get path() {
    return join(this.dir, this.filename);
  }

  constructor() {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
    this.data = parseJsonFile(this.path, {
      resourceIdMap: {}
    });
    debugLog('불러온 settings.json 값 ::', this.data);
  }

  set<K extends SettingsKey>(key: K, value: SettingsValue<K>) {
    this.data[key] = value;
    writeFileSync(this.path, JSON.stringify(this.data));
  }

  get<K extends SettingsKey>(key: K): SettingsValue<K> | undefined {
    return this.data[key];
  }
}

export const videoEditorStorage = new VideoEditorStorage();
