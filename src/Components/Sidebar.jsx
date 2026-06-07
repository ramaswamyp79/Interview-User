import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import LogoutModal from "../Components/LogoutModal.jsx";
import { getProfile } from "../Services/userService";

import logo from "../assets/logo_AnsweflowAI.jpg.png";

const HomeIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10L10 3l7 7M5 8.5V17h4v-4h2v4h4V8.5" />
  </svg>
);

const SessionsIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="14" height="14" rx="2" />
    <path d="M7 8h6M7 12h4" />
  </svg>
);

const LiveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2" />
    <path d="M6.34 17.66a8 8 0 010-11.31" />
    <path d="M17.66 17.66a8 8 0 000-11.31" />
    <path d="M3.51 20.49a13 13 0 010-16.97" />
    <path d="M20.49 20.49a13 13 0 000-16.97" />
  </svg>
);

const MockIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="14" height="14" rx="2" />
    <path d="M7 10l2 2 4-4" />
  </svg>
);

const ResumeIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="12" height="15" rx="2" />
    <path d="M7 7h6M7 10h6M7 13h4" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 14V4M6 10l4 4 4-4" />
    <path d="M3 16v1a1 1 0 001 1h12a1 1 0 001-1v-1" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
    <path d="M3 8l7 5 7-5" />
  </svg>
);

const CreditIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="16" height="11" rx="2" />
    <path d="M2 9h16" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="7" r="3" />
    <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 10H3M3 10l3-3M3 10l3 3" />
    <path d="M9 6V4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2" />
  </svg>
);

const CollapseIcon = () => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M13 5L8 10l5 5" />
  </svg>
);

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [credits, setCredits] = useState(() => Number(localStorage.getItem("credits")) || 0);
  const [profileName, setProfileName] = useState(
    localStorage.getItem("userName") ||
      localStorage.getItem("name") ||
      localStorage.getItem("fullName") ||
      "User"
  );

  const menuItems = useMemo(
    () => [
      {
        name: "Home",
        tooltip: "Home",
        path: "/home",
        activePaths: ["/", "/home"],
        icon: <HomeIcon />,
      },
      {
        name: "Interview Sessions",
        tooltip: "Interview Sessions",
        path: "/interview",
        activePaths: ["/interview", "/sessions"],
        icon: <SessionsIcon />,
      },
      {
        name: "Live Interview",
        tooltip: "Live Interview",
        path: "/live-interview",
        activePaths: ["/live", "/live-interview", "/answerflow-live-interview"],
        icon: <LiveIcon />,
      },
      {
        name: "Mock Interview",
        tooltip: "Mock Interview",
        path: "/mock",
        activePaths: ["/mock", "/mock-interview"],
        icon: <MockIcon />,
      },
      {
        name: "CV / Resume",
        tooltip: "CV / Resume",
        path: "/resume",
        activePaths: ["/resume"],
        icon: <ResumeIcon />,
      },
      {
        type: "divider",
      },
      {
        name: "Download Desktop App",
        tooltip: "Download App",
        path: "/download",
        activePaths: ["/download"],
        icon: <DownloadIcon />,
      },
      {
        name: "Email Support",
        tooltip: "Email Support",
        path: "/support",
        activePaths: ["/support"],
        icon: <MailIcon />,
      },
    ],
    []
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(false);
      } else {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsMobileOpen]);

  useEffect(() => {
    const handleCreditsUpdate = (event) => {
      const newCredits = event.detail?.credits;

      if (typeof newCredits === "number") {
        setCredits(newCredits);
        localStorage.setItem("credits", String(newCredits));
      }
    };

    window.addEventListener("creditsUpdated", handleCreditsUpdate);
    return () => window.removeEventListener("creditsUpdated", handleCreditsUpdate);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (!mounted) return;

        const serverCredits = Number(profile?.credits ?? 0);
        const serverName =
          profile?.fullName ||
          profile?.name ||
          profile?.user?.fullName ||
          profile?.user?.name ||
          profile?.firstName ||
          "User";

        setCredits(serverCredits);
        setProfileName(serverName);

        localStorage.setItem("credits", String(serverCredits));
        localStorage.setItem("userName", serverName);
      } catch (error) {
        console.error("Failed to load profile for sidebar:", error);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const isActiveItem = (item) => {
    const pathname = location.pathname;

    return item.activePaths?.some((activePath) => {
      if (activePath === "/") return pathname === "/";
      return pathname === activePath || pathname.startsWith(`${activePath}/`);
    });
  };

  const closeMobileSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  };

  const handleProfileClick = () => {
    closeMobileSidebar();
    navigate("/profile");
  };

  const handleGetCredit = () => {
    closeMobileSidebar();
    navigate("/buy-credits");
  };

  return (
    <>
      <aside
        id="sidebar"
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="sidebar-logo">
          <div className="logo-mark">
            <img src={logo} alt="AnswerFlow AI" />
          </div>

          <span className="logo-text hide-collapsed">
            AnswerFlow<span>AI</span>
          </span>

          <button
            type="button"
            className="collapse-btn"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <CollapseIcon />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => {
            if (item.type === "divider") {
              return <div key={`divider-${index}`} className="sidebar-divider" />;
            }

            const active = isActiveItem(item);

            return (
              <NavLink
                key={item.name}
                to={item.path}
                data-tooltip={item.tooltip}
                onClick={closeMobileSidebar}
                className={`nav-item ${active ? "active" : ""}`}
              >
                {item.icon}
                <span className="hide-collapsed">{item.name}</span>
                <span className="sidebar-tooltip">{item.tooltip}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="credit-card" id="creditCard">
          <div className="credit-card-label">
            <CreditIcon />
            <span>Interview Credit</span>
          </div>

          <div className="credit-count">
            {credits !== null && credits !== undefined ? credits : "—"} interview credits
          </div>

          <button type="button" className="btn-get-credit" onClick={handleGetCredit}>
            Get Credit
          </button>
        </div>

        <div className="sidebar-footer">
          <button type="button" className="profile-row" onClick={handleProfileClick}>
            <div className="avatar">
              <UserIcon />
            </div>

            <div className="profile-info hide-collapsed">
              <div className="profile-name">{profileName}</div>
              <div className="profile-sub">View Profile</div>
            </div>
          </button>

          <button
            type="button"
            className="logout-row"
            onClick={() => {
              closeMobileSidebar();
              setShowLogout(true);
            }}
          >
            <LogoutIcon />
            <span className="hide-collapsed">Logout</span>
          </button>
        </div>
      </aside>

      {showLogout && <LogoutModal close={() => setShowLogout(false)} />}
    </>
  );
}