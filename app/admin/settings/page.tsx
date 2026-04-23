'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { wibToUTC, utcToWIBForInput } from '@/lib/utils'
import { ToggleLeft, ToggleRight, Calendar, Clock, Save, AlertCircle, X, Loader2, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formStatus, setFormStatus] = useState<'open' | 'closed'>('closed')
  const [openTime, setOpenTime] = useState('')
  const [error, setError] = useState<{ show: boolean; message: string }>({ show: false, message: '' })

  const showError = (message: string) => {
    setError({ show: true, message })
    setTimeout(() => setError({ show: false, message: '' }), 3000)
  }

  // Cek login dengan Supabase Session
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
      if (timeData && timeData.value) {
        // Konversi UTC dari database ke WIB untuk ditampilkan di input
        const wibTime = utcToWIBForInput(timeData.value)
        setOpenTime(wibTime)
      } else {
        // Default: besok jam 06:30 WIB
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(6, 30, 0, 0)
        // Konversi ke WIB string
        const year = tomorrow.getFullYear()
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
        const day = String(tomorrow.getDate()).padStart(2, '0')
        const hours = String(tomorrow.getHours()).padStart(2, '0')
        const minutes = String(tomorrow.getMinutes()).padStart(2, '0')
        setOpenTime(`${year}-${month}-${day}T${hours}:${minutes}`)
      }
      setLoading(false)
      setCheckingAuth(false)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('isAdmin')
    router.push('/')
  }

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
    
    // Konversi WIB ke UTC sebelum disimpan
    const openTimeUTC = wibToUTC(openTime)
    
    const { error: timeError } = await supabase
      .from('settings')
      .update({ value: openTimeUTC, updated_at: new Date().toISOString() })
      .eq('key', 'open_time')
    
    if (timeError) {
      showError('Gagal menyimpan waktu: ' + timeError.message)
    } else {
      showError('Pengaturan berhasil disimpan!')
      // Refresh data setelah save
      setTimeout(() => window.location.reload(), 1500)
    }
    
    setSaving(false)
  }

  if (checkingAuth || loading) return (
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
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-gray-400 hover:text-gray-600 transition text-sm"
            >
              Dashboard
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

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Status Formulir
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
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
              Pilih waktu dalam WIB. Contoh: 24 April 2026 jam 06:30
            </p>
          </div>

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

        <div className="mt-4 text-center text-xs text-gray-400">
          <p>Halaman pengaturan ini hanya bisa diakses oleh admin</p>
        </div>
      </main>
    </div>
  )
}