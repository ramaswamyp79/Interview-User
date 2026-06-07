import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { LogOut, X } from "lucide-react";

export default function LogoutModal({ close }) {
  const { logout } = useAuth0();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !loggingOut) {
        close?.();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [close, loggingOut]);

  const handleClose = () => {
    if (loggingOut) return;
    close?.();
  };

  const handleLogout = () => {
    if (loggingOut) return;

    setLoggingOut(true);
    localStorage.removeItem("token");

    logout({
      logoutParams: {
        returnTo: `${window.location.origin}/login`,
      },
    });

    close?.();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="confirm-modal-overlay"
      role="presentation"
      onClick={handleClose}
    >
      <div
        className="confirm-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="confirm-close-btn"
          onClick={handleClose}
          disabled={loggingOut}
          aria-label="Close logout confirmation"
        >
          <X />
        </button>

        <div className="confirm-modal-body">
          <div className="confirm-icon-wrap">
            <LogOut />
          </div>

          <h3 id="logout-modal-title" className="confirm-modal-title">
            Confirm Logout
          </h3>

          <p className="confirm-message">
            Are you sure you want to logout? You will need to sign in again to
            continue using AnswerFlow AI.
          </p>

          <div className="confirm-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-cancel-soft"
              disabled={loggingOut}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="btn-confirm-danger"
              disabled={loggingOut}
            >
              {loggingOut && (
                <span className="confirm-btn-spinner" aria-hidden="true" />
              )}
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}