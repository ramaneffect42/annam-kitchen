"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

const MESSAGES = [
  "Analyzing biometric profile...",
  "Calculating optimal macro ratios...",
  "Filtering chef-crafted recipes...",
  "Finalizing your custom meal matrix...",
]

const TOTAL_MS = 3500

export function LoadingOverlay({ onComplete }: { onComplete: () => void }) {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const interval = TOTAL_MS / MESSAGES.length
    const timers = MESSAGES.map((_, i) =>
      setTimeout(() => setMsgIndex(i), i * interval),
    )
    const done = setTimeout(onComplete, TOTAL_MS)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(done)
    }
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-black/40 backdrop-blur-lg"
      role="status"
      aria-live="polite"
    >
      {/* Spinner ring */}
      <div className="relative flex size-20 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full border-4 border-white/20 border-t-white"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <motion.span
          className="size-3 rounded-full bg-white"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </div>

      {/* Cycling text */}
      <div className="flex h-8 items-center px-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="text-center text-base font-medium text-white text-balance"
          >
            {MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
