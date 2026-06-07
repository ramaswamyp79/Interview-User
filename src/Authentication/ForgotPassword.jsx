import React, { useState } from "react";
import { forgotPassword } from "../Services/authService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../assets/logo_AnsweflowAI.jpg.png";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const res = await forgotPassword({ email });

      if (res?.message) {
        toast.success(res.message || "OTP sent to email");
        // navigate after success
        navigate("/reset-password", {
          state: { email },
          replace: true
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Reusable Tailwind classes
  const inputStyles = "w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm text-slate-900 bg-slate-50 outline-none transition-all duration-200 placeholder-slate-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 appearance-none";
  const labelStyles = "text-sm font-medium text-slate-900";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white md:bg-[#0B1829]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* ═══ LEFT PANEL ═══ */}
      <aside className="hidden md:flex w-1/2 flex-col bg-[#0B1829] relative overflow-hidden px-12 pt-16 items-center justify-start h-full">
        <div className="absolute -top-20 -left-24 w-[480px] h-[480px] lp-bg-top pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-20 w-[320px] h-[320px] lp-bg-bottom pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md animate-fadeSlideUpUI text-left mt-10">
          <p className="text-lg font-semibold italic text-[#2DD4BF] mb-8">
            Reset your password in 3 steps
          </p>

          <div className="flex flex-col">
            {/* Step 1 (Active) */}
            <div className="flex gap-4 relative pb-7">
              <div className="absolute left-5 top-11 w-[2px] h-[calc(100%-16px)] bg-gradient-to-b from-[#2DD4BF] to-[#2DD4BF]/10"></div>
              <div className="w-10 h-10 rounded-full bg-[#2DD4BF] text-[#0B1829] shadow-[0_0_0_4px_rgba(45,212,191,0.2)] flex items-center justify-center text-sm font-bold flex-shrink-0 relative z-10">
                1
              </div>
              <div className="pt-2">
                <p className="text-base font-semibold text-[#2DD4BF] mb-1">Enter your email</p>
                <p className="text-sm text-slate-400 leading-relaxed">We'll send a 6-digit verification code to your registered email address.</p>
              </div>
            </div>

            {/* Step 2 (Inactive) */}
            <div className="flex gap-4 relative pb-7">
              <div className="absolute left-5 top-11 w-[2px] h-[calc(100%-16px)] bg-gradient-to-b from-[#2DD4BF]/10 to-[#2DD4BF]/5"></div>
              <div className="w-10 h-10 rounded-full bg-[#152842] border-2 border-[#2DD4BF] text-[#2DD4BF] flex items-center justify-center text-sm font-bold flex-shrink-0 relative z-10">
                2
              </div>
              <div className="pt-2">
                <p className="text-base font-semibold text-[#E8F4FF] mb-1">Verify the code</p>
                <p className="text-sm text-slate-400 leading-relaxed">Check your inbox and enter the one-time code to confirm it's you.</p>
              </div>
            </div>

            {/* Step 3 (Inactive) */}
            <div className="flex gap-4 relative">
              <div className="w-10 h-10 rounded-full bg-[#152842] border-2 border-[#2DD4BF] text-[#2DD4BF] flex items-center justify-center text-sm font-bold flex-shrink-0 relative z-10">
                3
              </div>
              <div className="pt-2">
                <p className="text-base font-semibold text-[#E8F4FF] mb-1">Create new password</p>
                <p className="text-sm text-slate-400 leading-relaxed">Choose a strong new password to secure your AnswerFlow AI account.</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ RIGHT PANEL ═══ */}
      <main className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-10 h-full overflow-y-auto">
        <div className="w-full max-w-md animate-formFadeSlide mt-auto mb-auto">
          
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="inline-block mb-3">
              <img src={logo} alt="AnswerFlowAI Logo" className="w-16 h-16 object-contain rounded-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              AnswerFlow<span className="text-[#2DD4BF]">AI</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">AI-Powered Interview Practice</p>
          </div>

          {/* Step Dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-2 w-6 rounded-md bg-green-500 transition-all duration-300"></div>
            <div className="h-2 w-2 rounded-full bg-slate-200 transition-all duration-300"></div>
            <div className="h-2 w-2 rounded-full bg-slate-200 transition-all duration-300"></div>
          </div>

          {/* Content */}
          <div className="animate-fadeSlideUpUI">
            <h2 className="text-xl font-bold text-slate-900">Forgot Password?</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6 leading-relaxed">
              No worries! Enter your registered email and we'll send you a reset code.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className={labelStyles} htmlFor="resetEmail">Email address</label>
                <input
                  type="email"
                  id="resetEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className={inputStyles}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3.5 bg-[#30e5cd] text-white rounded-full text-base font-bold shadow-lg shadow-green-500/20 transition-all hover:bg-[#2DD4BF] hover:shadow-xl hover:shadow-green-500/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>

            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-1.5 w-full mt-6 text-sm text-slate-500 hover:text-[#2DD4BF] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Login
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;