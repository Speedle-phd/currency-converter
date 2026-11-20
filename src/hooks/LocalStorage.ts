import { useState } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
   const [storedValue, setStoredValue] = useState<T>(() => {
      try {
         const item = window.localStorage.getItem(key);
         return item ? JSON.parse(item) : initialValue;
      } catch (error) {
         console.warn(`Could not read ${key} from localStorage:`, error)
         return initialValue;
      }
   });

   const setValue = (value: T) => {
      setStoredValue(value);
      try {
         window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
         console.warn(`Could not save ${key} to localStorage:`, error)
      }
   };

   return [storedValue, setValue] as const;
}

export default useLocalStorage;