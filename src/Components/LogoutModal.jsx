import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function LogoutModal({ close }) {
  const navigate = useNavigate();
  const { logout } = useAuth0();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("interview_email");
    sessionStorage.removeItem("interview_email");
    logout({
      logoutParams: {
        returnTo: window.location.origin + "/login",
      },
    });
    close();
  };

  return (
    <div className="
      fixed inset-0 bg-black/60 backdrop-blur-md 
      flex items-center justify-center z-[200]
    ">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="
          bg-white w-[90%] max-w-md p-6 rounded-2xl relative
        "
      >
        {/* Close Icon */}
        <button
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/40"
          onClick={close}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold theme-text">
          Confirm Logout
        </h2>

        <p className="mt-3 text-gray-700">
          Are you sure you want to logout?
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={close}
            className="
              flex-1 py-2 rounded-xl glass 
              text-gray-700 font-medium shadow
            "
          >
            Cancel
          </button>

          <button
            onClick={handleLogout}
            className="
              flex-1 py-2 rounded-xl 
              bg-red-500 text-white font-semibold shadow
              hover:scale-[1.03] transition
            "
          >
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
}
