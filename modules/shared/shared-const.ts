export const VIDEO_BIT_RATES = [
  { label: '360p (1.5Mbps)', value: 1500 },
  { label: '480p (4Mbps)', value: 4000 },
  { label: '720p (7.5Mbps)', value: 7500 },
  { label: '1080p (12Mbps)', value: 12000 },
  { label: '1440p (24Mbps)', value: 24000 },
  { label: '4K (50Mbps)', value: 50000 }
] as const;

export const VIDEO_FORMATS = ['mkv', 'mp4'] as const;
export const VIDEO_OUTPUT_WIDTHS = [480, 720, 1080, 1440, 2160] as const;
export const FPS_VALUES = [24, 30, 60, 120, 144, 240] as const;
