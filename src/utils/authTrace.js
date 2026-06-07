const AUTH_TRACE_ENABLED = import.meta.env.VITE_AUTH_TRACE === "true";

const maskToken = (token) => {
  if (!token) return null;
  return `${token.slice(0, 12)}...${token.slice(-8)}`;
};

export const decodeJwtPayload = (token) => {
  if (!token) return null;

  const [, payload] = token.split(".");
  if (!payload) return null;

  let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) base64 += "=".repeat(4 - pad);

  return JSON.parse(atob(base64));
};

export const describeToken = (token) => {
  if (!token) {
    return { present: false };
  }

  try {
    const payload = decodeJwtPayload(token);
    const expiresAt = payload?.exp
      ? new Date(payload.exp * 1000).toISOString()
      : null;

    return {
      present: true,
      masked: maskToken(token),
      exp: payload?.exp || null,
      expiresAt,
      expired: payload?.exp ? payload.exp * 1000 <= Date.now() : null,
      subject: payload?.sub || payload?.id || payload?._id || null,
    };
  } catch (error) {
    return {
      present: true,
      masked: maskToken(token),
      decodeError: error?.message || "Unable to decode token",
    };
  }
};

export const authTrace = (label, details = {}) => {
  if (!AUTH_TRACE_ENABLED) return;

  console.groupCollapsed(`[auth-trace] ${label}`);
  console.log(details);
  console.groupEnd();
};
