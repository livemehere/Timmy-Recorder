import { useEffect } from 'react';

const useDeepLink = (callback: (url: string) => void, deps = []) => {
  useEffect(() => {
    const id = window.app.on('deepLink', (url: string) => {
      callback(url);
    });

    return () => {
      window.app.off(id);
    };
  }, [...deps]);
};

export default useDeepLink;
