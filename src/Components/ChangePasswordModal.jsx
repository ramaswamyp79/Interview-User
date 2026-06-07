import React, { useState } from "react";
import { motion } from "framer-motion";
import { changePassword } from "../Services/authService";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const ChangePasswordModal = ({ onClose }) => {

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {

    if (form.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (form.newPassword !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {

      setLoading(true);

      const res = await changePassword(form);

      toast.success(res.message || "Password changed successfully");

      // backend already clears cookie
      window.location.href = "/login";

    } catch (err) {

      toast.error(err?.response?.data?.message || "Something went wrong");

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
      >

        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Change Password
        </h2>

        <div className="space-y-4">

          {/* NEW PASSWORD */}

          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <span
              className="absolute right-3 top-2.5 cursor-pointer"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          {/* CONFIRM PASSWORD */}

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <span
              className="absolute right-3 top-2.5 cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <AiOutlineEyeInvisible />
              ) : (
                <AiOutlineEye />
              )}
            </span>
          </div>

        </div>

        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm theme-primary text-white disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

        </div>

      </motion.div>

    </div>
  );
};

export default ChangePasswordModal;