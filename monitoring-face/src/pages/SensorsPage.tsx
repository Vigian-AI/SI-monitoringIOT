import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

interface SensorData {
  temperature: number;
  humidity: number;
  light_intensity: number;
  soil_moisture: number;
  pump_status: boolean;
  created_at: string;
}

export default function SensorsPage() {
  const [sensor, setSensor] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    fetch(`${API_BASE_URL}/sensor/latest`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setSensor(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStatus = (type: string, val: number) => {
    if (type === 'soil') {
      if (val >= 60) return { label: 'OPTIMAL', color: 'bg-emerald-100 text-emerald-700' };
      if (val >= 35) return { label: 'NORMAL', color: 'bg-blue-100 text-blue-700' };
      if (val >= 20) return { label: 'LOW', color: 'bg-yellow-100 text-yellow-700' };
      return { label: 'CRITICAL', color: 'bg-red-100 text-red-700' };
    }
    if (type === 'temp') {
      if (val >= 18 && val <= 30) return { label: 'COMFORT', color: 'bg-emerald-100 text-emerald-700' };
      if (val >= 30 && val <= 35) return { label: 'WARM', color: 'bg-orange-100 text-orange-700' };
      return { label: 'EXTREME', color: 'bg-red-100 text-red-700' };
    }
    return { label: 'STABLE', color: 'bg-gray-100 text-gray-700' };
  };

  const ranges = ['today', 'week', 'month'] as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/80 to-white pb-28">
      <header className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-xl shadow-sm shadow-emerald-900/5 px-5 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-700 text-[28px]">potted_plant</span>
          <h1 className="text-xl font-bold text-emerald-900 tracking-tight">Floratech</h1>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-emerald-50 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-gray-600 text-[22px]">notifications</span>
        </button>
      </header>

      <main className="pt-24 px-5 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-emerald-900">Sensors</h2>
          <p className="text-gray-500 text-sm mt-1">Data sensor real-time dari perangkat Anda</p>
        </div>

        <div className="flex bg-emerald-100/60 p-1 rounded-xl w-fit">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                range === r ? 'bg-emerald-700 text-white shadow-md' : 'text-gray-600 hover:bg-emerald-50'
              }`}
            >
              {r === 'today' ? 'Hari Ini' : r === 'week' ? 'Minggu Ini' : 'Bulan Ini'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-emerald-50 rounded-xl">
                <span className="material-symbols-outlined text-emerald-600 text-2xl">water_drop</span>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatus('soil', sensor?.soil_moisture ?? 0).color}`}>
                {getStatus('soil', sensor?.soil_moisture ?? 0).label}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Kelembaban Tanah</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-bold text-emerald-700">{loading ? '--' : sensor?.soil_moisture ?? 0}</span>
                <span className="text-lg text-gray-400">%</span>
              </div>
            </div>
            <div className="h-2 w-full bg-emerald-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${sensor?.soil_moisture ?? 0}%` }} />
            </div>
            <p className="text-xs text-gray-400 italic mt-3">
              {sensor && sensor.soil_moisture >= 60 ? 'Kelembaban ideal. Tidak perlu penyiraman.' : 'Tanah membutuhkan air segera.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-orange-50 rounded-xl">
                <span className="material-symbols-outlined text-orange-500 text-2xl">thermostat</span>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatus('temp', sensor?.temperature ?? 0).color}`}>
                {getStatus('temp', sensor?.temperature ?? 0).label}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Suhu Udara</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-bold text-orange-500">{loading ? '--' : sensor?.temperature ?? 0}</span>
                <span className="text-lg text-gray-400">°C</span>
              </div>
            </div>
            <div className="flex items-end gap-1 h-12 w-full mt-3">
              {[40, 55, 65, 80, 90, 85, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-orange-100 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
            <p className="text-xs text-gray-400 italic mt-3">
              {sensor && sensor.temperature >= 18 && sensor.temperature <= 30 ? 'Suhu ideal untuk tanaman.' : 'Suhu di luar rentang optimal.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 md:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-yellow-50 rounded-xl">
                <span className="material-symbols-outlined text-yellow-500 text-2xl">light_mode</span>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatus('light', sensor?.light_intensity ?? 0).color}`}>
                {getStatus('light', sensor?.light_intensity ?? 0).label}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Intensitas Cahaya</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-bold text-yellow-600">{loading ? '--' : sensor?.light_intensity ?? 0}</span>
                <span className="text-lg text-gray-400">%</span>
              </div>
            </div>
            <div className="relative w-full aspect-square max-h-24 flex items-center justify-center mt-2">
              <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#f0fdf4" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#0f5238" strokeDasharray="213.6" strokeDashoffset={213.6 - (213.6 * ((sensor?.light_intensity ?? 0) / 100))} strokeWidth="6" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-xs text-gray-400 italic mt-2">
              {sensor && sensor.light_intensity >= 40 ? 'Cahaya cukup untuk fotosintesis.' : 'Cahaya kurang optimal.'}
            </p>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-lg">Riwayat Historis</h3>
            <button className="flex items-center gap-1 text-sm font-bold text-emerald-700">
              Laporan Lengkap <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm">
            <div className="relative h-48 w-full flex items-end justify-between gap-1">
              {[40, 55, 65, 80, 90, 75, 60].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-400 font-medium">{h}%</span>
                  <div className="w-full bg-emerald-100 rounded-t-lg hover:bg-emerald-200 transition-all" style={{ height: `${h * 1.8}px` }} />
                  <span className="text-[10px] text-gray-400 font-medium">
                    {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
