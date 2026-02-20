import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import loginImg from "../assets/1.png";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../Services/authService";
import { useAuth0 } from "@auth0/auth0-react";
import toast from "react-hot-toast";
import SocialAuthLoader from "../Components/SocialAuthLoader";

/* ================= ICONS ================= */

const GoogleIcon = (
  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white border shadow">
    <FcGoogle size={20} />
  </div>
);

const GithubIcon = (
  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black text-white shadow">
    <FaGithub size={18} />
  </div>
);

const LinkedInIcon = (
  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#0A66C2] text-white shadow">
    <FaLinkedinIn size={18} />
  </div>
);

const MicrosoftIcon = (
  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white border shadow">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
      alt="Microsoft"
      className="w-6"
    />
  </div>
);

/* ================= COMPONENT ================= */

const SignIn = () => {
  const navigate = useNavigate();
  const { loginWithRedirect } = useAuth0();

  const [showPassword, setShowPassword] = useState(false);
  const [authProvider, setAuthProvider] = useState(null);
  const [showSocialLoader, setShowSocialLoader] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔐 Email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(formData);

      if (res?.token) {
        localStorage.setItem("token", res.token);
      }

      toast.success("Login successful");
      navigate("/home");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    }
  };

  // 🌐 Social login (redirect ONLY)
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

  /* ================= UI ================= */

  return (
    <>
      {/* SOCIAL LOADER */}
      {showSocialLoader && authProvider === "google-oauth2" && (
        <SocialAuthLoader text="Signing you in with Google…">
          {GoogleIcon}
        </SocialAuthLoader>
      )}

      {showSocialLoader && authProvider === "github" && (
        <SocialAuthLoader text="Signing you in with GitHub…">
          {GithubIcon}
        </SocialAuthLoader>
      )}

      {showSocialLoader && authProvider === "linkedin" && (
        <SocialAuthLoader text="Signing you in with LinkedIn…">
          {LinkedInIcon}
        </SocialAuthLoader>
      )}

      {showSocialLoader && authProvider === "windowslive" && (
        <SocialAuthLoader text="Signing you in with Microsoft…">
          {MicrosoftIcon}
        </SocialAuthLoader>
      )}

      <div className="relative min-h-screen theme-bg flex items-center justify-center overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-white/20 rounded-full blur-3xl animate-blob -top-20 -left-20" />
        <div className="absolute w-[500px] h-[500px] bg-white/10 blur-3xl animate-blob animation-delay-2000 -bottom-20 -right-10" />

        <div className="w-full h-full grid md:grid-cols-2 glass shadow-2xl overflow-hidden">
          {/* Left */}
          <div className="hidden md:flex items-center justify-center bg-black/20 backdrop-blur-xl">
            <img src={loginImg} alt="Login" className="w-full h-full object-cover opacity-90" />
          </div>

          {/* Right */}
          <div className="flex flex-col justify-start lg:px-24 py-6 px-5 glass">
            <div className="text-center mb-4">
              <h1 className="text-4xl font-extrabold theme-text">Intervue</h1>
              <p className="text-gray-700 italic mt-1">AI-Powered Interview Practice</p>
              <p className="text-indigo-700 font-semibold text-sm mt-1">
                Welcome back 👋
              </p>
            </div>

            {/* LOGIN FORM */}
            <form className="space-y-5 lg:px-6" onSubmit={handleLogin}>
              <div>
                <label className="block font-semibold text-gray-700">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-white/70 border shadow-sm focus:ring-2 focus:ring-indigo-400"
                  placeholder="you@domain.com"
                />
              </div>

              <div className="relative">
                <label className="block font-semibold text-gray-700">Password</label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-white/70 border shadow-sm focus:ring-2 focus:ring-indigo-400"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-10 text-gray-500 mt-1"
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
                <div className="text-right mt-2">
                  <span
                    className="text-sm text-indigo-700 font-semibold cursor-pointer hover:underline"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot Password?
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full theme-primary py-3 rounded-xl shadow-xl font-semibold hover:scale-[1.03] transition"
              >
                Login
              </button>
            </form>

            <p className="text-center mt-3 text-gray-700">
              New here?{" "}
              <span
                className="text-indigo-700 font-semibold cursor-pointer hover:underline"
                onClick={() => navigate("/signup")}
              >
                Create an account
              </span>
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-sm text-gray-600">or</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* SOCIAL */}
            <div className="flex justify-center gap-6">
              <button onClick={() => handleSocialLogin("google-oauth2")}>
                {GoogleIcon}
              </button>
              <button onClick={() => handleSocialLogin("github")}>
                {GithubIcon}
              </button>
              <button onClick={() => handleSocialLogin("linkedin")}>
                {LinkedInIcon}
              </button>
              <button onClick={() => handleSocialLogin("windowslive")}>
                {MicrosoftIcon}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
