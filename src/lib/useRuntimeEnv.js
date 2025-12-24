import { useState, useEffect } from 'react';

export function useRuntimeEnv() {
  const [env, setEnv] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkEnv = () => {
      if (typeof window !== 'undefined' && window.__RUNTIME_ENV__) {
        setEnv(window.__RUNTIME_ENV__);
        setIsReady(true);
      } else {
        setTimeout(checkEnv, 10);
      }
    };

    checkEnv();
  }, []);

  return { env, isReady };
}
