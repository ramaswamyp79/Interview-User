import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MenuIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const PlusIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M10 4v12M4 10h12" />
  </svg>
);

const UploadIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M10 13V4M6 8l4-4 4 4" />
    <path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2" />
  </svg>
);

export default function Navbar({
  setIsMobileOpen,
  openUpload,
  isMobileOpen,
  openSession,
  openTrial,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const pathname = location.pathname;

  const getPageName = () => {
    if (pathname === "/" || pathname === "/home") return "Dashboard";
    if (pathname.includes("buy-credits")) return "Buy Interview Credits";
    if (pathname.includes("live")) return "Live Interview";
    if (pathname.includes("mock")) return "Mock Interview";
    if (pathname.includes("interview") || pathname.includes("sessions")) {
      return "Interview Sessions";
    }
    if (pathname.includes("resume")) return "CV / Resume";
    if (pathname.includes("download")) return "Download App";
    if (pathname.includes("support")) return "Email Support";
    if (pathname.includes("profile")) return "Profile";
    return "Dashboard";
  };

  const isResumePage = pathname.includes("resume");

  const handleStartTrial = () => {
    if (typeof openTrial === "function") {
      openTrial();
      return;
    }

    navigate("/mock");
  };

  return (
    <header className="topbar">
      <button
        type="button"
        className={`hamburger ${isMobileOpen ? "is-open" : ""}`}
        onClick={() => setIsMobileOpen((prev) => !prev)}
        aria-label={isMobileOpen ? "Close sidebar" : "Open sidebar"}
      >
        <MenuIcon />
      </button>

      <div className="topbar-title">{getPageName()}</div>

      <div className="topbar-actions">
        {/* <button type="button" className="theme-toggle">
          Dark Mode
        </button> */}

        {isResumePage ? (
          <button type="button" className="btn-teal" onClick={openUpload}>
            <UploadIcon />
            Upload Resume
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn-outline"
              onClick={handleStartTrial}
            >
              Start Trial
            </button>

            <button type="button" className="btn-dark" onClick={openSession}>
              <PlusIcon />
              Start Session
            </button>
          </>
        )}
      </div>
    </header>
  );
}