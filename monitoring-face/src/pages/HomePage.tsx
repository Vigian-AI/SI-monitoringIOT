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

function getHealthStatus(soil: number) {
  if (soil >= 60) return { text: 'Tanah Basah', color: 'text-emerald-600', bg: 'bg-emerald-100', pct: 92 };
  if (soil >= 35) return { text: 'Cukup Lembap', color: 'text-emerald-600', bg: 'bg-emerald-50', pct: 75 };
  if (soil >= 20) return { text: 'Agak Kering', color: 'text-yellow-600', bg: 'bg-yellow-50', pct: 50 };
  return { text: 'Sangat Kering!', color: 'text-red-600', bg: 'bg-red-50', pct: 20 };
}

export default function HomePage() {
  const [sensor, setSensor] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/sensor/latest`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setSensor(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    const interval = setInterval(() => {
      fetch(`${API_BASE_URL}/sensor/latest`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => data && setSensor(data));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const health = sensor ? getHealthStatus(sensor.soil_moisture) : getHealthStatus(50);

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
              <h2 className="text-2xl font-bold text-emerald-900 mt-1 leading-tight">{health.text}</h2>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-gray-500 font-medium">
                  {loading ? 'Memuat data...' : 'Sensor aktif'}
                </span>
              </div>
            </div>
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#d1fee5" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0f5238" strokeDasharray={`${health.pct}, 100`} strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-bold text-emerald-800">{health.pct}%</span>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-lg">Ringkasan Sensor</h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Live</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80">
              <span className="material-symbols-outlined text-orange-400 text-2xl">device_thermostat</span>
              <p className="text-xs text-gray-500 mt-1">Suhu Udara</p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">
                {loading ? '--' : `${sensor?.temperature ?? 0}°C`}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80">
              <span className="material-symbols-outlined text-blue-500 text-2xl">humidity_percentage</span>
              <p className="text-xs text-gray-500 mt-1">Kelembaban Udara</p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">
                {loading ? '--' : `${sensor?.humidity ?? 0}%`}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 col-span-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="material-symbols-outlined text-yellow-500 text-2xl">wb_sunny</span>
                  <p className="text-xs text-gray-500 mt-1">Intensitas Cahaya</p>
                  <p className="text-xl font-bold text-gray-800 mt-0.5">
                    {loading ? '--' : `${sensor?.light_intensity ?? 0}%`}
                  </p>
                </div>
                <div className="flex gap-1 items-end h-12">
                  {[6, 8, 12, 10, 7].map((h, i) => (
                    <div key={i} className="w-2 rounded-full bg-emerald-200" style={{ height: `${h * 4}px` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <button className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-700/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
            Siram Semua Tanaman
          </button>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg">Tanaman Saya</h3>
            <button className="text-sm font-bold text-emerald-700">Lihat Semua</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {[
              { name: 'Monstera', moisture: 92, status: 'Sangat Lembap', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoHAsTueu_8T3u2xr81melJyEraax_dxdXPCgOahLFDUxbP7qR3pj7FOqtgzopI7Que1gbQlejRvmXm0-ErNpr592Xtjc-zQGZCwzk-77G_jfk51bBuGm6_9WpsTnC9XGKeynl6WJfoA2jbOyVeN1RYPGsT7TS6PYYQfivebwoLbKurYYTlAtoow0G3IFaozDt_2wpeVEzOzz2-_twT-XjkwhHPDRKochjkmBvr25hJQnHmuXFfxhJsxaM0HtqbvpGOBMX1D0dKMk' },
              { name: 'Snake Plant', moisture: 42, status: 'Butuh Air', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuS9V3rkZnNigwkjb5DgX6P0fQlFME423aQ7A8O_0fl2POf-jrdPysknfjbCEZeolpVJL4oEsOzNVKQjGV4RYcrrdr7mEOwlEd8M69KOoBM7IbbyeU7vkaqmvDS7EDAdBbEC9RtMHm14Opz-WKC6TSHndN9WQLqFHORFHxGRBkXxkY-xQ4OCffg8dypUnA1latkfMOykaBXUdGk4HLXIDNpw2AbmEJYjOGn_n39CEXaR0zmQgN5d_rMs67J6iBZD5hQ6FNYcops1M' },
              { name: 'Fiddle Fig', moisture: 85, status: 'Cukup Lembap', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAg_9k5HGtjljQNkGSTa1oq1ygb934cvPzAfBxl0NmROjQtAC2tavFCBkFFvj5gpl0lFYY4QauhuLORfRU3AXIebjVTfXTcrGs6NUqGhIqljWGuiPs3eXsAnxcwvULYRaqTlD5LJPN_0DRh6VXEhHixiqQ7wmxJ7-XiBRFZAuiXcgZZNeCZ8TegMetu1zUuOzTAZ2XnlkpuBPDjz82tfRFCweHWuY_VF9o-3ctnrwmVRshNzLPh85KfHErbKK1U-NJGWYIDKcH5sWI' },
              { name: 'Lidah Mertua', moisture: 65, status: 'Sejuk', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHwz8LNq5zBPT5K1WpKK1YvkbnnchdOzNc341uEWHh_TmRK2zC1NSuBzs4YGAIFl11YvwTpXlDJ3UU7X3s417PgUADL75-FNk_dBdp0i2L-SaflTVPnBtgNNefhbZKSiRnHUuOkMydFR3bwUBBqkKX1sBYfgmjn4meFkWfXw5y4OJREkPNaaDQu_dkwPorklhO_Ll820WF_ULnCnIFbSfI8wWcqH0telTpqqMkiZJNLtZN30594PWOC04SpKT4xFbwEIaZzSQN6YI' },
            ].map((plant) => (
              <div key={plant.name} className="min-w-[150px] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/80">
                <div className="h-28 relative">
                  <img src={plant.img} alt={plant.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {plant.moisture}%
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-gray-800 text-sm truncate">{plant.name}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">{plant.status}</p>
                </div>
              </div>
            ))}
            <div className="min-w-[150px] bg-emerald-50/50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-emerald-200 gap-2 cursor-pointer hover:bg-emerald-50 transition-colors">
              <span className="material-symbols-outlined text-emerald-600 text-4xl">add_circle</span>
              <span className="text-xs font-bold text-emerald-700">Tambah Tanaman</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
