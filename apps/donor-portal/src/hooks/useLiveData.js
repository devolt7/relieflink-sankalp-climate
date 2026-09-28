import { useEffect, useState, useCallback } from "react";
import { getCampsWithNeeds, getDashboardStats, subscribeToChanges } from "../services/dataService";

// Camps + their needs, auto-refreshing whenever a claim changes the data.
// Swapping the mock pub/sub for a real Supabase realtime channel later
// requires no change here — subscribeToChanges keeps the same signature.
export function useLiveCampsWithNeeds() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await getCampsWithNeeds();
      setCamps(data);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const unsubscribe = subscribeToChanges(load);
    return unsubscribe;
  }, [load]);

  return { camps, loading, error, refresh: load };
}

export function useLiveDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const unsubscribe = subscribeToChanges(load);
    return unsubscribe;
  }, [load]);

  return { stats, loading, lastUpdated, error, refresh: load };
}
