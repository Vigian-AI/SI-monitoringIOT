import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import type { DeviceStatus } from '../types';

export function useDeviceStatus(intervalMs = 10000) {
  const [status, setStatus] = useState<DeviceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = () => {
      fetch(`${API_BASE_URL}/device/status`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setStatus(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return { status, loading };
}
