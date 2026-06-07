import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socialLogin } from "../Services/authService";
import { authTrace, describeToken } from "../utils/authTrace";

const AuthCallback = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const hasCalled = useRef(false);

  useEffect(() => {
    authTrace("callback state", {
      isLoading,
      isAuthenticated,
      hasUser: Boolean(user),
      hasCalled: hasCalled.current,
      path: window.location.pathname,
      search: window.location.search,
    });

    if (isLoading || !isAuthenticated || !user) return;
    if (hasCalled.current) {
      authTrace("callback skipped duplicate effect");
      return;
    }

    hasCalled.current = true;

    const provider = user.sub.split("|")[0];

    const payload = {
      email: user.email,
      name: user.name,
      provider,
      providerId: user.sub,
    };

    authTrace("callback social login request", {
      provider,
      providerId: user.sub,
      email: user.email,
      name: user.name,
    });

    socialLogin(payload)
      .then((res) => {
        authTrace("callback social login success", {
          token: describeToken(res?.token),
          user: res?.user,
        });

        localStorage.setItem("token", res.token);
        localStorage.setItem("email", res.user.email);
        localStorage.setItem("user", JSON.stringify(res.user));

        authTrace("callback navigate", { to: "/home" });
        navigate("/home", { replace: true });
      })
      .catch((error) => {
        authTrace("callback social login failed", {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data,
        });
        authTrace("callback navigate", { to: "/login" });
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



