import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { useSensorData } from '../hooks/useSensorData';
import { useDeviceStatus } from '../hooks/useDeviceStatus';
import { ConnectionBadge } from '../components/ConnectionBadge';
import type { SensorData } from '../types';

// Import Recharts components
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SensorsPage() {
  const { sensor, loading } = useSensorData();
  const { status: deviceStatus } = useDeviceStatus();
  const [history, setHistory] = useState<SensorData[]>([]);
  const [range, setRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    const limit = range === 'today' ? 24 : range === 'week' ? 50 : 100;
    fetch(`${API_BASE_URL}/sensor?limit=${limit}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setHistory(Array.isArray(data) ? data : []));
  }, [range]);

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
    // Added color for light intensity status if needed
    if (type === 'light') {
       if (val >= 40) return { label: 'ADEQUATE', color: 'bg-yellow-100 text-yellow-700' };
       return { label: 'LOW', color: 'bg-red-100 text-red-700' };
    }
    return { label: 'STABLE', color: 'bg-gray-100 text-gray-700' };
  };

  // Data preparation for charts
  const formatChartData = (data: SensorData[]) => {
    return data.map((d) => ({
      time: new Date(d.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      temperature: d.temperature,
      humidity: d.humidity,
      light_intensity: d.light_intensity,
      soil_moisture: d.soil_moisture,
    }));
  };

  const formattedHistory = formatChartData(history);

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-emerald-900">Sensors</h2>
            <p className="text-gray-500 text-sm mt-1">Data sensor real-time dari ESP32</p>
          </div>
          <ConnectionBadge online={deviceStatus?.online} loading={!deviceStatus} />
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
          {/* Existing Sensor Cards (unchanged for this task, but could be enhanced with mini-charts) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-emerald-50 rounded-xl"> <span className="material-symbols-outlined text-emerald-600 text-2xl">water_drop</span> </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatus('soil', sensor?.soil_moisture ?? 0).color}`}>
                {getStatus('soil', sensor?.soil_moisture ?? 0).label}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Kelembaban Tanah</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-bold text-emerald-700">{loading && !sensor ? '--' : sensor?.soil_moisture ?? 0}</span>
                <span className="text-lg text-gray-400">%</span>
              </div>
            </div>
            <div className="h-2 w-full bg-emerald-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${sensor?.soil_moisture ?? 0}%` }} />
            </div>
            <p className="text-xs text-gray-400 italic mt-3">
              {!deviceStatus?.online ? 'Sensor tidak terhubung.' : sensor && sensor.soil_moisture >= 60 ? 'Kelembaban ideal. Tidak perlu penyiraman.' : 'Tanah membutuhkan air segera.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-orange-50 rounded-xl"> <span className="material-symbols-outlined text-orange-500 text-2xl">thermostat</span> </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatus('temp', sensor?.temperature ?? 0).color}`}>
                {getStatus('temp', sensor?.temperature ?? 0).label}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Suhu Udara</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-bold text-orange-500">{loading && !sensor ? '--' : sensor?.temperature ?? 0}</span>
                <span className="text-lg text-gray-400">°C</span>
              </div>
            </div>
             <p className="text-xs text-gray-400 italic mt-3">
              {sensor && sensor.temperature >= 18 && sensor.temperature <= 30 ? 'Suhu ideal untuk tanaman.' : 'Suhu di luar rentang optimal.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 md:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-yellow-50 rounded-xl"> <span className="material-symbols-outlined text-yellow-500 text-2xl">light_mode</span> </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatus('light', sensor?.light_intensity ?? 0).color}`}>
                {getStatus('light', sensor?.light_intensity ?? 0).label}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Intensitas Cahaya</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-bold text-yellow-600">{loading && !sensor ? '--' : sensor?.light_intensity ?? 0}</span>
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

        {/* New Section for Historical Graphs */}
        <section>
          <h3 className="font-bold text-gray-800 text-lg mb-3">Riwayat Data Sensor</h3>
          <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm">
            {!deviceStatus?.online ? (
              <p className="text-center text-gray-400 text-sm py-8">
                Tidak ada data. ESP32 belum terhubung.
              </p>
            ) : history.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">
                Menunggu data historis...
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Temperature Chart */}
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Suhu Udara (°C)</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formattedHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }} itemStyle={{ color: '#0f5238' }} />
                      <Legend wrapperStyle={{ color: '#4b5563' }} />
                      <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Humidity Chart */}
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Kelembaban Udara (%)</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formattedHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }} itemStyle={{ color: '#0f5238' }} />
                      <Legend wrapperStyle={{ color: '#4b5563' }} />
                      <Line type="monotone" dataKey="humidity" stroke="#0284c7" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Light Intensity Chart */}
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Intensitas Cahaya (%)</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formattedHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} unit="%" />
                      <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }} itemStyle={{ color: '#0f5238' }} />
                      <Legend wrapperStyle={{ color: '#4b5563' }} />
                      <Line type="monotone" dataKey="light_intensity" stroke="#eab308" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Soil Moisture Chart */}
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Kelembaban Tanah (%)</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formattedHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} unit="%" />
                      <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }} itemStyle={{ color: '#0f5238' }} />
                      <Legend wrapperStyle={{ color: '#4b5563' }} />
                      <Line type="monotone" dataKey="soil_moisture" stroke="#047857" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}