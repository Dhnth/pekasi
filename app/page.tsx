'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BookOpen, Send, CheckCircle, Sparkles, AlertCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const KELAS_X = [
  'X AKL 1', 'X AKL 2',
  'X PM 1', 'X PM 2', 'X PM 3',
  'X MPLB 1', 'X MPLB 2', 'X MPLB 3',
  'X PPLG 1', 'X PPLG 2',
  'X BS 1', 'X BS 2',
  'X DKV 1', 'X DKV 2'
]

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formStatus, setFormStatus] = useState<'loading' | 'open' | 'closed'>('loading')
  const [error, setError] = useState<{ show: boolean; message: string }>({ show: false, message: '' })
  const [form, setForm] = useState({
    nama: '',
    kelas: '',
    judul: '',
    kesan: ''
  })

  // Cek status form dari database
  useEffect(() => {
    const checkFormStatus = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'form_status')
        .single()

      if (!error && data) {
        if (data.value === 'closed') {
          router.push('/tunggu')
        } else {
          setFormStatus('open')
        }
      }
      setFormStatus('open')
    }
    checkFormStatus()
  }, [router])

  const showError = (message: string) => {
    setError({ show: true, message })
    setTimeout(() => setError({ show: false, message: '' }), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error: supabaseError } = await supabase.from('peserta').insert({
      nama_lengkap: form.nama,
      kelas: form.kelas,
      judul_buku: form.judul,
      isi_kesan: form.kesan
    })

    setLoading(false)

    if (supabaseError) {
      showError('Gagal menyimpan: ' + supabaseError.message)
    } else {
      setSuccess(true)
      setForm({ nama: '', kelas: '', judul: '', kesan: '' })
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  if (formStatus === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    )
  }

  if (formStatus === 'closed') {
    return null // Redirect sudah terjadi di useEffect
  }

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence>
        {error.show && (
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
              <p className="text-red-700 text-sm flex-1">{error.message}</p>
              <button
                onClick={() => setError({ show: false, message: '' })}
                className="text-red-400 hover:text-red-600 transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-emerald-600 text-white py-6 px-4 shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Literasi</h1>
              <p className="text-emerald-100 text-sm">Bagikan buku favoritmu</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder="Tulis namamu..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kelas
            </label>
            <select
              required
              value={form.kelas}
              onChange={(e) => setForm({ ...form, kelas: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">Pilih kelas...</option>
              {KELAS_X.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul Buku
            </label>
            <input
              type="text"
              required
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Contoh: Laskar Pelangi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bagian yang paling berkesan
            </label>
            <textarea
              required
              maxLength={355}
              rows={4}
              value={form.kesan}
              onChange={(e) => setForm({ ...form, kesan: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              placeholder="Ceritakan bagian yang paling kamu suka dari buku ini..."
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {form.kesan.length}/355 karakter
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>Menyimpan...</>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Kirim Literasi
              </>
            )}
          </motion.button>
        </form>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-4 right-4 max-w-md mx-auto bg-emerald-500 text-white rounded-xl p-4 shadow-lg flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Terima kasih! Data literasimu sudah tersimpan</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center">
          <a
            href="/kesan-buku"
            className="inline-flex items-center gap-2 text-emerald-600 text-sm hover:underline"
          >
            📖 Lihat semua kesan buku dari peserta
          </a>
        </div>
      </main>
    </div>
  )
}