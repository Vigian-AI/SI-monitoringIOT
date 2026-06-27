import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { useDeviceStatus } from '../hooks/useDeviceStatus';
import { useSensorData } from '../hooks/useSensorData';
import { formatDaysOfWeek, formatTime12h } from '../utils/health';
import type { Schedule, WeeklyStats, Settings } from '../types';

export default function SchedulePage() {
  const { status: deviceStatus, loading: deviceLoading } = useDeviceStatus();
  const { sensor } = useSensorData();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [nextSchedule, setNextSchedule] = useState<Schedule | null>(null);
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [autoMode, setAutoMode] = useState(true);
  const [watering, setWatering] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ label: '', time: '07:00', duration_minutes: 15, days_of_week: 'daily' });

  const loadData = () => {
    fetch(`${API_BASE_URL}/schedules`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setSchedules(data.schedules || []);
          setNextSchedule(data.next || null);
        }
      });
    fetch(`${API_BASE_URL}/logs/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setStats(data));
    fetch(`${API_BASE_URL}/settings`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Settings | null) => {
        if (data) setAutoMode(data.auto_water_enabled);
      });
  };

  useEffect(() => { loadData(); }, []);

  const toggleAutoMode = async () => {
    const newVal = !autoMode;
    setAutoMode(newVal);
    try {
      const r = await fetch(`${API_BASE_URL}/settings`);
      const settings = r.ok ? await r.json() : {};
      await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, auto_water_enabled: newVal }),
      });
    } catch {
      setAutoMode(!newVal);
    }
  };

  const handleWaterNow = async () => {
    setWatering(true);
    try {
      await fetch(`${API_BASE_URL}/watering`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: 20 }),
      });
      loadData();
    } catch {
      alert('Gagal menyiram');
    }
    setTimeout(() => setWatering(false), 2000);
  };

  const toggleSchedule = async (schedule: Schedule) => {
    await fetch(`${API_BASE_URL}/schedules/${schedule.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !schedule.enabled }),
    });
    loadData();
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.label || !newSchedule.time) return;
    await fetch(`${API_BASE_URL}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newSchedule, icon: 'light_mode' }),
    });
    setShowAdd(false);
    setNewSchedule({ label: '', time: '07:00', duration_minutes: 15, days_of_week: 'daily' });
    loadData();
  };

  const handleDeleteSchedule = async (id: number) => {
    await fetch(`${API_BASE_URL}/schedules/${id}`, { method: 'DELETE' });
    loadData();
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
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-6 text-white shadow-lg">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-600/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">Penyiraman Berikutnya</span>
            <h2 className="text-3xl font-bold mt-1">
              {nextSchedule
                ? `${nextSchedule.label}: ${nextSchedule.time}`
                : schedules.length === 0
                  ? 'Belum ada jadwal'
                  : 'Tidak ada jadwal aktif'}
            </h2>
            <p className="text-sm opacity-90 mt-2">
              {nextSchedule ? formatDaysOfWeek(nextSchedule.days_of_week) : 'Tambahkan jadwal penyiraman'}
            </p>
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${deviceStatus?.online ? 'bg-emerald-300 animate-pulse' : 'bg-red-300'}`} />
                <span className={`text-xs font-bold ${deviceStatus?.online ? 'text-emerald-200' : 'text-red-200'}`}>
                  {deviceLoading ? 'Memuat...' : deviceStatus?.online ? 'Terhubung' : 'Tidak Terhubung'}
                </span>
              </div>
              <button
                onClick={handleWaterNow}
                disabled={watering || !deviceStatus?.online}
                className="bg-emerald-400/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-emerald-400/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {watering ? 'Menyiram...' : 'Siram Sekarang'}
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-emerald-100/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700">
              <span className="material-symbols-outlined text-2xl">auto_mode</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Penyiraman Otomatis</h3>
              <p className="text-xs text-gray-500">Berdasarkan kelembaban tanah dari sensor</p>
            </div>
          </div>
          <button
            onClick={toggleAutoMode}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${autoMode ? 'bg-emerald-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${autoMode ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg">Jadwal Penyiraman</h3>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-1 text-sm font-bold text-emerald-700"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span> Tambah
            </button>
          </div>

          {showAdd && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-200 space-y-3">
              <input
                type="text"
                placeholder="Nama jadwal (mis. Pagi)"
                value={newSchedule.label}
                onChange={(e) => setNewSchedule({ ...newSchedule, label: e.target.value })}
                className="w-full h-10 px-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm"
              />
              <input
                type="time"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                className="w-full h-10 px-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm"
              />
              <input
                type="number"
                placeholder="Durasi (menit)"
                value={newSchedule.duration_minutes}
                onChange={(e) => setNewSchedule({ ...newSchedule, duration_minutes: parseInt(e.target.value) || 15 })}
                className="w-full h-10 px-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm"
              />
              <button
                onClick={handleAddSchedule}
                className="w-full bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm"
              >
                Simpan Jadwal
              </button>
            </div>
          )}

          {schedules.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">Belum ada jadwal. Tambahkan jadwal penyiraman.</p>
          )}

          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 flex items-center justify-between ${!schedule.enabled ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`${schedule.icon === 'dark_mode' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'} w-12 h-12 rounded-full flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-2xl">{schedule.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-gray-800">{schedule.label}: {formatTime12h(schedule.time)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {schedule.duration_minutes} menit
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {formatDaysOfWeek(schedule.days_of_week)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleSchedule(schedule)} className="text-emerald-600 p-1" title={schedule.enabled ? 'Nonaktifkan' : 'Aktifkan'}>
                  <span className="material-symbols-outlined text-xl">{schedule.enabled ? 'toggle_on' : 'toggle_off'}</span>
                </button>
                <button onClick={() => handleDeleteSchedule(schedule.id)} className="text-red-400 p-1">
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-700 text-white rounded-2xl p-4 flex flex-col justify-between aspect-square">
            <span className="material-symbols-outlined text-3xl opacity-80">opacity</span>
            <div>
              <p className="text-xs text-emerald-200 uppercase font-bold">Air Mingguan</p>
              <p className="text-2xl font-bold mt-1">{stats ? `${stats.liters_estimate} L` : '--'}</p>
              <p className="text-[10px] text-emerald-200 mt-1">{stats?.total_sessions ?? 0} sesi</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 flex flex-col justify-between aspect-square shadow-sm border border-gray-100/80 overflow-hidden relative">
            <span className="material-symbols-outlined text-emerald-700 text-2xl">thermostat</span>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Suhu Udara</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {sensor ? `${sensor.temperature}°C` : '--'}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
