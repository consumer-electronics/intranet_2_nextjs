import { useState, useEffect, useCallback } from 'react';
import { trmApi } from '@/api/trm';

export function useTrm() {
  const [currentTrm, setCurrentTrm] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [historyRange, setHistoryRange] = useState('1M'); // 1D, 5D, 1M, 3M, 6M, YTD, 1A, 5A, MAX

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [current, hist] = await Promise.all([
        trmApi.getCurrent(),
        trmApi.getHistory('1M')
      ]);
      setCurrentTrm(current);
      setHistory(hist);
    } catch (err) {
      setError(err.message || 'Error al obtener TRM');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const changeRange = async (newRange) => {
    setHistoryRange(newRange);
    setLoadingHistory(true);
    try {
      const hist = await trmApi.getHistory(newRange);
      setHistory(hist);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return {
    currentTrm,
    history,
    loading,
    loadingHistory,
    error,
    historyRange,
    changeRange,
    refetch: fetchInitialData
  };
}
