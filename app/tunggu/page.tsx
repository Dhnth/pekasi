'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Clock, Calendar, BookOpen, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TungguPage() {
  const [openTime, setOpenTime] = useState<string | null>(null)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const fetchOpenTime = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'open_time')
        .single()

      if (!error && data) {
        setOpenTime(data.value)
      }
    }
    fetchOpenTime()
  }, [])

  useEffect(() => {
    if (!openTime) return

    const targetDate = new Date(openTime)
    const interval = setInterval(() => {
      const now = new Date()
      const diff = targetDate.getTime() - now.getTime()

      if (diff <= 0) {
        clearInterval(interval)
        window.location.reload()
        return
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (86400000)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (3600000)) / (1000 * 60)),
        seconds: Math.floor((diff % (60000)) / 1000)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [openTime])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        {/* Icon Animasi */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }}
          className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6"
        >
          <Clock className="w-12 h-12 text-emerald-600" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Form Belum Dibuka</h1>
        <p className="text-gray-500 mb-6">
          Maaf, formulir pengisian literasi sedang ditutup. 
          Silakan tunggu hingga waktu yang telah ditentukan.
        </p>

        {/* Countdown Timer */}
        {openTime && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-center gap-2 text-emerald-600 mb-4">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Akan dibuka pada:</span>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {new Date(openTime).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Jakarta'
              })} WIB
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-emerald-50 rounded-xl p-2">
                <div className="text-2xl font-bold text-emerald-600">{countdown.days}</div>
                <div className="text-xs text-gray-500">Hari</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-2">
                <div className="text-2xl font-bold text-emerald-600">{countdown.hours}</div>
                <div className="text-xs text-gray-500">Jam</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-2">
                <div className="text-2xl font-bold text-emerald-600">{countdown.minutes}</div>
                <div className="text-xs text-gray-500">Menit</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-2">
                <div className="text-2xl font-bold text-emerald-600">{countdown.seconds}</div>
                <div className="text-xs text-gray-500">Detik</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
          <BookOpen className="w-4 h-4" />
          <span>Literasi</span>
        </div>
      </motion.div>
    </div>
  )
}