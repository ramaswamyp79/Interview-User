const SOCKET_WEB_URL =
  import.meta.env.VITE_SOCKET_WEB || "https://socket.answerflow-ai.com";

const encodeLaunchParam = (value) => {
  const text = String(value || "");
  const bytes = new TextEncoder().encode(text);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const LAUNCH_SESSION_ID_PARAM = encodeLaunchParam("sessionId");
const LAUNCH_EMAIL_PARAM = encodeLaunchParam("email");

export const startSocketSession = async ({ sessionId }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Login token missing");
  }

  if (!sessionId) {
    throw new Error("Session ID missing");
  }

  const response = await fetch(`${SOCKET_WEB_URL}/api/session/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    alert(`Socket JWT verification failed:\n${JSON.stringify(data, null, 2)}`);
    throw new Error(data?.message || "Socket backend rejected token");
  }

  const data = await response.json();
  alert(`Socket JWT verification response:\n${JSON.stringify(data, null, 2)}`);
  return data;
};

export const buildSocketInterviewUrl = ({ sessionId, email }) => {
  const url = new URL("/interview", SOCKET_WEB_URL);

  if (sessionId) {
    url.searchParams.set(LAUNCH_SESSION_ID_PARAM, encodeLaunchParam(sessionId));
  }

  if (email) {
    url.searchParams.set(LAUNCH_EMAIL_PARAM, encodeLaunchParam(email));
  }

  return url.toString();
};
