import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../assets/logo_AnsweflowAI.jpg.png";

// Assuming you have these or similar endpoints in your authService
// import { verifyEmailCode, resendVerificationCode } from "../Services/authService";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Optionally grab the email passed from the signup page
  const email = location.state?.email || "your registered email";

  /* ---------------- OTP STATE ---------------- */
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const otpRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  /* ---------------- TIMER ---------------- */
  const [timer, setTimer] = useState(120);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  /* ---------------- OTP INPUT LOGIC ---------------- */
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        otpRefs.current[index - 1].focus();
      }
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(paste)) return;
    const pasteArray = paste.split("");
    const newOtp = [...otp];
    pasteArray.forEach((num, idx) => {
      newOtp[idx] = num;
      if (otpRefs.current[idx]) {
        otpRefs.current[idx].value = num;
      }
    });
    setOtp(newOtp);
    // Focus last filled input
    const focusIndex = pasteArray.length < 6 ? pasteArray.length : 5;
    otpRefs.current[focusIndex]?.focus();
  };

  /* ---------------- RESEND OTP ---------------- */
  const resendOtp = async () => {
    try {
      setResendLoading(true);
      // Example API call:
      // await resendVerificationCode({ email });
      
      toast.success("Verification code resent successfully");
      setOtp(new Array(6).fill(""));
      otpRefs.current[0]?.focus();
      setTimer(120);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleVerify = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    try {
      setLoading(true);
      // Example API call:
      // await verifyEmailCode({ email, code: finalOtp });
      
      toast.success("Email verified successfully 🎉");
      navigate("/home", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white md:bg-[#0B1829]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* ═══ LEFT PANEL ═══ */}
      <aside className="hidden md:flex w-1/2 flex-col bg-[#0B1829] relative overflow-hidden px-12 pt-16 items-center justify-start h-full">
        {/* Gradients */}
        <div className="absolute -top-20 -left-24 w-[480px] h-[480px] lp-bg-top pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-20 w-[320px] h-[320px] lp-bg-bottom pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md animate-fadeSlideUpUI text-left mt-10">
          <p className="text-lg font-semibold italic text-[#2DD4BF] mb-8">
            Secure your account
          </p>

          <div className="bg-[#152842] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#2DD4BF]/10 border-2 border-[#2DD4BF] flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#E8F4FF] mb-3">Almost there!</h3>
            <p className="text-base text-slate-300 leading-relaxed opacity-90">
              Verifying your email ensures you have uninterrupted access to AnswerFlow AI's interview practice tools and helps us keep your account secure.
            </p>
          </div>
        </div>
      </aside>

      {/* ═══ RIGHT PANEL (Verification Form) ═══ */}
      <main className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-10 h-full overflow-y-auto">
        <div className="w-full max-w-md animate-formFadeSlide mt-auto mb-auto">
          
          {/* Brand Block */}
          <div className="text-center mb-8">
            <div className="inline-block mb-3">
              <img src={logo} alt="AnswerFlowAI Logo" className="w-16 h-16 object-contain rounded-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              AnswerFlow<span className="text-[#2DD4BF]">AI</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">AI-Powered Interview Practice</p>
          </div>

          {/* Form Area */}
          <div className="animate-fadeSlideUpUI">
            <h2 className="text-xl font-bold text-slate-900">Verify Your Email</h2>
            <p className="text-sm text-slate-500 mt-1 mb-5 leading-relaxed">
              We sent a 6-digit code to <strong className="text-slate-800">{email}</strong>. Check your inbox.
            </p>

            <div className="flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-lg p-3 mb-5 text-sm text-slate-600">
              <svg className="flex-shrink-0 text-teal-500 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              The code expires in 10 minutes. Check spam if you don't see it.
            </div>

            {/* OTP Inputs */}
            <form onSubmit={handleVerify}>
              <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={`w-14 h-14 text-center text-2xl font-bold rounded-lg border-2 outline-none transition-all duration-200 focus:bg-white focus:ring-4 focus:ring-green-500/10 ${
                      digit ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-green-500'
                    }`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3.5 bg-[#30e5cd] text-white rounded-full text-base font-bold shadow-lg shadow-green-500/20 transition-all hover:bg-[#2DD4BF] hover:shadow-xl hover:shadow-green-500/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </form>

            {/* Resend Section */}
            <div className="text-center text-sm text-slate-500 mt-5">
              Didn't receive it?{" "}
              {timer > 0 ? (
                <span className="text-slate-400">Resend code in {formatTime()}</span>
              ) : (
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={resendLoading}
                  className="text-[#2DD4BF] font-semibold hover:opacity-75 transition-opacity"
                >
                  {resendLoading ? "Sending..." : "Resend code"}
                </button>
              )}
            </div>

            {/* Change Email Link */}
            <button
              onClick={() => navigate("/signup")}
              className="flex items-center justify-center gap-1.5 w-full mt-6 text-sm text-slate-500 hover:text-[#2DD4BF] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Change email address
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;