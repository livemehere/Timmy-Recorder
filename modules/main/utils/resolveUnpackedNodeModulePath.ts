import { resolve } from 'path';

export default function resolveUnpackedNodeModulePath(path: string) {
  if (process.env.NODE_ENV === 'production') {
    return resolve(process.cwd(), 'resources', 'app.asar.unpacked', 'node_modules', path);
  }
  return resolve(process.cwd(), 'node_modules', path);
}
