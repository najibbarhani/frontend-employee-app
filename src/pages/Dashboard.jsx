import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  LogOut,
  Briefcase,
  RefreshCw,
  Trash2,
  Search,
  Users,
  UserPlus,
} from "lucide-react";
import api from "../api/axios";

export default function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // State Form Buat Tugas Baru
  const [newTaskId, setNewTaskId] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // State Manajemen Pegawai & Tab
  const [userList, setUserList] = useState([]);
  const [activeTab, setActiveTab] = useState("TASKS"); // 'TASKS' atau 'USERS'
  const [newUser, setNewUser] = useState({
    id: "",
    nama: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    jabatan: "",
  });

  // 1. Ambil daftar tugas dari backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks/my-tasks");
      setTasks(res.data.data);
      setError("");
    } catch (err) {
      setError("Gagal memuat daftar tugas dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. Ambil daftar semua pegawai (Khusus Admin)
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUserList(res.data.data);
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
    }
  };

  useEffect(() => {
    if (user.role === "ADMIN") {
      fetchUsers();
    }
  }, [user.role]);

  // 3. Update status tugas
  const handleUpdateStatus = async (taskId, nextStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: nextStatus });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengubah status tugas.");
    }
  };

  // 4. Submit tugas baru (Admin)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/tasks", {
        id: newTaskId,
        judul_tugas: newTaskTitle,
        deskripsi: newTaskDesc,
        deadline: newTaskDeadline ? new Date(newTaskDeadline).toISOString() : null,
        userId: user.id,
      });

      setNewTaskId("");
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskDeadline("");
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal membuat tugas baru.");
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Hapus tugas (Admin)
  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus tugas ${taskId}?`);
    if (!confirmDelete) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus tugas.");
    }
  };

  // 6. Submit pegawai baru (Admin)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users", newUser);
      alert("Pegawai baru berhasil ditambahkan!");
      setNewUser({ id: "", nama: "", email: "", password: "", role: "EMPLOYEE", jabatan: "" });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambahkan pegawai.");
    }
  };

  // Ringkasan status kartu
  const countPending = tasks.filter((t) => t.status === "PENDING").length;
  const countInProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const countDone = tasks.filter((t) => t.status === "DONE").length;

  // Logika filter search & tombol status
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.judul_tugas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.deskripsi && task.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "ALL" ? true : task.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Dashboard */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-7 h-7 text-blue-500" />
              Sistem Manajemen Tugas & Pegawai
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Selamat datang kembali, <span className="font-semibold text-white">{user.nama_lengkap || user.nama}</span> ({user.jabatan})
            </p>

            {/* Tab Navigasi Khusus Admin */}
            {user.role === "ADMIN" && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveTab("TASKS")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
                    activeTab === "TASKS" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> Manajemen Tugas
                </button>
                <button
                  onClick={() => setActiveTab("USERS")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
                    activeTab === "USERS" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4" /> Manajemen Pegawai
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono font-bold rounded-lg uppercase">
              {user.role} : {user.id}
            </span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Ringkasan Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase">Pending</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{countPending}</h3>
            </div>
            <Clock className="w-8 h-8 text-amber-500/40" />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase">In Progress</p>
              <h3 className="text-2xl font-bold text-blue-400 mt-1">{countInProgress}</h3>
            </div>
            <RefreshCw className="w-8 h-8 text-blue-500/40" />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase">Done</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{countDone}</h3>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
          </div>
        </div>

        {/* ==================== TAB 1: MANAJEMEN TUGAS ==================== */}
        {activeTab === "TASKS" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {user.role === "ADMIN" && (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg h-fit">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-blue-400" />
                  Buat Tugas Baru
                </h2>
                <form onSubmit={handleCreateTask} className="space-y-3 text-sm">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ID Tugas (Unique)</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: T02"
                      value={newTaskId}
                      onChange={(e) => setNewTaskId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Judul Tugas</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama pekerjaan/tugas"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Deskripsi</label>
                    <textarea
                      rows="3"
                      placeholder="Rincian detail tugas..."
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Deadline</label>
                    <input
                      type="date"
                      value={newTaskDeadline}
                      onChange={(e) => setNewTaskDeadline(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50"
                  >
                    {submitting ? "Menyimpan..." : "Tambah Tugas"}
                  </button>
                </form>
              </div>
            )}

            {/* Kolom Daftar Tabel Tugas */}
            <div className={`${user.role === "ADMIN" ? "lg:col-span-2" : "lg:col-span-3"} bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Daftar Tugas Saya</h2>
                <button
                  onClick={fetchTasks}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  title="Muat ulang data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
                </button>
              </div>

              {error && (
                <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari judul / deskripsi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                  {["ALL", "PENDING", "IN_PROGRESS", "DONE"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        filterStatus === status ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {status === "ALL" ? "Semua" : status}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTasks.length === 0 && !loading ? (
                <div className="text-center py-12 text-slate-500 text-sm">Belum ada tugas yang ditugaskan kepada Anda.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-3">Kode</th>
                        <th className="py-3 px-3">Judul & Deskripsi</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Aksi</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800">
                      {filteredTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 font-mono text-xs text-blue-400 font-bold">{task.id}</td>
                          <td className="py-3 px-3">
                            <p className="font-semibold text-white">{task.judul_tugas}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{task.deskripsi || "-"}</p>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${
                                task.status === "DONE"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : task.status === "IN_PROGRESS"
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {task.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex gap-2">
                              {task.status !== "IN_PROGRESS" && task.status !== "DONE" && (
                                <button
                                  onClick={() => handleUpdateStatus(task.id, "IN_PROGRESS")}
                                  className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs rounded transition-colors"
                                >
                                  Mulai
                                </button>
                              )}
                              {task.status !== "DONE" && (
                                <button
                                  onClick={() => handleUpdateStatus(task.id, "DONE")}
                                  className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs rounded transition-colors"
                                >
                                  Selesai
                                </button>
                              )}
                              {user.role === "ADMIN" && (
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded transition-colors"
                                  title="Hapus Tugas"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: MANAJEMEN PEGAWAI ==================== */}
        {activeTab === "USERS" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Tambah Pegawai (Kiri) */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit">
              <h3 className="text-white font-bold flex items-center gap-2 mb-4 text-base">
                <UserPlus className="w-5 h-5 text-blue-500" /> Tambah Pegawai Baru
              </h3>
              <form onSubmit={handleCreateUser} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">ID Pegawai (Unique)</label>
                  <input
                    type="text"
                    placeholder="Contoh: P02 atau A02"
                    value={newUser.id}
                    onChange={(e) => setNewUser({ ...newUser, id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    placeholder="Nama lengkap pegawai"
                    value={newUser.nama}
                    onChange={(e) => setNewUser({ ...newUser, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="pegawai@perusahaan.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="******"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Jabatan</label>
                  <input
                    type="text"
                    placeholder="Misal: IT Support / Staff Teknis"
                    value={newUser.jabatan}
                    onChange={(e) => setNewUser({ ...newUser, jabatan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="EMPLOYEE">EMPLOYEE (Pegawai Biasa)</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors mt-2"
                >
                  Simpan Pegawai
                </button>
              </form>
            </div>

            {/* Tabel Daftar Pegawai (Kanan) */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
              <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> Daftar Seluruh Pegawai
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-3">ID</th>
                      <th className="py-3 px-3">Nama</th>
                      <th className="py-3 px-3">Email</th>
                      <th className="py-3 px-3">Jabatan</th>
                      <th className="py-3 px-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {userList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-semibold text-blue-400">{u.id}</td>
                        <td className="py-3 px-3 font-medium text-white">{u.nama_lengkap || u.nama}</td>
                        <td className="py-3 px-3 text-slate-400">{u.email}</td>
                        <td className="py-3 px-3">{u.jabatan}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === "ADMIN" ? "bg-purple-600/20 text-purple-400" : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}