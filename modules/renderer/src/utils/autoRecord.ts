import { WindowInfo } from '@shared/shared-type';
import FcLogo from '@renderer/src/assets/fc-logo.png';

export interface AutoRecordAbleWindow {
  label: string;
  matcher: (window: WindowInfo) => boolean;
  thumbnail: string;
}
export const autoRecordAbleWindows: AutoRecordAbleWindow[] = [
  {
    label: 'FC 온라인',
    matcher: (window: WindowInfo) => window.value.includes('FC') && window.value.includes('fczf'),
    thumbnail: FcLogo
  }
];
