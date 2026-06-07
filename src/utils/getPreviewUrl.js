export function getPreviewUrl(url) {
  if (!url) return "";

  const lower = url.toLowerCase();

  if (lower.endsWith(".pdf")) return url;

  if (lower.endsWith(".doc") || lower.endsWith(".docx")) {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  }

  return url;
}