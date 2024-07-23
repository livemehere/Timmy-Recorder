import { resolve } from 'path';
import { IS_PREVIEW } from '@main/config';

export default function resolveUnpackedNodeModulePath(path: string) {
  if (process.env.NODE_ENV === 'production' && !IS_PREVIEW) {
    return resolve(process.cwd(), 'resources', 'app.asar.unpacked', 'node_modules', path);
  }
  return resolve(process.cwd(), 'node_modules', path);
}
