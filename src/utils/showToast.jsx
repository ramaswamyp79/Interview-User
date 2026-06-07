import React, { useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";

const toastStyles = {
  success: {
    label: "Success",
    Icon: CheckCircle2,
    className: "success",
  },
  error: {
    label: "Error",
    Icon: XCircle,
    className: "error",
  },
  info: {
    label: "Info",
    Icon: Info,
    className: "info",
  },
  warning: {
    label: "Warning",
    Icon: AlertTriangle,
    className: "warning",
  },
};

const Toast = ({ id, message, type = "info", onClose }) => {
  const config = toastStyles[type] || toastStyles.info;
  const ToastIcon = config.Icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 2800);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      className={`app-toast ${config.className}`}
      role="status"
      aria-live="polite"
    >
      <span className="app-toast-glow" />

      <div className="app-toast-icon">
        <ToastIcon className="h-5 w-5" />
      </div>

      <div className="app-toast-content">
        <div className="app-toast-label">
          <Sparkles className="h-3 w-3" />
          {config.label}
        </div>

        <div className="app-toast-message">{message}</div>
      </div>

      <button
        type="button"
        onClick={() => onClose(id)}
        className="app-toast-close"
        aria-label="Close toast"
      >
        <X className="h-4 w-4" />
      </button>

      <span className="app-toast-progress" />
    </div>
  );
};

export default Toast;