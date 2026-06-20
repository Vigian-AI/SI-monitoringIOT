import { useState, type FormEvent } from 'react';
import { API_BASE_URL } from '../config/api';

interface LoginResponse {
  message: string;
  user: { id: number; username: string; email: string; role: string };
  token: string;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login gagal');
      }

      const data: LoginResponse = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/80 to-white flex flex-col items-center justify-center relative overflow-hidden px-5">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-80 h-80 bg-emerald-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-60 h-60 bg-emerald-100/40 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-full h-40 rounded-2xl overflow-hidden shadow-md mb-5">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAC5ftqfLQgI3feEYqaZRfnepV9AYd819MXN-coVMrE1IKfd7WOmfwo0UNUUfCzIysccLxedENPacFJADMr9W_tJOTQPKDXtXwdl9iXVJlb2mwbzCp92h-_rQWQkHKMckDR4G1MTrZtpV0ErM7EDZuFtK7PqRDzrbfbSnDuIkdc98MOx-LZ_E2_pkZ5d-Qr_--crHz4mVuQ0qouvjFAnx2WkegdRkQm6GIwmQ6NJq_Ym3EJuXVthIaPEByRv7s8mj1Nqh8V5V2qWkam"
              alt="Floratech"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-700 text-3xl">eco</span>
            <h1 className="text-2xl font-bold text-emerald-800 tracking-tight">Floratech</h1>
          </div>
          <p className="text-gray-600 font-medium">Selamat Datang Kembali</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">person</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full h-12 pl-10 pr-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-10 pr-10 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-emerald-700 text-white rounded-xl font-bold text-base shadow-lg active:scale-[0.98] transition-all hover:bg-emerald-800 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            ) : (
              <>Masuk <span className="material-symbols-outlined text-lg">arrow_forward</span></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
