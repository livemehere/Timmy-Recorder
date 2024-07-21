import { DEEP_LINK_PROTOCOL } from '@shared/config';

export function convertToMediaPath(path: string) {
  return `${DEEP_LINK_PROTOCOL}://media/` + path;
}
