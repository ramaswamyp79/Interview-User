import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import UploadModal from "../Components/UploadModal";
import CreateSession from "../Components/CreateSession";

import { Outlet } from "react-router-dom";
import sessionService from "../Services/sessionService";
import { uploadToGCS } from "../utils/gcsUpload";
import { showToast } from "../utils/showToastService";

export default function Layout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  // ⭐ NEW single modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  /* Prevent body scroll on mobile sidebar */
  useEffect(() => {
    if (isMobileOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [isMobileOpen]);

  /* Auto end session when modal closes */
  useEffect(() => {
    if (!isCreateOpen && isSessionActive && currentSessionId) {
      const endSession = async () => {
        try {
          await sessionService.endSession(currentSessionId);
        } catch (error) {
          console.error("Failed to end session implicitly:", error);
        }
      };
      endSession();
      setIsSessionActive(false);
      setCurrentSessionId(null);
    }
  }, [isCreateOpen, isSessionActive, currentSessionId]);

  return (
    // Unified App Shell based on dashboard.css (--body-bg: #f5f8f7)
    <div className="flex h-screen w-full overflow-hidden bg-[#f5f8f7] font-['DM_Sans',sans-serif]">

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Right Side */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Navbar
          setIsMobileOpen={setIsMobileOpen}
          isMobileOpen={isMobileOpen}
          openUpload={() => setUploadOpen(true)}
          openSession={() => setIsCreateOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Upload Resume Modal */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={async ({ file, title }) => {
          try {
            const response = await uploadToGCS(file, title);
            window.dispatchEvent(new Event("resume-updated"));
            return response;
          } catch (error) {
            showToast("error", "Upload failed");
            throw error;
          }
        }}
      />

      {/* Create Session Wizard */}
      <CreateSession
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(session) => {
          const sessionId = session?._id || session?.id;

          if (sessionId) {
            setCurrentSessionId(sessionId);
            setIsSessionActive(true);
          }
        }}
      />
    </div>
  );
}