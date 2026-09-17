import { useState, useEffect, useCallback } from 'react';
import { contentsApi } from '@/api/contents';

export function useDashboardContent(initialParams = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await contentsApi.getAll(initialParams);
      setData(result);
    } catch (err) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const featured = data.filter(c => c.destacado);
  const regular = data.filter(c => !c.destacado);

  return {
    data,
    featured,
    regular,
    loading,
    error,
    refetch: fetchContents
  };
}
