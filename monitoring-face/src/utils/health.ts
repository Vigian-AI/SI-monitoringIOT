export function getSoilHealth(soil: number) {
  if (soil >= 60) return { text: 'Tanah Basah', color: 'text-emerald-600', bg: 'bg-emerald-100', pct: Math.min(soil, 100) };
  if (soil >= 35) return { text: 'Cukup Lembap', color: 'text-emerald-600', bg: 'bg-emerald-50', pct: soil };
  if (soil >= 20) return { text: 'Agak Kering', color: 'text-yellow-600', bg: 'bg-yellow-50', pct: soil };
  return { text: 'Sangat Kering!', color: 'text-red-600', bg: 'bg-red-50', pct: soil };
}

export function formatDaysOfWeek(days: string) {
  if (days === 'daily') return 'Harian';
  const map: Record<string, string> = {
    mon: 'Sen', tue: 'Sel', wed: 'Rab', thu: 'Kam', fri: 'Jum', sat: 'Sab', sun: 'Min',
  };
  return days.split(',').map((d) => map[d.trim()] || d).join(', ');
}

export function formatTime12h(time: string) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

export function formatLastSeen(iso: string | null) {
  if (!iso) return 'Belum pernah terhubung';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}
