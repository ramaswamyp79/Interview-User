import React, { useState, useEffect, useRef } from "react";
import { resetPassword, forgotPassword } from "../Services/authService";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../assets/logo_AnsweflowAI.jpg.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email]);

  // UI Flow State (2 = OTP, 3 = Password, 4 = Success)
  const [uiStep, setUiStep] = useState(2);

  /* ---------------- OTP STATE ---------------- */
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const otpRefs = useRef([]);

  /* ---------------- PASSWORD STATE ---------------- */
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  /* ---------------- RESET ALL FIELDS ---------------- */
  const resetFields = () => {
    setOtp(new Array(6).fill(""));
    setNewPassword("");
    setConfirmPassword("");
    otpRefs.current.forEach((input) => {
      if (input) input.value = "";
    });
    otpRefs.current[0]?.focus();
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
  };

  /* ---------------- RESEND OTP ---------------- */
  const resendOtp = async () => {
    try {
      setResendLoading(true);
      await forgotPassword({ email });
      toast.success("OTP resent successfully");
      resetFields();
      setTimer(120);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  /* ---------------- FLOW & SUBMIT ---------------- */
  const verifyOtpAndProceed = () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    setUiStep(3); // Move to password screen
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join("");

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await resetPassword({
        email,
        otp: finalOtp,
        newPassword,
        confirmPassword,
      });
      // Success! Move to UI Step 4
      setUiStep(4);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  // Visual Strength Calc
  const calculateStrength = (pwd) => {
    let strength = 0;
    if (pwd.length > 5) strength += 1;
    if (pwd.length > 8) strength += 1;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return strength;
  };
  const strength = calculateStrength(newPassword);

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
            {/* Step 1 (Done) */}
            <div className="flex gap-4 relative pb-7">
              <div className="absolute left-5 top-11 w-[2px] h-[calc(100%-16px)] bg-gradient-to-b from-[#2DD4BF] to-[#2DD4BF]"></div>
              <div className="w-10 h-10 rounded-full bg-[#152842] border-2 border-[#2DD4BF] text-[#2DD4BF] flex items-center justify-center text-sm font-bold flex-shrink-0 relative z-10">
                ✓
              </div>
              <div className="pt-2 opacity-60">
                <p className="text-base font-semibold text-[#E8F4FF] mb-1">Enter your email</p>
                <p className="text-sm text-slate-400 leading-relaxed">We'll send a 6-digit verification code to your registered email address.</p>
              </div>
            </div>

            {/* Step 2 (Active or Done) */}
            <div className="flex gap-4 relative pb-7">
              <div className={`absolute left-5 top-11 w-[2px] h-[calc(100%-16px)] bg-gradient-to-b ${uiStep >= 3 ? 'from-[#2DD4BF] to-[#2DD4BF]' : 'from-[#2DD4BF] to-[#2DD4BF]/10'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 relative z-10 ${uiStep === 2 ? 'bg-[#2DD4BF] text-[#0B1829] shadow-[0_0_0_4px_rgba(45,212,191,0.2)]' : 'bg-[#152842] border-2 border-[#2DD4BF] text-[#2DD4BF]'}`}>
                {uiStep > 2 ? '✓' : '2'}
              </div>
              <div className={`pt-2 ${uiStep > 2 ? 'opacity-60' : ''}`}>
                <p className={`text-base font-semibold mb-1 ${uiStep === 2 ? 'text-[#2DD4BF]' : 'text-[#E8F4FF]'}`}>Verify the code</p>
                <p className="text-sm text-slate-400 leading-relaxed">Check your inbox and enter the one-time code to confirm it's you.</p>
              </div>
            </div>

            {/* Step 3 (Active or Inactive) */}
            <div className="flex gap-4 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 relative z-10 ${uiStep >= 3 ? 'bg-[#2DD4BF] text-[#0B1829] shadow-[0_0_0_4px_rgba(45,212,191,0.2)]' : 'bg-[#152842] border-2 border-[#2DD4BF] text-[#2DD4BF]'}`}>
                3
              </div>
              <div className="pt-2">
                <p className={`text-base font-semibold mb-1 ${uiStep >= 3 ? 'text-[#2DD4BF]' : 'text-[#E8F4FF]'}`}>Create new password</p>
                <p className="text-sm text-slate-400 leading-relaxed">Choose a strong new password to secure your AnswerFlow AI account.</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ RIGHT PANEL ═══ */}
      <main className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-10 h-full overflow-y-auto">
        <div className="w-full max-w-md mt-auto mb-auto">
          
          {/* Form wrapper */}
          <div className={`${uiStep === 4 ? 'hidden' : 'block'}`}>
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
              <div className="h-2 w-2 rounded-full bg-[#2DD4BF] transition-all duration-300"></div>
              <div className={`h-2 rounded-full transition-all duration-300 ${uiStep === 2 ? 'w-6 bg-green-500' : 'w-2 bg-[#2DD4BF]'}`}></div>
              <div className={`h-2 rounded-full transition-all duration-300 ${uiStep === 3 ? 'w-6 bg-green-500' : 'w-2 bg-slate-200'}`}></div>
            </div>
          </div>

          {/* ══ SCREEN 2: OTP ══ */}
          {uiStep === 2 && (
            <div className="animate-fadeSlideUpUI">
              <h2 className="text-xl font-bold text-slate-900">Enter Verification Code</h2>
              <p className="text-sm text-slate-500 mt-1 mb-5 leading-relaxed">
                We sent a 6-digit code to <strong className="text-slate-800">{email}</strong>. Check your inbox.
              </p>

              <div className="flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-lg p-3 mb-5 text-sm text-slate-600">
                <svg className="flex-shrink-0 text-teal-500 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                The code expires in 10 minutes. Check spam if you don't see it.
              </div>

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
                    className={`w-14 h-14 text-center text-2xl font-bold rounded-lg border-2 outline-none transition-all duration-200 focus:bg-white focus:ring-4 focus:ring-green-500/10 ${digit ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-green-500'}`}
                  />
                ))}
              </div>

              <button
                onClick={verifyOtpAndProceed}
                className="w-full px-6 py-3.5 bg-[#30e5cd] text-white rounded-full text-base font-bold shadow-lg shadow-green-500/20 transition-all hover:bg-[#2DD4BF] hover:shadow-xl hover:shadow-green-500/20 active:scale-[0.98]"
              >
                Verify Code
              </button>

              <div className="text-center text-sm text-slate-500 mt-4">
                Didn't receive it?{" "}
                {timer > 0 ? (
                  <span className="text-slate-400">Resend code in {formatTime()}</span>
                ) : (
                  <button onClick={resendOtp} disabled={resendLoading} className="text-[#2DD4BF] font-semibold hover:opacity-75">
                    {resendLoading ? "Sending..." : "Resend code"}
                  </button>
                )}
              </div>

              <button
                onClick={() => navigate("/forgot-password")}
                className="flex items-center justify-center gap-1.5 w-full mt-6 text-sm text-slate-500 hover:text-[#2DD4BF] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Change email address
              </button>
            </div>
          )}

          {/* ══ SCREEN 3: NEW PASSWORD ══ */}
          {uiStep === 3 && (
            <div className="animate-fadeSlideUpUI">
              <h2 className="text-xl font-bold text-slate-900">Create New Password</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6 leading-relaxed">
                Almost done! Choose a strong password for your account.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className={labelStyles}>New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className={`${inputStyles} pr-12`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={showNewPassword ? "#22C55E" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {showNewPassword ? (
                          <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></>
                        ) : (
                          <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                        )}
                      </svg>
                    </button>
                  </div>
                  
                  {/* Visual Strength Bar */}
                  {newPassword.length > 0 && (
                     <div className="flex gap-1 mt-1.5">
                       <div className={`flex-1 h-1 rounded-sm transition-colors ${strength >= 1 ? (strength >= 3 ? 'bg-green-500' : strength === 2 ? 'bg-amber-400' : 'bg-red-400') : 'bg-slate-200'}`}></div>
                       <div className={`flex-1 h-1 rounded-sm transition-colors ${strength >= 2 ? (strength >= 3 ? 'bg-green-500' : 'bg-amber-400') : 'bg-slate-200'}`}></div>
                       <div className={`flex-1 h-1 rounded-sm transition-colors ${strength >= 3 ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                       <div className={`flex-1 h-1 rounded-sm transition-colors ${strength >= 4 ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                     </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelStyles}>Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`${inputStyles} pr-12`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={showConfirmPassword ? "#22C55E" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {showConfirmPassword ? (
                          <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></>
                        ) : (
                          <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3.5 bg-[#30e5cd] text-white rounded-full text-base font-bold shadow-lg shadow-green-500/20 transition-all hover:bg-[#2DD4BF] hover:shadow-xl hover:shadow-green-500/20 active:scale-[0.98] disabled:opacity-60 mt-2"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <button
                onClick={() => setUiStep(2)}
                className="flex items-center justify-center gap-1.5 w-full mt-6 text-sm text-slate-500 hover:text-[#2DD4BF] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back
              </button>
            </div>
          )}

          {/* ══ SCREEN 4: SUCCESS ══ */}
          {uiStep === 4 && (
            <div className="animate-fadeSlideUpUI flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-500 flex items-center justify-center mb-6 shadow-[0_0_0_8px_rgba(34,197,94,0.1)]">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset!</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-[300px]">
                Your password has been successfully updated. You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full px-6 py-3.5 bg-[#30e5cd] text-white rounded-full text-base font-bold shadow-lg shadow-green-500/20 transition-all hover:bg-[#2DD4BF] hover:shadow-xl hover:shadow-green-500/20 active:scale-[0.98]"
              >
                Back to Login
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ResetPassword;