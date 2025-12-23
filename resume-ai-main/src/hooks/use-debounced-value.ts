import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update the value after 'delay' milliseconds
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // If the value changes (you type another character) before the timer finishes,
    // this cleanup function runs and cancels the previous timer.
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
