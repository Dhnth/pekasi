"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toWIB } from "@/lib/utils";
import * as XLSX from "xlsx-js-style";
import {
  Users,
  Download,
  Filter,
  ChevronRight,
  LogOut,
  BookOpen,
  Calendar,
  Sparkles,
  Loader2,
  FileSpreadsheet,
  Search,
  X,
  Clock,
  FileDown,
  AlertCircle,
  Settings,
  User,
  GraduationCap,
  Bookmark,
  MessageSquare,
  CalendarDays,
  Clock as ClockIcon,
  LoaderPinwheel,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Peserta = {
  id: number;
  nama_lengkap: string;
  kelas: string;
  judul_buku: string;
  isi_kesan: string;
  created_at: string;
};

const PAGE_SIZE = 10;

export default function AdminPage() {
  const router = useRouter();
  const [allData, setAllData] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filterKelas, setFilterKelas] = useState("");
  const [search, setSearch] = useState("");
  const [exportKelas, setExportKelas] = useState("");
  const [errorAlert, setErrorAlert] = useState<{
    show: boolean;
    message: string;
  }>({ show: false, message: "" });
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedPeserta, setSelectedPeserta] = useState<Peserta | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Cek login
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setCheckingAuth(false);
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Ambil SEMUA data dari Supabase
  useEffect(() => {
    if (checkingAuth) return;

    const fetchAllData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("peserta")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAllData(data);
      }
      setLoading(false);
    };
    fetchAllData();
  }, [checkingAuth]);

  // Filter data
  const getFilteredData = useCallback(() => {
    let filtered = allData;
    if (filterKelas && filterKelas !== "semua") {
      filtered = filtered.filter((p) => p.kelas === filterKelas);
    }
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
          p.judul_buku.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return filtered;
  }, [allData, filterKelas, search]);

  const filteredData = getFilteredData();
  const displayData = filteredData.slice(0, page * PAGE_SIZE);
  const hasMore = displayData.length < filteredData.length;
  const totalFiltered = filteredData.length;

  const handleFilterChange = (value: string) => {
    setFilterKelas(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  const showError = (message: string) => {
    setErrorAlert({ show: true, message });
    setTimeout(() => setErrorAlert({ show: false, message: "" }), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("isAdmin");
    router.push("/");
  };

  const openModal = (peserta: Peserta) => {
    setSelectedPeserta(peserta);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPeserta(null);
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          setTimeout(() => {
            setPage((prev) => prev + 1);
            setLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore]);

  // Export Excel
  const exportToExcel = () => {
    let filtered = allData;

    if (exportKelas && exportKelas !== "semua") {
      filtered = filtered.filter((p) => p.kelas === exportKelas);
    }

    if (filtered.length === 0) {
      showError("Tidak ada data untuk diexport");
      return;
    }

    filtered = [...filtered].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const escapeText = (text: string) => {
      return text.replace(/"/g, '""');
    };

    const data = [
      [
        "No",
        "Nama Lengkap",
        "Kelas",
        "Judul Buku",
        "Tanggal Input",
        "Jam Input",
      ],
      ...filtered.map((p, idx) => [
        idx + 1,
        escapeText(p.nama_lengkap),
        escapeText(p.kelas),
        escapeText(p.judul_buku),
        toWIB(p.created_at).split(",")[0],
        toWIB(p.created_at).split(",")[1]?.trim() || "",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws["!cols"] = [
      { wch: 8 },
      { wch: 32 },
      { wch: 18 },
      { wch: 48 },
      { wch: 15 },
      { wch: 12 },
    ];

    ws["!rows"] = [{ hpt: 24 }];

    const headerGreen = "006633";
    const stripeGreen = "F0FFF0";
    const borderColor = "CCCCCC";

    for (let C = 0; C < 6; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11, name: "Calibri" },
        fill: { fgColor: { rgb: headerGreen } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: borderColor } },
          bottom: { style: "thin", color: { rgb: borderColor } },
          left: { style: "thin", color: { rgb: borderColor } },
          right: { style: "thin", color: { rgb: borderColor } },
        },
      };
    }

    for (let R = 1; R < data.length; R++) {
      const isEven = R % 2 === 0;
      const rowGreen = isEven ? stripeGreen : "FFFFFF";

      for (let C = 0; C < 6; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        ws[cellAddress].s = {
          font: { sz: 10, name: "Calibri" },
          fill: { fgColor: { rgb: rowGreen } },
          alignment: {
            horizontal: C === 0 ? "center" : "left",
            vertical: "center",
          },
          border: {
            top: { style: "thin", color: { rgb: borderColor } },
            bottom: { style: "thin", color: { rgb: borderColor } },
            left: { style: "thin", color: { rgb: borderColor } },
            right: { style: "thin", color: { rgb: borderColor } },
          },
        };
      }
    }

    const lastRow = data.length - 1;
    const lastCol = 5;

    for (let C = 0; C <= lastCol; C++) {
      const topCell = XLSX.utils.encode_cell({ r: 0, c: C });
      const bottomCell = XLSX.utils.encode_cell({ r: lastRow, c: C });
      ws[topCell].s.border.top = { style: "medium", color: { rgb: "006633" } };
      ws[bottomCell].s.border.bottom = {
        style: "medium",
        color: { rgb: "006633" },
      };
    }

    for (let R = 0; R <= lastRow; R++) {
      const leftCell = XLSX.utils.encode_cell({ r: R, c: 0 });
      const rightCell = XLSX.utils.encode_cell({ r: R, c: lastCol });
      ws[leftCell].s.border.left = {
        style: "medium",
        color: { rgb: "006633" },
      };
      ws[rightCell].s.border.right = {
        style: "medium",
        color: { rgb: "006633" },
      };
    }

    ws["!freeze"] = { xSplit: 0, ySplit: 1 };

    const wb = XLSX.utils.book_new();
    let sheetName =
      exportKelas && exportKelas !== "semua"
        ? `Literasi_${exportKelas}`
        : "Literasi_Semua_Kelas";
    if (sheetName.length > 31) sheetName = sheetName.slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const today = new Date().toISOString().slice(0, 10);
    const fileName =
      exportKelas && exportKelas !== "semua"
        ? `Laporan_Literasi_${exportKelas}_${today}.xlsx`
        : `Laporan_Literasi_Semua_Kelas_${today}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const kelasList = ["semua", ...new Set(allData.map((p) => p.kelas))];
  const stats = allData.reduce(
    (acc, p) => {
      acc[p.kelas] = (acc[p.kelas] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (checkingAuth || loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Memuat data...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal Detail */}
      <AnimatePresence>
        {modalOpen && selectedPeserta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="bg-emerald-600 text-white p-5 rounded-t-2xl sticky top-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <h2 className="text-lg font-bold">Detail Literasi</h2>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white/80 hover:text-white transition p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body Modal */}
              <div className="p-5 space-y-4">
                {/* Nama */}
                <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <div className="bg-emerald-100 p-2 rounded-xl">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Nama Lengkap</p>
                    <p className="font-semibold text-gray-800">
                      {selectedPeserta.nama_lengkap}
                    </p>
                  </div>
                </div>

                {/* Kelas */}
                <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <div className="bg-emerald-100 p-2 rounded-xl">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Kelas</p>
                    <p className="font-medium text-emerald-600">
                      {selectedPeserta.kelas}
                    </p>
                  </div>
                </div>

                {/* Judul Buku */}
                <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <div className="bg-emerald-100 p-2 rounded-xl">
                    <Bookmark className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Judul Buku</p>
                    <p className="font-medium text-gray-700">
                      {selectedPeserta.judul_buku}
                    </p>
                  </div>
                </div>

                {/* Kesan */}
                <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <div className="bg-emerald-100 p-2 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">Kesan & Pesan</p>
                    <p className="text-gray-600 italic leading-relaxed bg-emerald-50 p-3 rounded-xl mt-1">
                      &quot;{selectedPeserta.isi_kesan}&quot;
                    </p>
                  </div>
                </div>

                {/* Waktu Input */}
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-2 rounded-xl">
                    <CalendarDays className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Waktu Input</p>
                    <div className="flex items-center gap-2 mt-1">
                      <ClockIcon className="w-3 h-3 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        {toWIB(selectedPeserta.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="p-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
                <button
                  onClick={closeModal}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-xl transition"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      <AnimatePresence>
        {errorAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
          >
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="bg-red-100 p-1 rounded-full shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-red-700 text-sm flex-1">
                {errorAlert.message}
              </p>
              <button
                onClick={() => setErrorAlert({ show: false, message: "" })}
                className="text-red-400 hover:text-red-600 transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-xl">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Dashboard Admin</h1>
              <p className="text-xs text-gray-500">Literasi KRP</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/gacha"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-600 font-medium hover:gap-3 transition-all"
            >
              <LoaderPinwheel className="size-4" />
              Buka Gacha
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admin/settings"
              className="text-gray-400 hover:text-emerald-600 transition"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Total Peserta</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{allData.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-medium">Kelas Aktif</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {Object.keys(stats).length}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">
                Filter Kelas
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterKelas}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                >
                  {kelasList.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">
                Cari Nama / Judul Buku
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Ketik nama atau judul buku..."
                  className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                {search && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-400 flex justify-between items-center">
            <span>
              Menampilkan {displayData.length} dari {totalFiltered} data
            </span>
            {search && (
              <span className="flex items-center gap-1">
                <Search className="w-3 h-3" /> Pencarian: &quot;{search}&quot;
              </span>
            )}
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-white rounded-2xl p-4 border border-emerald-100 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 p-2 rounded-xl">
                <FileDown className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 text-sm">
                  Export Data ke Excel
                </h3>
                <p className="text-xs text-gray-500">Pilih kelas lalu export</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <select
                value={exportKelas}
                onChange={(e) => setExportKelas(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
              >
                <option value="">Pilih Kelas untuk Export</option>
                <option value="semua">Semua Kelas</option>
                {kelasList
                  .filter((k) => k !== "semua")
                  .map((k) => (
                    <option key={k}>{k}</option>
                  ))}
              </select>
              <button
                onClick={exportToExcel}
                disabled={!exportKelas}
                className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export ke Excel
              </button>
            </div>
          </div>
        </div>

        {/* Data Cards - Klik untuk lihat detail */}
        <div className="space-y-3">
          {displayData.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.01, 0.2) }}
              onClick={() => openModal(p)}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer hover:border-emerald-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {p.nama_lengkap}
                  </h3>
                  <p className="text-sm text-emerald-600 font-medium">
                    {p.kelas}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                    <Calendar className="w-3 h-3" />
                    {toWIB(p.created_at).split(",")[0]}
                  </p>
                  <p className="text-xs text-gray-300 flex items-center gap-1 justify-end mt-0.5">
                    <Clock className="w-3 h-3" />
                    {toWIB(p.created_at).split(",")[1]?.trim()}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Buku:</span> {p.judul_buku}
                </p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  <span className="font-medium">Kesan:</span> {p.isi_kesan}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loading More Trigger */}
        {displayData.length > 0 && (
          <div ref={observerTarget} className="py-8 flex justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Memuat lebih banyak...</span>
              </div>
            )}
            {!hasMore && totalFiltered > 0 && (
              <p className="text-sm text-gray-400">
                Semua data sudah dimuat ({totalFiltered} data)
              </p>
            )}
          </div>
        )}

        {/* Empty State */}
        {displayData.length === 0 && totalFiltered === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Belum ada data yang cocok</p>
          </div>
        )}

        {/* Gacha Link */}
        <div className="mt-8 text-center"></div>
      </main>
    </div>
  );
}
