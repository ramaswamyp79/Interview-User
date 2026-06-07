export const getApiBaseUrl = () => {
  //return import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  return import.meta.env.VITE_API_BASE_URL || "https://interview-backend-10476774711.asia-south1.run.app/api";
};
export const resolveApiUrl = (url) => {
  if (!url || typeof url !== "string") return "";

  const apiBase = getApiBaseUrl().replace(/\/$/, "");

  if (url.startsWith("/api/")) {
    return `${apiBase}${url.slice("/api".length)}`;
  }

  try {
    const parsed = new URL(url);

    if (!parsed.pathname.startsWith("/api/")) {
      return url;
    }

    const apiPath = parsed.pathname.slice("/api".length);
    return `${apiBase}${apiPath}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
};

export const fetchSignedResumeUrl = async (url) => {
  const response = await fetch(resolveApiUrl(url), {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    if (contentType.includes("application/json")) {
      const data = await response.json();
      throw new Error(data?.message || data?.error || "Resume request failed.");
    }

    throw new Error(`Resume request failed with status ${response.status}.`);
  }

  if (contentType.includes("text/html")) {
    throw new Error("Resume request returned frontend HTML. Check backend URL configuration.");
  }

  if (!contentType.includes("application/json")) {
    return { response, url: "" };
  }

  const data = await response.json();
  return {
    response,
    url: data?.url || data?.downloadUrl || "",
  };
};
