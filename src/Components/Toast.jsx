import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

/* Icon mapping */
const icons = {
  success: FaCheckCircle,
  error: FaTimesCircle,
  info: FaInfoCircle,
  warn: FaExclamationTriangle,
};

/* Theme-aware accent borders + text */
const accent = {
  success: "border-emerald-400 text-emerald-700",
  error: "border-rose-400 text-rose-700",
  info: "border-sky-400 text-sky-700",
  warn: "border-amber-400 text-amber-800",
};

export default function Toast({ id, type = "info", message, onClose }) {
  const [open, setOpen] = useState(true);
  const Icon = icons[type] || FaInfoCircle;

  /* Auto close */
  useEffect(() => {
    const t = setTimeout(() => setOpen(false), 4500);
    return () => clearTimeout(t);
  }, []);

  /* Remove after exit */
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => onClose(id), 250);
      return () => clearTimeout(t);
    }
  }, [open, id, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.92 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`
            pointer-events-auto
            w-full max-w-md
            rounded-2xl
            glass
            border-l-4
            shadow-xl
            px-4 py-3
            flex items-center gap-3
            ${accent[type]}
          `}
        >
          {/* Icon */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-2xl flex-shrink-0"
          >
            <Icon />
          </motion.div>

          {/* Message */}
          <div className="flex-1 text-sm font-semibold leading-snug">
            {message}
          </div>

          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            className="opacity-60 hover:opacity-100 transition text-lg"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}