import React from "react";

const toastStyles = {
  success: {
    bg: "theme-primary",
    icon: "🎉",
    subText: "Welcome back 👋",
  },
  error: {
    bg: "bg-gradient-to-r from-rose-500 via-red-500 to-orange-500",
    icon: "❌",
    subText: "Please try again",
  },
  info: {
    bg: "bg-gradient-to-r from-sky-500 to-indigo-500",
    icon: "ℹ️",
    subText: "",
  },
};

const AppToast = ({ t, type = "success", message }) => {
  const config = toastStyles[type];

  return (
    <div
      className={`relative flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl
      ${config.bg} text-white overflow-hidden
      transition-all duration-500 transform
      ${t.visible ? "animate-popup scale-100 opacity-100" : "scale-90 opacity-0"}`}
    >
      {/* ✨ Glow */}
      <div className="absolute inset-0 opacity-30 blur-2xl bg-gradient-to-r from-indigo-500 via-sky-400 to-teal-400 animate-pulse"></div>

      {/* Icon */}
      <div className="relative z-10 flex items-center justify-center w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
        <span className="text-xl">{config.icon}</span>
      </div>

      {/* Text */}
      <div className="relative z-10">
        <p className="font-semibold text-lg">{message}</p>
        {config.subText && (
          <p className="text-sm text-white/80">{config.subText}</p>
        )}
      </div>

      {/* Ping dot */}
      <div className="absolute right-3 top-3 w-2 h-2 bg-white/70 rounded-full animate-ping"></div>
    </div>
  );
};

export default AppToast;