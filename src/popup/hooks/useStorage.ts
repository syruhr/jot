import { useState, useEffect, useCallback } from 'react';
import { getData, setData, JotData } from '../utils/storage';

export function useStorage() {
  const [data, setLocalData] = useState<JotData | null>(null);

  useEffect(() => {
    getData().then(setLocalData);
  }, []);

  const update = useCallback(async (partial: Partial<JotData>) => {
    setLocalData((prev) => (prev ? { ...prev, ...partial } : prev));
    await setData(partial);
  }, []);

  return { data, update };
}
