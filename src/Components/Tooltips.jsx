import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Tooltip({ targetRef, isVisible, children }) {
  const [style, setStyle] = useState(null);

  useEffect(() => {
    if (!isVisible || !targetRef?.current) return;

    const rect = targetRef.current.getBoundingClientRect();

    const tooltipWidth = 200;
    const spacing = 10;

    // 🔥 EXACTLY below the profile icon
    let top = rect.bottom + spacing;

    // 🔥 center align with profile icon
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;

    // ⛔ clamp inside viewport
    const padding = 8;
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }
    if (left < padding) {
      left = padding;
    }

    setStyle({
      position: "fixed",
      top,
      left,
      width: tooltipWidth,
      zIndex: 9999,
    });
  }, [isVisible, targetRef]);

  if (!isVisible || !style) return null;

  return createPortal(
    <div
      style={style}
      className="
        glass-card rounded-2xl
        border border-white/40
        shadow-2xl
        animate-popup
      "
    >
      {children}
    </div>,
    document.body
  );
}
