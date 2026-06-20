import { useState } from 'react';

export default function SchedulePage() {
  const [autoMode, setAutoMode] = useState(true);

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
            <h2 className="text-3xl font-bold mt-1">Pagi: 07:00</h2>
            <p className="text-sm opacity-90 mt-2">Sesi otomatis setiap hari</p>
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span className="text-xs font-bold text-emerald-200">Sistem Online</span>
              </div>
              <button className="bg-emerald-400/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-emerald-400/30 transition-all active:scale-95">
                Siram Sekarang
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
              <p className="text-xs text-gray-500">AI-driven moisture optimization</p>
            </div>
          </div>
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${autoMode ? 'bg-emerald-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${autoMode ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg">Jadwal Penyiraman</h3>
            <button className="flex items-center gap-1 text-sm font-bold text-emerald-700">
              <span className="material-symbols-outlined text-lg">add_circle</span> Tambah
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 text-amber-600 w-12 h-12 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">light_mode</span>
              </div>
              <div>
                <p className="font-bold text-gray-800">Pagi: 07:00 AM</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">15 menit</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Harian</span>
                </div>
              </div>
            </div>
            <button className="text-gray-400 p-1">
              <span className="material-symbols-outlined text-xl">more_vert</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">dark_mode</span>
              </div>
              <div>
                <p className="font-bold text-gray-800">Sore: 06:00 PM</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">10 menit</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Sen, Rab, Jum</span>
                </div>
              </div>
            </div>
            <button className="text-gray-400 p-1">
              <span className="material-symbols-outlined text-xl">more_vert</span>
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-700 text-white rounded-2xl p-4 flex flex-col justify-between aspect-square">
            <span className="material-symbols-outlined text-3xl opacity-80">opacity</span>
            <div>
              <p className="text-xs text-emerald-200 uppercase font-bold">Air Mingguan</p>
              <p className="text-2xl font-bold mt-1">12.5 L</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 flex flex-col justify-between aspect-square shadow-sm border border-gray-100/80 overflow-hidden relative">
            <span className="material-symbols-outlined text-emerald-700 text-2xl">thermostat</span>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Suhu Tanah</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">22°C</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
