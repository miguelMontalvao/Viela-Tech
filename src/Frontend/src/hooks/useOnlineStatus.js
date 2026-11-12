import { useEffect, useState } from 'react';

/** Indica se o dispositivo está com conexão (eventos online/offline do navegador). */
export function useOnlineStatus() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  useEffect(() => {
    const ficarOnline = () => setOnline(true);
    const ficarOffline = () => setOnline(false);
    window.addEventListener('online', ficarOnline);
    window.addEventListener('offline', ficarOffline);
    return () => {
      window.removeEventListener('online', ficarOnline);
      window.removeEventListener('offline', ficarOffline);
    };
  }, []);

  return online;
}
