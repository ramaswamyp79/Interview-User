import { fetchSignedResumeUrl } from "./apiUrl";

export const getPreviewSrc = async (apiUrl) => {
  if (!apiUrl) return "";

  try {
    // ✅ IMPORTANT: NEVER FETCH GCS URLs
    if (
      apiUrl.startsWith("https://storage.googleapis.com") ||
      apiUrl.includes("GoogleAccessId")
    ) {
      return apiUrl;
    }

    // ✅ Only call backend for internal API
    const data = await fetchSignedResumeUrl(apiUrl);

    if (!data?.url) return "";

    const fileUrl = data.url.toLowerCase();

    if (fileUrl.includes(".pdf")) return data.url;

    if (fileUrl.includes(".doc") || fileUrl.includes(".docx")) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(data.url)}&embedded=true`;
    }

    return data.url;

  } catch (err) {
    console.error("Preview fetch failed:", err);
    return "";
  }
};
