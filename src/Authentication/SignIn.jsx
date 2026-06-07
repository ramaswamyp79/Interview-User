import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { loginUser } from "../Services/authService";
import SocialAuthLoader from "../Components/SocialAuthLoader";
import { showToast } from "../utils/showToastService";
import logo from "../assets/logo_AnsweflowAI.jpg.png";

const SignIn = () => {
  const navigate = useNavigate();
  const { loginWithRedirect } = useAuth0();

  // State Management
  const [showPassword, setShowPassword] = useState(false);
  const [authProvider, setAuthProvider] = useState(null);
  const [showSocialLoader, setShowSocialLoader] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(formData);

      if (res?.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("email", res.user.email);
        localStorage.setItem("user", JSON.stringify(res.user));
      }

      showToast("success", "Login Successful");

      // delay navigation for animation
      setTimeout(() => {
        navigate("/home");
      }, 1800);

    } catch (err) {
      showToast("error", err?.response?.data?.message || "Login failed");
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

  // Reusable Tailwind classes utilizing exact matching spacing/sizing to SignUp
  const inputStyles = "w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm text-slate-900 bg-slate-50 outline-none transition-all duration-200 placeholder-slate-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 appearance-none";
  const labelStyles = "text-sm font-medium text-slate-900";

  return (
    <>
      {/* SOCIAL LOADER */}
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

        {/* ═══ LEFT PANEL (Testimonial) ═══ */}
        <aside className="hidden md:flex w-1/2 flex-col bg-[#0B1829] relative overflow-hidden px-12 pt-16 items-center justify-start h-full">
          {/* Gradients */}
          <div className="absolute -top-20 -left-24 w-[480px] h-[480px] lp-bg-top pointer-events-none"></div>
          <div className="absolute -bottom-16 -right-20 w-[320px] h-[320px] lp-bg-bottom pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-[480px] animate-fadeSlideUpUI text-left mt-10">
            <span className="block text-7xl text-[#2DD4BF] leading-none mb-2 select-none">"</span>
            <p className="text-lg font-semibold italic text-[#2DD4BF] mb-8">
              Hear what users are saying
            </p>

            <div className="bg-[#152842] border border-white/10 rounded-2xl p-8 shadow-2xl">
              <p className="text-[#E8F4FF] text-base leading-relaxed mb-6 opacity-90">
                "Answerflow AI helped me feel more confident during my interview. It made me feel calm and ready for tough questions. I landed a senior role within 2 weeks!"
              </p>
              <div className="flex items-center gap-4">
                <img
                  src="https://i.pravatar.cc/100?img=12"
                  alt="Anil Agarwal"
                  className="w-12 h-12 rounded-full border-2 border-[#2DD4BF] object-cover flex-shrink-0"
                />
                <div>
                  <strong className="block text-sm font-semibold text-[#E8F4FF]">Anil Agarwal</strong>
                  <span className="text-sm text-slate-400 font-serif">Product Manager at TechCorp</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ═══ RIGHT PANEL (Login Form) ═══ */}
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
                Welcome back
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className={labelStyles} htmlFor="loginEmail">Email</label>
                <input
                  type="email"
                  id="loginEmail"
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
                <label className={labelStyles} htmlFor="loginPwd">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="loginPwd"
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
                {/* Forgot Password Link */}
                <div className="text-right mt-1">
                  <span
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-[#2DD4BF] font-medium cursor-pointer hover:opacity-75 transition-opacity"
                  >
                    Forgot Password?
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-3.5 bg-[#30e5cd] text-white rounded-full text-base font-bold shadow-lg shadow-green-500/20 transition-all hover:bg-[#2DD4BF] hover:shadow-xl hover:shadow-green-500/20 active:scale-[0.98] mt-2"
              >
                Login
              </button>
            </form>

            {/* Switch Mode */}
            <p className="text-center text-slate-500 text-sm mt-5">
              New here?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="text-[#2DD4BF] font-semibold cursor-pointer hover:opacity-75 transition-opacity"
              >
                Create an account
              </span>
            </p>

            {/* OR Divider */}
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

export default SignIn;