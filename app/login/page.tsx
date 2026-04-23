'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ArrowRight, AlertCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const router = useRouter()

  const handleLogin = () => {
    const adminPassword = "adadeh"
    
    if (password === adminPassword) {
      localStorage.setItem('isAdmin', 'true')
      router.push('/admin')
    } else {
      setAlertMessage('Password salah! Coba lagi ya.')
      setShowAlert(true)
      // Auto close setelah 2 detik
      setTimeout(() => setShowAlert(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Custom Alert Modal */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm"
          >
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="bg-red-100 p-1 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-red-700 text-sm flex-1">{alertMessage}</p>
              <button
                onClick={() => setShowAlert(false)}
                className="text-red-400 hover:text-red-600 transition"
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
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Area Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Kamu hebat bisa nemuin halaman ini!</p>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password Rahasia
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
              className="bg-emerald-600 text-white px-5 rounded-xl hover:bg-emerald-700 transition"
            >
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Hint: Tanya panitia ya
          </p>
        </div>
      </motion.div>
    </div>
  )
}