import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import type { SensorData } from '../types';

export function useSensorData(intervalMs = 5000) {
  const [sensor, setSensor] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSensor = () => {
      fetch(`${API_BASE_URL}/sensor/latest`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setSensor(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchSensor();
    const interval = setInterval(fetchSensor, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return { sensor, loading };
}
