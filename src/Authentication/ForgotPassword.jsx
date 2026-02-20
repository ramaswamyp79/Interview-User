
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import signupImg from "../assets/2.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // await sendPasswordResetEmail({ email });
      setTimeout(() => {
        setLoading(false);
        toast.success("If this email exists, a reset link has been sent.");
      }, 1200);
    } catch (err) {
      setLoading(false);
      toast.error("Failed to send reset email.");
    }
  };

  return (
    <div className="relative min-h-screen theme-bg flex items-center justify-center overflow-hidden">
      {/* Animated Floating Blobs */}
      <div className="absolute w-[500px] h-[500px] bg-white/20 rounded-full blur-3xl animate-blob -top-20 -left-20"></div>
      <div className="absolute w-[500px] h-[500px] bg-white/10  blur-3xl animate-blob animation-delay-2000 -bottom-20 -right-10"></div>

      <div className="w-[100%] h-full max-h-[1000px] grid lg:grid-cols-[0.53fr_0.47fr] shadow-2xl overflow-hidden glass">

        {/* Left Side Image */}
        <div className="hidden lg:flex items-center justify-center bg-black/20 backdrop-blur-xl w-full">
          <img
            src={signupImg}
            alt="Forgot Password"
            className="w-full h-full object-fill opacity-90"
          />
        </div>

        {/* Right Panel */}
        <div className="flex flex-col justify-start lg:px-20 py-5 px-5 glass overflow-y-auto">
          {/* Logo & Title */}
          <div className="mb-5 text-center mt-3">
            <h1 className="text-4xl font-extrabold tracking-tight theme-text drop-shadow-sm">
              Intervue
            </h1>
            <p className="text-gray-700 mt-2 text-base font-medium italic">
              AI-Powered Interview Practice
            </p>
            <p className="text-indigo-700 font-semibold mt-1 text-sm tracking-wide">
              Forgot your password?
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6 lg:px-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-base font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full mt-1 px-4 py-3 rounded-xl bg-white/70 border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-400"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full theme-primary py-3 text-lg rounded-xl shadow-xl hover:scale-[1.03] active:scale-95 transition font-semibold"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {/* Navigation Links */}
          <p className="text-center text-gray-700 text-base mt-3">
            Remembered your password?{' '}
            <span
              className="text-indigo-700 font-semibold hover:underline cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;