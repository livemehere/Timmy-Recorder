export const OS = {
  Windows: 'win32',
  Mac: 'darwin'
} as const;

export function getOS() {
  return process.platform;
}

export function isMac() {
  return getOS() === OS.Mac;
}

export function byOS<T = any>(handlers: Record<string, T>): T {
  const handler = handlers[process.platform];
  if (typeof handler === 'function') return handler();
  return handler as T;
}
