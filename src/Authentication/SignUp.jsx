import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import toast from "react-hot-toast";
import { signupUser } from "../Services/authService";
import SocialAuthLoader from "../Components/SocialAuthLoader";
import signupImg from "../assets/hero.png";
import logo from "../assets/logo_AnsweflowAI.jpg.png";

const SignUp = () => {
  const navigate = useNavigate();
  const { loginWithRedirect } = useAuth0();

  // State Management
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authProvider, setAuthProvider] = useState(null);
  const [showSocialLoader, setShowSocialLoader] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileName, setFileName] = useState("Choose file or drag & drop");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  // Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await signupUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (res?.token) {
        localStorage.setItem("token", res.token);
      }

      toast.success("Signup successful 🎉");
      navigate("/home", { replace: true });
    } catch (err) {
      console.log("Signup error:", err);
      const message =
        err?.response?.data?.message || err?.message || "Signup failed. Please try again.";
      toast.error(message);
    }
  };

  const handleSocialLogin = async (connection) => {
    setAuthProvider(connection);
    setShowSocialLoader(true);

    await loginWithRedirect({
      authorizationParams: {
        connection,
        scope: "openid profile email",
      },
    });
  };

  // Default Tailwind sizing applied (text-sm = 14px, replacing the old 13.5px and 14px CSS rules)
  const inputStyles = "w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm text-slate-900 bg-slate-50 outline-none transition-all duration-200 placeholder-slate-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 appearance-none";
  const labelStyles = "text-sm font-medium text-slate-900";

  return (
    <>
      {showSocialLoader && authProvider === "google-oauth2" && (
        <SocialAuthLoader text="Signing you in with Google…" />
      )}
      {showSocialLoader && authProvider === "github" && (
        <SocialAuthLoader text="Signing you in with GitHub…" />
      )}
      {showSocialLoader && authProvider === "linkedin" && (
        <SocialAuthLoader text="Signing you in with LinkedIn…" />
      )}
      {showSocialLoader && authProvider === "windowslive" && (
        <SocialAuthLoader text="Signing you in with Microsoft…" />
      )}

      {/* PARENT CONTAINER */}
      <div className="flex h-screen w-full overflow-hidden bg-white md:bg-[#0B1829]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ═══ LEFT PANEL (Fixed) ═══ */}
        <aside className="hidden md:flex w-1/2 flex-col bg-[#0B1829] relative overflow-hidden px-12 pt-12 items-center justify-start h-full">
          {/* Gradients */}
          <div className="absolute -top-20 -left-24 w-[480px] h-[480px] lp-bg-top pointer-events-none"></div>
          <div className="absolute -bottom-16 -right-20 w-[320px] h-[320px] lp-bg-bottom pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-[480px] animate-fadeSlideUpUI text-left">
            <h2 className="text-5xl font-extrabold text-[#2DD4BF] leading-tight mb-3">
              Unlock Your Potential
            </h2>
            <p className="text-base font-medium text-[#2DD4BF] opacity-80 mb-8">
              AI-Driven Career Success
            </p>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={signupImg}
                alt="AI and human working together"
                className="w-full h-72 object-cover block filter brightness-80 saturate-90"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-[#0B1829D9] backdrop-blur-md p-4 flex items-start gap-3">
                <span className="text-xl leading-none mt-1 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
                    <path d="M4 20L8 12.5L0 11.5L12 0H14L10 7.5L18 8.5L6 20H4Z" fill="#2B9C5D" />
                  </svg>
                </span>
                <div className="flex-1">
                  <span className="block text-sm font-medium text-[#E8F4FF] mb-2">
                    AI Suggestion Ready
                  </span>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full animate-progressPulseUI"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ═══ RIGHT PANEL (Scrollable) ═══ */}
        <main className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-10 h-full overflow-y-auto">
          <div className="w-full max-w-[480px] animate-formFadeSlide mt-auto mb-auto">

            {/* Brand Block */}
            <div className="text-center mb-8">
              <div className="inline-block mb-3">
                <img
                  src={logo}
                  alt="AnswerFlowAI Logo"
                  className="w-16 h-16 object-contain rounded-2xl"
                />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                AnswerFlow<span className="text-[#2DD4BF]">AI</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                AI-Powered Interview Practice
              </p>
              <p className="text-base font-semibold text-slate-900 mt-2">
                Create your free account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} className="flex flex-col gap-4">

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className={labelStyles} htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={inputStyles}
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className={labelStyles} htmlFor="signupEmail">Email</label>
                <input
                  type="email"
                  id="signupEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@domain.com"
                  className={inputStyles}
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className={labelStyles} htmlFor="signupPwd">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="signupPwd"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className={`${inputStyles} pr-12`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={showPassword ? "#22C55E" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className={labelStyles} htmlFor="confirmPwd">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPwd"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Role Select */}
              <div className="flex flex-col gap-1.5">
                <label className={labelStyles} htmlFor="role">Role</label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`${inputStyles} cursor-pointer pr-10`}
                    required
                  >
                    <option value="" disabled>Select Role</option>
                    <option>Software Engineer</option>
                    <option>Product Manager</option>
                    <option>Data Analyst</option>
                    <option>UX Designer</option>
                    <option>Marketing</option>
                    <option>Other</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="flex flex-col gap-1.5">
                <label className={labelStyles}>
                  Upload Resume <em className="not-italic font-normal text-slate-500 text-sm">(optional)</em>
                </label>
                <label
                  onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                  onDragLeave={() => setIsDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragActive(false);
                    if (e.dataTransfer.files[0]) {
                      setFileName(e.dataTransfer.files[0].name);
                    }
                  }}
                  className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-3.5 cursor-pointer text-center text-sm transition-all duration-200 select-none hover:border-green-500 hover:bg-green-50 hover:text-green-600 ${isDragActive ? 'border-green-500 bg-green-50 text-green-600' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>{fileName}</span>
                  <input type="file" id="resumeFile" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-3.5 bg-[#30e5cd] text-white rounded-full text-base font-bold shadow-lg shadow-green-500/20 transition-all hover:bg-[#2DD4BF] hover:shadow-xl hover:shadow-green-500/20 active:scale-[0.98] mt-2"
              >
                Create Account
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-5">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-[#2DD4BF] font-semibold cursor-pointer hover:opacity-75 transition-opacity"
              >
                Login
              </span>
            </p>

            <div className="flex items-center gap-3 text-slate-400 text-sm my-6">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span>or</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Social Logins */}
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => handleSocialLogin("google-oauth2")} className="w-12 h-12 border-2 border-slate-200 rounded-xl bg-white flex items-center justify-center cursor-pointer transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5">
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-3.59-13.46-8.71l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
              </button>

              <button onClick={() => handleSocialLogin("linkedin")} className="w-12 h-12 border-2 border-slate-200 rounded-xl bg-white flex items-center justify-center cursor-pointer transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5">
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <rect width="48" height="48" rx="4" fill="#0A66C2" />
                  <path fill="#fff" d="M12.5 18.5h5V36h-5zm2.5-8a2.9 2.9 0 110 5.8 2.9 2.9 0 010-5.8zM22 18.5h4.8v2.4h.1c.67-1.27 2.3-2.6 4.74-2.6 5.07 0 6 3.34 6 7.68V36H32.5v-8.45c0-2.02-.04-4.62-2.81-4.62s-3.24 2.2-3.24 4.47V36H22V18.5z" />
                </svg>
              </button>

              <button onClick={() => handleSocialLogin("windowslive")} className="w-12 h-12 border-2 border-slate-200 rounded-xl bg-white flex items-center justify-center cursor-pointer transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5">
                <svg width="20" height="20" viewBox="0 0 21 21">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                </svg>
              </button>
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default SignUp;