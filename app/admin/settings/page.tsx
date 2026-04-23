'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ToggleLeft, ToggleRight, Calendar, Clock, Save, AlertCircle, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formStatus, setFormStatus] = useState<'open' | 'closed'>('closed')
  const [openTime, setOpenTime] = useState('')
  const [error, setError] = useState<{ show: boolean; message: string }>({ show: false, message: '' })

  const showError = (message: string) => {
    setError({ show: true, message })
    setTimeout(() => setError({ show: false, message: '' }), 3000)
  }

  // Cek login
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      
      // Ambil data settings
      const { data: statusData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'form_status')
        .single()
      
      const { data: timeData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'open_time')
        .single()
      
      if (statusData) setFormStatus(statusData.value as 'open' | 'closed')
      if (timeData) {
        // Format datetime-local dari timestamp
        const date = new Date(timeData.value)
        setOpenTime(date.toISOString().slice(0, 16))
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    
    // Update form_status
    const { error: statusError } = await supabase
      .from('settings')
      .update({ value: formStatus, updated_at: new Date().toISOString() })
      .eq('key', 'form_status')
    
    if (statusError) {
      showError('Gagal menyimpan status: ' + statusError.message)
      setSaving(false)
      return
    }
    
    // Update open_time (konversi ke WIB)
    const openTimeISO = new Date(openTime).toISOString()
    const { error: timeError } = await supabase
      .from('settings')
      .update({ value: openTimeISO, updated_at: new Date().toISOString() })
      .eq('key', 'open_time')
    
    if (timeError) {
      showError('Gagal menyimpan waktu: ' + timeError.message)
    } else {
      showError('Pengaturan berhasil disimpan!')
    }
    
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-gray-500">Memuat pengaturan...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence>
        {error.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
          >
            <div className={`rounded-2xl p-4 shadow-lg flex items-center gap-3 ${
              error.message.includes('berhasil') 
                ? 'bg-emerald-50 border border-emerald-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`p-1 rounded-full ${
                error.message.includes('berhasil') ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                <AlertCircle className={`w-5 h-5 ${
                  error.message.includes('berhasil') ? 'text-emerald-600' : 'text-red-600'
                }`} />
              </div>
              <p className={`text-sm flex-1 ${
                error.message.includes('berhasil') ? 'text-emerald-700' : 'text-red-700'
              }`}>
                {error.message}
              </p>
              <button
                onClick={() => setError({ show: false, message: '' })}
                className="text-gray-400 hover:text-gray-600 transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-xl">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Pengaturan</h1>
              <p className="text-xs text-gray-500">Buka/Tutup Form Literasi</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-400 hover:text-gray-600 transition text-sm"
          >
            Kembali
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          {/* Status Form */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Status Formulir
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFormStatus('open')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition ${
                  formStatus === 'open'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-emerald-300'
                }`}
              >
                <ToggleRight className="w-5 h-5" />
                <span className="font-medium">Buka</span>
              </button>
              <button
                onClick={() => setFormStatus('closed')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition ${
                  formStatus === 'closed'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-red-300'
                }`}
              >
                <ToggleLeft className="w-5 h-5" />
                <span className="font-medium">Tutup</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {formStatus === 'open' 
                ? 'Formulir akan terbuka untuk umum' 
                : 'Formulir akan ditutup, pengunjung akan dialihkan ke halaman tunggu'}
            </p>
          </div>

          {/* Waktu Pembukaan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Waktu Pembukaan (WIB)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="datetime-local"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Waktu yang ditampilkan di halaman tunggu
            </p>
          </div>

          {/* Tombol Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>

        {/* Info Tambahan */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>Halaman pengaturan ini hanya bisa diakses oleh admin</p>
        </div>
      </main>
    </div>
  )
}