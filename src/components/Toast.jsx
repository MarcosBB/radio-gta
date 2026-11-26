import { AnimatePresence, motion } from 'motion/react'

export default function Toast({ toast }) {
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[max(16px,env(safe-area-inset-top))] z-50 flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111] shadow-lg"
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
