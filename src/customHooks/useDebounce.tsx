import { useState, useEffect } from "react";

const useDebounceHook = (value: any, delay: number): any => {
  const [debounceValue, setDebounceValue] = useState<any | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounceValue(value);
    }, delay);

    return () => clearTimeout(timeout as any);
  }, [value, delay]);

  return { debounceValue };
};

export default useDebounceHook;
