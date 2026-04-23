'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { BookOpen, Calendar, Clock, ChevronLeft, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { toWIB } from '@/lib/utils'
import Link from 'next/link'

type Peserta = {
  id: number
  nama_lengkap: string
  kelas: string
  judul_buku: string
  isi_kesan: string
  created_at: string
}

export default function KesanBukuPage() {
  const [data, setData] = useState<Peserta[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('peserta')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setData(data)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredData = data.filter(p => 
    p.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
    p.judul_buku.toLowerCase().includes(search.toLowerCase()) ||
    p.kelas.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500">Memuat kesan buku...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-600 text-white py-5 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/80 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <BookOpen className="w-6 h-6" />
            <h1 className="text-xl font-bold">Kesan & Pesan Buku</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, kelas, atau judul buku..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
          />
        </div>

        {/* List Kesan Buku */}
        <div className="space-y-4">
          {filteredData.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.3) }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{p.nama_lengkap}</h3>
                  <p className="text-sm text-emerald-600 font-medium">{p.kelas}</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {toWIB(p.created_at).split(',')[0]}
                  </p>
                  <p className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {toWIB(p.created_at).split(',')[1]?.trim()}
                  </p>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">📖 Buku:</span> {p.judul_buku}
                </p>
              </div>
              
              <div className="bg-emerald-50 rounded-xl p-4 border-l-4 border-emerald-500">
                <p className="text-sm text-gray-700 italic leading-relaxed">
                  &quot;{p.isi_kesan}&quot;
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Belum ada data kesan buku</p>
          </div>
        )}
      </main>
    </div>
  )
}