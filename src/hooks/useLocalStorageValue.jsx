import { useState, useEffect } from 'react';

export const useLocalStorageValue = (key) => {
  const [value, setValue] = useState(() => localStorage.getItem(key));

  useEffect(() => {
    const handler = () => {
      setValue(localStorage.getItem(key));
    };

    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('storage', handler);
    };
  }, [key]);

  // También escuchamos cambios locales en setItem manualmente
  useEffect(() => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (...args) {
      originalSetItem.apply(this, args);
      const [changedKey] = args;
      if (changedKey === key) {
        window.dispatchEvent(new Event('storage')); // disparar evento
      }
    };
    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, [key]);

  return value;
};