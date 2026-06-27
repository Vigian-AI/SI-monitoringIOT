import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';
import type { User } from '../types';

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const [tab, setTab] = useState<'users' | 'export'>('users');
  const [token] = useState(() => localStorage.getItem('token') || '');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user', is_active: true });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [exportStatus, setExportStatus] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const header = token || localStorage.getItem('token') || '';
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${header}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal memuat user');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stored = token || localStorage.getItem('token') || '';
    try {
      const url = editingId ? `${API_BASE_URL}/admin/users/${editingId}` : `${API_BASE_URL}/admin/users`;
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { username: form.username, email: form.email, role: form.role, is_active: form.is_active }
        : { ...form };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${stored}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan user');
      }
      setForm({ username: '', email: '', password: '', role: 'user', is_active: true });
      setEditingId(null);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleEdit = (u: User) => {
    setEditingId(u.id);
    setForm({ username: u.username, email: u.email, password: '', role: u.role, is_active: u.is_active });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus user ini?')) return;
    const stored = token || localStorage.getItem('token') || '';
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${stored}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus user');
      }
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleToggleActive = async (u: User) => {
    const stored = token || localStorage.getItem('token') || '';
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${u.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${stored}` },
        body: JSON.stringify({ ...u, is_active: !u.is_active }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengubah status user');
      }
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const fetchCsv = async (endpoint: string, filename: string) => {
    setExportStatus('Mengunduh...');
    try {
      const stored = token || localStorage.getItem('token') || '';
      const res = await fetch(`${API_BASE_URL}/admin${endpoint}`, {
        headers: { Authorization: `Bearer ${stored}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal ekspor');
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setExportStatus('Tidak ada data');
        setTimeout(() => setExportStatus(''), 2000);
        return;
      }
      const headers = Object.keys(data[0]);
      const rows = data.map((row: Record<string, unknown>) => headers.map((h) => String(row[h] ?? '')));
      downloadCsv(filename, headers, rows);
      setExportStatus('Selesai');
      setTimeout(() => setExportStatus(''), 2000);
    } catch (err) {
      setExportStatus(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/80 to-white pb-28">
      <header className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-xl shadow-sm shadow-emerald-900/5 px-5 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-700 text-[28px]">admin_panel_settings</span>
          <h1 className="text-xl font-bold text-emerald-900 tracking-tight">Admin Panel</h1>
        </div>
      </header>

      <main className="pt-24 px-5 space-y-5">
        <div className="flex bg-emerald-100/60 p-1 rounded-xl w-fit">
          <button
            onClick={() => setTab('users')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === 'users' ? 'bg-emerald-700 text-white shadow-md' : 'text-gray-600 hover:bg-emerald-50'
            }`}
          >
            Manajemen User
          </button>
          <button
            onClick={() => setTab('export')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === 'export' ? 'bg-emerald-700 text-white shadow-md' : 'text-gray-600 hover:bg-emerald-50'
            }`}
          >
            Ekspor Data
          </button>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}

        {tab === 'users' && (
          <section className="space-y-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 space-y-3">
              <h3 className="font-bold text-gray-800">{editingId ? 'Edit User' : 'Tambah User'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="h-10 px-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-10 px-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm"
                  required
                />
                {!editingId && (
                  <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="h-10 px-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm"
                    required
                  />
                )}
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="h-10 px-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="accent-emerald-700"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Aktif</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm">
                  {editingId ? 'Simpan Perubahan' : 'Tambah User'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ username: '', email: '', password: '', role: 'user', is_active: true });
                    }}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-emerald-50/30">
                <h3 className="font-bold text-emerald-900">Daftar User ({users.length})</h3>
              </div>
              {loading ? (
                <p className="text-center text-gray-500 text-sm py-8">Memuat...</p>
              ) : users.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-8">Belum ada user</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-left">
                        <th className="px-5 py-3 font-semibold">ID</th>
                        <th className="px-5 py-3 font-semibold">Username</th>
                        <th className="px-5 py-3 font-semibold">Email</th>
                        <th className="px-5 py-3 font-semibold">Role</th>
                        <th className="px-5 py-3 font-semibold">Status</th>
                        <th className="px-5 py-3 font-semibold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((u) => (
                        <tr key={u.id} className={!u.is_active ? 'opacity-60' : ''}>
                          <td className="px-5 py-3 text-gray-700">{u.id}</td>
                          <td className="px-5 py-3 font-medium text-gray-900">{u.username}</td>
                          <td className="px-5 py-3 text-gray-700">{u.email}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {u.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                            <button onClick={() => handleEdit(u)} className="text-blue-600 font-semibold hover:text-blue-800">Edit</button>
                            <button onClick={() => handleToggleActive(u)} className="text-orange-600 font-semibold hover:text-orange-800">
                              {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                            <button onClick={() => handleDelete(u.id)} className="text-red-500 font-semibold hover:text-red-700">Hapus</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {tab === 'export' && (
          <section className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                  <span className="material-symbols-outlined text-2xl">water_drop</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Riwayat Penyiraman</h3>
                  <p className="text-xs text-gray-500">Ekspor seluruh aktivitas penyiraman ke file CSV</p>
                </div>
              </div>
              <button
                onClick={() => fetchCsv('/export/watering', 'watering_logs.csv')}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-sm active:scale-[0.98] transition-all"
              >
                {exportStatus === 'Mengunduh...' ? 'Mengunduh...' : 'Unduh CSV'} Riwayat Penyiraman
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                  <span className="material-symbols-outlined text-2xl">thermostat</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Riwayat Sensor</h3>
                  <p className="text-xs text-gray-500">Ekspor seluruh data sensor (suhu, kelembaban, cahaya, tanah) ke file CSV</p>
                </div>
              </div>
              <button
                onClick={() => fetchCsv('/export/sensors', 'sensor_data.csv')}
                className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold text-sm shadow-sm active:scale-[0.98] transition-all"
              >
                {exportStatus === 'Mengunduh...' ? 'Mengunduh...' : 'Unduh CSV'} Riwayat Sensor
              </button>
            </div>

            {exportStatus && exportStatus !== 'Mengunduh...' && exportStatus !== 'Selesai' && (
              <p className="text-xs text-gray-500 text-center">{exportStatus}</p>
            )}
            {exportStatus === 'Selesai' && (
              <p className="text-xs text-emerald-600 text-center font-medium">Download berhasil!</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
