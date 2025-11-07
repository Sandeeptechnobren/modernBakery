import { useState, useCallback } from "react";

export function useLoadingHook(initialState: boolean = false) {
  const [loading, setLoading] = useState(initialState);

  // Safely wrap async functions to handle loading automatically
  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      try {
        setLoading(true);
        const result = await fn();
        return result;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, setLoading, withLoading };
}