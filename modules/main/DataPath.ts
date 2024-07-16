import { app } from 'electron';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

class DataPath {
  get root() {
    return app.getPath('userData');
  }

  getPath(dirname: string) {
    const path = join(this.root, dirname);
    if (!existsSync(path)) {
      mkdirSync(path);
    }
    return path;
  }
}

export const dataPath = new DataPath();
