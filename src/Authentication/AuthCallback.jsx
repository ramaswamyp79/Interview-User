import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socialLogin } from "../Services/authService";

const AuthCallback = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const hasCalled = useRef(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;
    if (hasCalled.current) return;

    hasCalled.current = true;

    const provider = user.sub.split("|")[0];

    const payload = {
      email: user.email,
      name: user.name,
      provider,
      providerId: user.sub,
    };

    socialLogin(payload)
      .then((res) => {
        // ✅ IMPORTANT: backend returns data directly
        localStorage.setItem("token", res.token);
        // Keep email available across reconnects and session refreshes.
        if (user?.email) {
          localStorage.setItem("interview_email", user.email);
          sessionStorage.setItem("interview_email", user.email);
        }
        navigate("/home", { replace: true });
      })
      .catch(() => {
        navigate("/login", { replace: true });
      });
  }, [isAuthenticated, isLoading, user, navigate]);

return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white to-gray-50">
    <div className="flex space-x-2">
      <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
      <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
      <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
    </div>
    <p className="mt-5 text-sm font-medium text-gray-700">
      Verifying your account…
    </p>
  </div>
);

};

export default AuthCallback;



