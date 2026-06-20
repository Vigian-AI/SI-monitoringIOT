import { useState } from 'react';
import { API_BASE_URL } from '../config/api';

interface Settings {
  soil_threshold: number;
  pump_max_duration: number;
  pump_cooldown: number;
  telegram_enabled: boolean;
  auto_water_enabled: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    soil_threshold: 30,
    pump_max_duration: 20,
    pump_cooldown: 20,
    telegram_enabled: true,
    auto_water_enabled: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert('Gagal menyimpan pengaturan');
    }
  };

  const toggle = (key: keyof Settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateNum = (key: keyof Settings, val: number) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

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

      <main className="pt-24 px-5 space-y-5">
        <div>
          <h2 className="text-3xl font-bold text-emerald-900">Pengaturan</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola perangkat dan preferensi Anda</p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-emerald-100/60">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Sistem Aktif</span>
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Floratech Hub V2</h3>
            <p className="text-sm text-gray-500 mt-1">Terhubung ke WiFi Rumah</p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">Kekuatan Sinyal</p>
                <p className="font-bold text-emerald-700">-42 dBm</p>
              </div>
              <span className="material-symbols-outlined text-emerald-700 text-4xl" style={{ fontVariationSettings: "'wght' 300" }}>wifi</span>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-emerald-100/60">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <span className="material-symbols-outlined text-emerald-700 text-2xl">update</span>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full">TERBARU</span>
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Firmware</h3>
            <p className="text-sm text-gray-500">v3.4.12-stable</p>
            <div className="h-1.5 w-full bg-emerald-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-full" />
            </div>
            <p className="text-xs text-gray-400 mt-2">Terakhir dicek: 2 jam lalu</p>
          </div>
        </section>

        <section className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-emerald-100/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-emerald-100/60 bg-emerald-50/30">
            <h3 className="font-bold text-emerald-900">Preferensi Notifikasi</h3>
          </div>
          <div className="divide-y divide-emerald-100/60">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <span className="material-symbols-outlined text-xl">water_drop</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Peringatan Air Rendah</p>
                  <p className="text-xs text-gray-500">Notif saat reservoir di bawah 15%</p>
                </div>
              </div>
              <button
                onClick={() => toggle('telegram_enabled')}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.telegram_enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${settings.telegram_enabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-xl text-orange-500">
                  <span className="material-symbols-outlined text-xl">thermostat</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Suhu Ekstrem</p>
                  <p className="text-xs text-gray-500">Alert jika suhu {'>'}35°C atau {'<'}5°C</p>
                </div>
              </div>
              <button
                onClick={() => toggle('auto_water_enabled')}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.auto_water_enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${settings.auto_water_enabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="font-bold text-gray-800 text-lg">Konfigurasi Pompa</h3>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 space-y-4">
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Batas Kelembaban Tanah (%)</label>
              <input
                type="number"
                value={settings.soil_threshold}
                onChange={(e) => updateNum('soil_threshold', parseInt(e.target.value) || 0)}
                className="w-full mt-2 h-10 px-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm font-bold text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Durasi Maksimal Pompa (detik)</label>
              <input
                type="number"
                value={settings.pump_max_duration}
                onChange={(e) => updateNum('pump_max_duration', parseInt(e.target.value) || 0)}
                className="w-full mt-2 h-10 px-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm font-bold text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Jeda Pompa (detik)</label>
              <input
                type="number"
                value={settings.pump_cooldown}
                onChange={(e) => updateNum('pump_cooldown', parseInt(e.target.value) || 0)}
                className="w-full mt-2 h-10 px-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm font-bold text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>
          </div>
        </section>

        <section>
          <button
            onClick={handleSave}
            className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-700/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <span className="material-symbols-outlined text-emerald-200">check_circle</span> Tersimpan!
              </>
            ) : (
              'Simpan Pengaturan'
            )}
          </button>
        </section>

        <section className="pt-6 border-t border-emerald-100">
          <button className="w-full py-3 px-5 rounded-2xl border border-red-200 text-red-500 font-bold text-base hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-xl">restart_alt</span>
            Reset Perangkat Hub
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">Menonaktifkan hub akan menghentikan semua jadwal penyiraman otomatis.</p>
        </section>
      </main>
    </div>
  );
}
