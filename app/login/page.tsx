'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Lock, ArrowRight, Loader2, AlertCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ show: boolean; message: string }>({ show: false, message: '' })
  const router = useRouter()

  const showError = (message: string) => {
    setError({ show: true, message })
    setTimeout(() => setError({ show: false, message: '' }), 3000)
  }

  const handleLogin = async () => {
    setLoading(true)

    // Login dengan email fixed + password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: 'fathangunawan19@gmail.com',
      password: password,
    })

    setLoading(false)

    if (signInError) {
      showError('Password salah! Coba lagi.')
    } else {
      localStorage.setItem('isAdmin', 'true')
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Area Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Masukkan password admin</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Masukkan password..."
              autoFocus
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              disabled={loading}
              className="bg-emerald-600 text-white px-5 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            </motion.button>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Email: fathangunawan19@gmail.com
          </p>
        </div>
      </motion.div>
    </div>
  )
}