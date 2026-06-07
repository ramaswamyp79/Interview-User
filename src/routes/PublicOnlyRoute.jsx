import { Navigate, Outlet } from "react-router-dom";
import { authTrace, decodeJwtPayload, describeToken } from "../utils/authTrace";

function isTokenValid(token) {
  if (!token) return false;

  try {
    const decoded = decodeJwtPayload(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

const PublicOnlyRoute = () => {
  const token = localStorage.getItem("token");
  const valid = isTokenValid(token);

  authTrace("public route check", {
    path: window.location.pathname,
    token: describeToken(token),
    valid,
  });

  if (valid) {
    authTrace("public route redirect", {
      from: window.location.pathname,
      to: "/home",
    });
    return <Navigate to="/home" replace />;
  }

  return <Outlet />; // ✅ REQUIRED
};

export default PublicOnlyRoute;
