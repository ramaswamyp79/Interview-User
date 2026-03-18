import { v4 as uuidv4 } from "uuid";

const sessionId = uuidv4();

// Sends logs to server without blocking UI
// ...existing code...updated

function sendClientLog(entry) {
  const logEntry = {
    ts: Date.now(),
    side: "client",
    sessionId: entry.sessionId,
    messageId: entry.messageId,
    direction: "inbound", // inbound/outbound
    event: entry.event || "ws_message",
    payload: entry.payload,
    meta: entry.meta
  };
  const body = JSON.stringify(logEntry);

  // Best: sendBeacon (fire-and-forget)
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/client-log", blob);
    return;
  }

  // Fallback: fetch
  fetch("/api/client-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  }).catch(() => {});
}

export function clientLog(direction, messageId, payload, meta) {
  sendClientLog({
    ts: Date.now(),
    sessionId,
    messageId,
    direction,          // inbound/outbound
    event: "ws_message",
    payload,
    meta
  });
}
