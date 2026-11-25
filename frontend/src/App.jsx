import { useCallback, useEffect, useState } from 'react';
import {
  Archive,
  Camera,
  Clock,
  Edit3,
  Lock,
  LogOut,
  MapPin,
  Navigation,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  X,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const DIVISIONS = ['AUV', 'ROV', 'KRSTI', 'KKI'];
const TOKEN_KEY = 'lab_robotik_token';
const USER_KEY = 'lab_robotik_user';

const EMPTY_FORM = {
  itemName: '',
  storagePlace: '',
  division: 'AUV',
  note: '',
  location: 'Lab Robotik — Gedung Teknik',
  evidenceImage: '',
};

function formatDateTime(dateInput) {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function stampEvidenceImage(file, locationText) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 960;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const barHeight = Math.max(52, Math.round(height * 0.11));
        ctx.fillStyle = 'rgba(24, 24, 27, 0.78)';
        ctx.fillRect(0, height - barHeight, width, barHeight);

        const timestamp = new Intl.DateTimeFormat('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'medium',
        }).format(new Date());

        const fontSize = Math.max(13, Math.round(width * 0.018));
        ctx.fillStyle = '#ffffff';
        ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(timestamp, 14, height - barHeight + fontSize + 8);

        ctx.fillStyle = '#fca5a5';
        ctx.font = `500 ${Math.max(12, fontSize - 1)}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(locationText || 'Lab Robotik', 14, height - 10);

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [division, setDivision] = useState('AUV');
  const [role, setRole] = useState('ANGGOTA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body =
        mode === 'login'
          ? { username: username.trim(), password }
          : {
              username: username.trim(),
              password,
              fullName: fullName.trim(),
              division,
              role,
            };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(json.message)
          ? json.message.join(', ')
          : json.message || 'Autentikasi gagal';
        throw new Error(msg);
      }

      onAuthSuccess(json.data.accessToken, json.data.user);
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Gagal terhubung ke server backend (pastikan backend berjalan di port 3000).'
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-sm font-bold text-white">
            LR
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-stone-900">
            Inventaris Lab Robotik
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Masuk untuk mencatat dan melihat penyimpanan barang divisi AUV · ROV · KRSTI · KKI
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs">
          {/* Tab Switch */}
          <div className="mb-5 grid grid-cols-2 rounded-lg bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`rounded-md py-1.5 text-xs font-medium transition ${
                mode === 'login'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`rounded-md py-1.5 text-xs font-medium transition ${
                mode === 'register'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-700">
                  Nama Lengkap Anggota
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Reynard Pratama"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-red-600 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-stone-700">
                Username
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: reynard_auv"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-stone-700">
                Password
              </label>
              <input
                type="password"
                required
                minLength={mode === 'register' ? 6 : 1}
                placeholder={mode === 'register' ? 'Minimal 6 karakter' : 'Masukkan password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-red-600 focus:outline-none"
              />
            </div>

            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-700">
                    Divisi Robotik
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-red-600 focus:outline-none"
                  >
                    {DIVISIONS.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-700">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-red-600 focus:outline-none"
                  >
                    <option value="ANGGOTA">Anggota</option>
                    <option value="PENGURUS">Pengurus</option>
                  </select>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <p className="text-[11px] leading-relaxed text-stone-500">
                <strong>Anggota</strong> hanya melihat barang divisinya sendiri.{' '}
                <strong>Pengurus</strong> dapat melihat dan mengelola barang semua divisi.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              <Lock className="h-4 w-4" />
              {loading
                ? 'Memproses...'
                : mode === 'login'
                  ? 'Masuk ke Lab'
                  : 'Daftar & Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    scope: 'ALL',
    totalItems: 0,
    byDivision: [],
  });
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showFormMobile, setShowFormMobile] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const isPengurus = user?.role === 'PENGURUS';

  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setSelectedDivision(newUser.role === 'PENGURUS' ? 'ALL' : newUser.division);
    setForm({ ...EMPTY_FORM, division: newUser.division });
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken('');
    setUser(null);
    setItems([]);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }, []);

  const fetchData = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (isPengurus && selectedDivision !== 'ALL') {
        params.set('division', selectedDivision);
      }
      if (search.trim()) params.set('search', search.trim());

      const headers = { Authorization: `Bearer ${token}` };

      const [itemsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/items${params.toString() ? `?${params}` : ''}`, { headers }),
        fetch(`${API_URL}/items/stats`, { headers }),
      ]);

      if (itemsRes.status === 401 || statsRes.status === 401) {
        handleLogout();
        return;
      }

      if (!itemsRes.ok || !statsRes.ok) {
        throw new Error('Gagal memuat data dari server backend');
      }

      const itemsJson = await itemsRes.json();
      const statsJson = await statsRes.json();
      setItems(itemsJson.data || []);
      if (statsJson.data) setStats(statsJson.data);
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Gagal terhubung ke server backend (pastikan backend NestJS berjalan di port 3000).'
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  }, [token, user, isPengurus, selectedDivision, search, handleLogout]);

  useEffect(() => {
    if (!token || !user) return;
    const timer = setTimeout(() => {
      fetchData();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchData, token, user]);

  if (!token || !user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser tidak mendukung GPS. Ketik lokasi secara manual.');
      return;
    }
    setDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        setForm((prev) => ({
          ...prev,
          location: `Lab Robotik (${lat}, ${lng})`,
        }));
        setDetectingLoc(false);
      },
      () => {
        setError('Izin lokasi ditolak. Silakan ketik lokasi ruangan secara manual.');
        setDetectingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const stamped = await stampEvidenceImage(file, form.location);
      setForm((prev) => ({ ...prev, evidenceImage: stamped }));
    } catch {
      setError('Gagal memproses gambar evidence.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const url = editingId ? `${API_URL}/items/${editingId}` : `${API_URL}/items`;
      const method = editingId ? 'PATCH' : 'POST';

      const payload = {
        itemName: form.itemName.trim(),
        storagePlace: form.storagePlace.trim(),
        ...(isPengurus ? { division: form.division } : {}),
        note: form.note.trim(),
        location: form.location.trim(),
        ...(form.evidenceImage ? { evidenceImage: form.evidenceImage } : {}),
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const json = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(json.message)
          ? json.message.join(', ')
          : json.message || 'Gagal menyimpan barang';
        throw new Error(msg);
      }

      setSuccessMsg(
        editingId
          ? 'Data barang berhasil diperbarui.'
          : 'Barang berhasil disimpan ke inventaris lab.',
      );
      setForm({ ...EMPTY_FORM, division: user.division });
      setEditingId(null);
      setShowFormMobile(false);
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      itemName: item.itemName,
      storagePlace: item.storagePlace,
      division: item.division,
      note: item.note,
      location: item.location,
      evidenceImage: item.evidenceImage || '',
    });
    setShowFormMobile(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (item) => {
    const ok = window.confirm(
      `Hapus "${item.itemName}" (${item.storagePlace}) dari inventaris lab?`,
    );
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/items/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error('Gagal menghapus barang');
      setSuccessMsg(`"${item.itemName}" berhasil dihapus.`);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, division: user.division });
    setShowFormMobile(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white">
              LR
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-stone-900 sm:text-base">
                Inventaris Lab Robotik
              </h1>
              <p className="text-[11px] text-stone-500">
                {isPengurus
                  ? 'Mode Pengurus · Akses Semua Divisi'
                  : `Divisi ${user.division} · Akses Khusus Divisi`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 sm:flex">
              {isPengurus ? (
                <Shield className="h-3.5 w-3.5 text-red-600" />
              ) : (
                <User className="h-3.5 w-3.5 text-stone-500" />
              )}
              <span className="text-xs font-medium text-stone-800">{user.fullName}</span>
              <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                {isPengurus ? 'PENGURUS' : user.division}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowFormMobile((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700 lg:hidden"
            >
              {showFormMobile ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span className="hidden xs:inline">{showFormMobile ? 'Tutup' : 'Tambah'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Keluar"
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Statistik */}
        <section
          className={`mb-6 grid gap-3 ${
            isPengurus ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2'
          }`}
        >
          <button
            type="button"
            onClick={() => isPengurus && setSelectedDivision('ALL')}
            className={`rounded-xl border p-4 text-left transition ${
              isPengurus ? 'col-span-2 sm:col-span-1' : ''
            } ${
              !isPengurus || selectedDivision === 'ALL'
                ? 'border-red-600 bg-white ring-1 ring-red-600'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <p className="text-xs font-medium text-stone-500">
              {isPengurus ? 'Total Semua Divisi' : `Total Barang Divisi ${user.division}`}
            </p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">{stats.totalItems}</p>
          </button>

          {isPengurus ? (
            stats.byDivision.map((d) => {
              const active = selectedDivision === d.division;
              return (
                <button
                  key={d.division}
                  type="button"
                  onClick={() =>
                    setSelectedDivision((prev) => (prev === d.division ? 'ALL' : d.division))
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    active
                      ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold tracking-wide ${
                        active ? 'text-red-700' : 'text-stone-500'
                      }`}
                    >
                      {d.division}
                    </span>
                    {active && <span className="h-2 w-2 rounded-full bg-red-600" />}
                  </div>
                  <p className="mt-1 text-2xl font-semibold text-stone-900">{d.count}</p>
                </button>
              );
            })
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4">
              <div>
                <p className="text-xs font-medium text-stone-500">Akun Aktif</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">{user.fullName}</p>
                <p className="text-xs text-stone-500">@{user.username}</p>
              </div>
              <span className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                Divisi {user.division}
              </span>
            </div>
          )}
        </section>

        {/* Notifikasi */}
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-3 text-red-500 hover:text-red-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 shadow-xs">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              {successMsg}
            </span>
            <button
              onClick={() => setSuccessMsg('')}
              className="ml-3 text-stone-400 hover:text-stone-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Form Input */}
          <section className={`lg:col-span-4 ${showFormMobile ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-20 rounded-xl border border-stone-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-3">
                <h2 className="text-sm font-semibold text-stone-900">
                  {editingId ? 'Edit Data Barang' : 'Catat Penyimpanan Barang'}
                </h2>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-xs font-medium text-stone-500 hover:text-red-600"
                  >
                    Batal
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-700">
                    Nama Barang
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Baterai LiPo 4S 5200mAh"
                    value={form.itemName}
                    onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-700">
                    Tempat Penyimpanan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Lemari A, Rak 2"
                    value={form.storagePlace}
                    onChange={(e) => setForm({ ...form, storagePlace: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-red-600 focus:outline-none"
                  />
                </div>

                {isPengurus ? (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-700">
                      Divisi Tujuan
                    </label>
                    <select
                      value={form.division}
                      onChange={(e) => setForm({ ...form, division: e.target.value })}
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-red-600 focus:outline-none"
                    >
                      {DIVISIONS.map((div) => (
                        <option key={div} value={div}>
                          {div}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600">
                    Disimpan oleh <strong className="text-stone-900">{user.fullName}</strong> ·
                    Divisi <strong className="text-red-700">{user.division}</strong>
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-700">
                    Lokasi
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ruangan lab / koordinat"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-red-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={detectingLoc}
                      title="Deteksi GPS otomatis"
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-stone-300 bg-stone-50 px-3 text-xs font-medium text-stone-700 transition hover:border-red-600 hover:text-red-600 disabled:opacity-50"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      {detectingLoc ? '...' : 'GPS'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-700">
                    Catatan (Note)
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Keterangan kondisi atau posisi barang agar anggota lain tidak bingung..."
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-700">
                    Foto Evidence (Stempel Jam & Lokasi)
                  </label>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50/70 px-4 py-4 text-center transition hover:border-red-500 hover:bg-red-50/30">
                    <Camera className="mb-1 h-5 w-5 text-red-600" />
                    <span className="text-xs font-medium text-stone-700">
                      Ambil Foto atau Pilih Gambar
                    </span>
                    <span className="mt-0.5 text-[11px] text-stone-400">
                      Otomatis tercatat jam & lokasi penyimpanan
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {form.evidenceImage && (
                    <div className="relative mt-2.5 overflow-hidden rounded-lg border border-stone-200">
                      <img
                        src={form.evidenceImage}
                        alt="Preview Evidence"
                        className="max-h-44 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, evidenceImage: '' })}
                        className="absolute top-2 right-2 rounded-md bg-white/90 p-1 text-stone-700 shadow hover:bg-red-600 hover:text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {submitting
                    ? 'Menyimpan...'
                    : editingId
                      ? 'Simpan Perubahan'
                      : 'Simpan Barang'}
                </button>
              </form>
            </div>
          </section>

          {/* Daftar Barang */}
          <section className="lg:col-span-8">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari nama barang, lemari, anggota, atau catatan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white py-2 pr-3 pl-9 text-sm text-stone-900 placeholder-stone-400 focus:border-red-600 focus:outline-none"
                />
              </div>

              {isPengurus && (
                <div className="flex flex-wrap gap-1.5">
                  {['ALL', ...DIVISIONS].map((div) => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => setSelectedDivision(div)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        selectedDivision === div
                          ? 'bg-red-600 text-white'
                          : 'border border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900'
                      }`}
                    >
                      {div === 'ALL' ? 'Semua' : div}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="rounded-xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
                Memuat data inventaris...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center">
                <Archive className="mx-auto mb-2.5 h-8 w-8 text-stone-300" />
                <p className="text-sm font-medium text-stone-700">Belum ada barang tersimpan</p>
                <p className="mt-1 text-xs text-stone-500">
                  Catat barang pertama melalui form agar anggota lab lain mudah menemukannya.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:border-stone-300"
                  >
                    {item.evidenceImage ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(item)}
                        className="group relative h-44 w-full overflow-hidden border-b border-stone-100 bg-stone-100"
                      >
                        <img
                          src={item.evidenceImage}
                          alt={item.itemName}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                        <span className="absolute top-2.5 left-2.5 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-stone-900 shadow-xs">
                          {item.storagePlace}
                        </span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                          <Archive className="h-3.5 w-3.5 text-red-600" />
                          {item.storagePlace}
                        </span>
                        <span className="text-[11px] text-stone-400">Tanpa foto</span>
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold leading-snug text-stone-900">
                          {item.itemName}
                        </h3>
                        <span className="shrink-0 rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                          {item.division}
                        </span>
                      </div>

                      <p className="mb-3 rounded-lg bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-600">
                        {item.note}
                      </p>

                      <div className="mt-auto space-y-1.5 border-t border-stone-100 pt-3 text-xs text-stone-500">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                          <span className="truncate">
                            <strong className="font-medium text-stone-800">{item.memberName}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" />
                          <span className="truncate">{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                          <span>{formatDateTime(item.storedAt)}</span>
                        </div>
                      </div>

                      <div className="mt-3.5 flex gap-2 border-t border-stone-100 pt-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white py-1.5 text-xs font-medium text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Lightbox Preview Foto */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl"
          >
            <img
              src={previewImage.evidenceImage}
              alt={previewImage.itemName}
              className="max-h-[75vh] w-full bg-stone-950 object-contain"
            />
            <div className="flex items-center justify-between gap-4 p-4">
              <div>
                <h4 className="text-sm font-semibold text-stone-900">{previewImage.itemName}</h4>
                <p className="text-xs text-stone-500">
                  {previewImage.storagePlace} · {previewImage.memberName} ({previewImage.division})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
