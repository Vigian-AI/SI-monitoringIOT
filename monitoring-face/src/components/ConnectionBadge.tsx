export function ConnectionBadge({ online, loading }: { online?: boolean; loading?: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
        <span className="text-xs text-gray-500 font-medium">Memuat...</span>
      </div>
    );
  }

  if (online) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-emerald-600 font-medium">Terhubung</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-red-400" />
      <span className="text-xs text-red-500 font-medium">Tidak Terhubung</span>
    </div>
  );
}
