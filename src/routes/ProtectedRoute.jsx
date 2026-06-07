import { Navigate, Outlet } from "react-router-dom";
import { authTrace, decodeJwtPayload, describeToken } from "../utils/authTrace";

function isTokenValid(token) {
  if (!token) return false;

  try {
    const payload = decodeJwtPayload(token);
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const valid = isTokenValid(token);

  authTrace("protected route check", {
    path: window.location.pathname,
    token: describeToken(token),
    valid,
  });

  if (!valid) {
    authTrace("protected route redirect", {
      from: window.location.pathname,
      to: "/login",
    });
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

