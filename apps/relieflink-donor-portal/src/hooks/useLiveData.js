import { useEffect, useState, useCallback, useRef } from "react";
import { getCampsWithNeeds, getDashboardStats, getPublicPledges, subscribeToChanges } from "../services/dataService";

// A single pledge triggers several realtime events in a row (pledge row, need
// touch, ...). Coalescing them keeps the UI fast instead of refetching per event.
function useDebouncedCallback(fn, ms = 300) {
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  return useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(fn, ms);
  }, [fn, ms]);
}

// Camps + their needs, auto-refreshing whenever a pledge changes the data.
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
  const debouncedLoad = useDebouncedCallback(load);

  useEffect(() => {
    load();
    return subscribeToChanges(debouncedLoad);
  }, [load, debouncedLoad]);

  return { camps, loading, error, refresh: load };
}

// Public donation history, grouped by need id: { [needId]: Pledge[] } (newest first).
// If the pledge SQL hasn't been run yet, this degrades to "no pledges" and
// exposes `error` so the page can show a setup hint instead of crashing.
export function useLivePledges() {
  const [byNeed, setByNeed] = useState({});
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const list = await getPublicPledges();
      const grouped = {};
      list.forEach((p) => (grouped[p.needId] ||= []).push(p));
      setByNeed(grouped);
      setError(null);
    } catch (e) {
      setError(e);
    }
  }, []);
  const debouncedLoad = useDebouncedCallback(load);

  useEffect(() => {
    load();
    return subscribeToChanges(debouncedLoad);
  }, [load, debouncedLoad]);

  return { pledgesByNeed: byNeed, pledgeError: error };
}

export function useLiveDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    const data = await getDashboardStats();
    setStats(data);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);
  const debouncedLoad = useDebouncedCallback(load);

  useEffect(() => {
    load();
    return subscribeToChanges(debouncedLoad);
  }, [load, debouncedLoad]);

  return { stats, loading, lastUpdated, refresh: load };
}
