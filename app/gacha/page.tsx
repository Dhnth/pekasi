'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toWIB } from '@/lib/utils'
import { Calendar, Clock, Gift, RefreshCw, Award, ChevronLeft, Store } from 'lucide-react'
import { motion } from 'framer-motion'

type Peserta = {
  id: number
  nama_lengkap: string
  kelas: string
  judul_buku: string
  isi_kesan: string
  created_at: string
}

export default function GachaPage() {
  const getTodayFormatted = () => {
    const today = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })
    const [day, month, year] = today.split('/')
    return `${year}-${month}-${day}`
  }

  const [tanggalMulai, setTanggalMulai] = useState(getTodayFormatted())
  const [tanggalSelesai, setTanggalSelesai] = useState(getTodayFormatted())
  const [jamMulai, setJamMulai] = useState('00:00')
  const [jamSelesai, setJamSelesai] = useState('23:59')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Peserta | null>(null)
  const [error, setError] = useState('')

  const handleGacha = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    const startDateTime = `${tanggalMulai}T${jamMulai}+07:00`
    const endDateTime = `${tanggalSelesai}T${jamSelesai}+07:00`

    const { data, error: queryError } = await supabase
      .from('peserta')
      .select('*')
      .gte('created_at', startDateTime)
      .lte('created_at', endDateTime)

    if (queryError) {
      setError('Gagal mengambil data: ' + queryError.message)
      setLoading(false)
      return
    }

    if (!data || data.length === 0) {
      setError('Tidak ada peserta dalam rentang waktu yang dipilih.')
      setLoading(false)
      return
    }

    const randomIndex = Math.floor(Math.random() * data.length)
    setResult(data[randomIndex])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/admin" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </a>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3"><Store className='size-6'/> Gacha Literasi</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Filter Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
          <h2 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Filter Waktu (WIB)
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Dari Tanggal</label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Sampai Tanggal</label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Dari Jam</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <input
                    type="time"
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    className="w-full pl-8 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Sampai Jam</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <input
                    type="time"
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                    className="w-full pl-8 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gacha Button */}
        <div className="text-center mb-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleGacha}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl px-8 py-4 rounded-2xl shadow-sm transition flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Mengocok...
              </>
            ) : (
              <>
                <Gift className="w-5 h-5" />
                GACHA!
              </>
            )}
          </motion.button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {/* Result Card */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-emerald-100 shadow-lg overflow-hidden"
          >
            <div className="bg-emerald-600 px-5 py-3 text-white flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="font-semibold">✨ Selamat! ✨</span>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <p className="text-xs text-gray-400">Nama</p>
                <p className="font-medium text-gray-800">{result.nama_lengkap}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Kelas</p>
                <p className="font-medium text-emerald-600">{result.kelas}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Judul Buku</p>
                <p className="text-gray-700">{result.judul_buku}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Kesan yang Mendalam</p>
                <p className="text-gray-600 text-sm italic">&quot;{result.isi_kesan}&quot;</p>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Diinput: {toWIB(result.created_at)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}