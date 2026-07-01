import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { useSensorData } from '../hooks/useSensorData';
import { useDeviceStatus } from '../hooks/useDeviceStatus';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { getSoilHealth } from '../utils/health';
import type { Plant } from '../types';

export default function HomePage() {
  const { sensor, loading } = useSensorData();
  const { status: deviceStatus, loading: deviceLoading } = useDeviceStatus();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [watering, setWatering] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/plant`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setPlant(data));
  }, [sensor?.soil_moisture]);

  const handleWatering = async () => {
    setWatering(true);
    try {
      await fetch(`${API_BASE_URL}/watering`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: 20 }),
      });
    } catch {
      alert('Gagal menyiram tanaman');
    }
    setTimeout(() => setWatering(false), 2000);
  };

  const soil = sensor?.soil_moisture ?? plant?.soil_moisture ?? 0;
  const health = getSoilHealth(soil);
  const plantHealth = getSoilHealth(plant?.soil_moisture ?? soil);
  const isPumpOn = sensor?.pump_status === 1 || sensor?.pump_status === true;

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
        <section className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-sm shadow-emerald-900/5 border border-emerald-100/60">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">Status Saat Ini</span>
              <h2 className="text-2xl font-bold text-emerald-900 mt-1 leading-tight">
                {loading && !sensor ? 'Menunggu data...' : health.text}
              </h2>
              <div className="mt-2">
                <ConnectionBadge online={deviceStatus?.online} loading={deviceLoading} />
              </div>
              {isPumpOn && (
                <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">water_drop</span>
                  Pompa sedang aktif
                </p>
              )}
            </div>
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#d1fee5" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0f5238" strokeDasharray={`${health.pct}, 100`} strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-bold text-emerald-800">
                {loading && !sensor ? '--' : `${health.pct}%`}
              </span>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-lg">Ringkasan Sensor</h3>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${deviceStatus?.online ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500 bg-gray-100'}`}>
              {deviceStatus?.online ? 'Live' : 'Offline'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80">
              <span className="material-symbols-outlined text-orange-400 text-2xl">device_thermostat</span>
              <p className="text-xs text-gray-500 mt-1">Suhu Udara</p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">
                {loading && !sensor ? '--' : `${sensor?.temperature ?? 0}°C`}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80">
              <span className="material-symbols-outlined text-blue-500 text-2xl">humidity_percentage</span>
              <p className="text-xs text-gray-500 mt-1">Kelembaban Udara</p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">
                {loading && !sensor ? '--' : `${sensor?.humidity ?? 0}%`}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 col-span-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="material-symbols-outlined text-yellow-500 text-2xl">wb_sunny</span>
                  <p className="text-xs text-gray-500 mt-1">Intensitas Cahaya</p>
                  <p className="text-xl font-bold text-gray-800 mt-0.5">
                    {loading && !sensor ? '--' : `${sensor?.light_intensity ?? 0}%`}
                  </p>
                </div>
                <div className="flex gap-1 items-end h-12">
                  {[6, 8, 12, 10, 7].map((h, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-full transition-all ${deviceStatus?.online ? 'bg-emerald-400' : 'bg-gray-200'}`}
                      style={{ height: `${h * 4}px`, opacity: sensor ? 0.5 + (sensor.light_intensity / 200) : 0.3 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <button
            onClick={handleWatering}
            disabled={watering}
            className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-700/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {watering ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Menyiram...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
                Siram Tanaman
              </>
            )}
          </button>
          {!deviceStatus?.online && !deviceLoading && (
            <p className="text-xs text-red-500 text-center mt-2">ESP32 tidak terhubung. Penyiraman manual tidak tersedia.</p>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg">Tanaman Saya</h3>
          </div>
          {plant ? (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/80">
              <div className="flex">
                <div className="w-32 h-32 relative flex-shrink-0">
                  <img src={plant.image_url} alt={plant.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {plant.soil_moisture ?? soil}%
                  </div>
                </div>
                <div className="p-4 flex flex-col justify-center flex-1">
                  <h4 className="font-bold text-gray-800 text-lg">{plant.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{plant.species}</p>
                  <p className={`text-sm font-medium mt-2 ${plantHealth.color}`}>{plantHealth.text}</p>
                  <div className="mt-2">
                    <ConnectionBadge online={deviceStatus?.online} loading={deviceLoading} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-500 text-sm">
              Memuat data tanaman...
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
