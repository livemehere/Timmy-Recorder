import { resolve } from 'path';
import { NO_PACK } from '@main/config';

export default function resolveUnpackedNodeModulePath(path: string) {
  if (NO_PACK) {
    return resolve(process.cwd(), 'node_modules', path);
  }
  return resolve(__dirname, 'node_modules', path).replace('app.asar', 'app.asar.unpacked').replace('dist', '');
}
