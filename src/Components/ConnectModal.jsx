import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Info,
  Link2,
  Mic,
  Monitor,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

import ZoomLogo from "../assets/ZoomLogo.png";
import MeetLogo from "../assets/GoogleMeet.png";
import TeamsLogo from "../assets/Teams.png";
import WhatsappLogo from "../assets/Whatsapp.png";
import { getUserCredits } from "../Services/userService";

const CONNECTION_METHODS = [
  {
    id: "zoom",
    label: "Zoom",
    sub: "Best for scheduled Zoom calls",
    logo: ZoomLogo,
    url: "https://zoom.us/",
  },
  {
    id: "meet",
    label: "Google Meet",
    sub: "Best for browser meetings",
    logo: MeetLogo,
    url: "https://meet.google.com/",
  },
  {
    id: "teams",
    label: "Teams",
    sub: "Best for Microsoft interviews",
    logo: TeamsLogo,
    url: "https://teams.microsoft.com/",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    sub: "Best for quick calls",
    logo: WhatsappLogo,
    url: "https://web.whatsapp.com/",
  },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function normalizeCredits(response) {
  if (typeof response === "number") return response;
  if (typeof response?.credits === "number") return response.credits;
  if (typeof response?.data?.credits === "number") return response.data.credits;

  return null;
}

export default function ConnectModal({
  isOpen,
  onClose,
  onBack,
  language = "English",
  aiModel = "GPT-4.1",
  company,
  position,
  onActivate,
}) {
  const [shareAudio, setShareAudio] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShareAudio(true);
      setSelectedMethod("");
      setMeetingLink("");
      setActivating(false);
    }
  }, [isOpen]);

  const selectedPlatform = useMemo(() => {
    return CONNECTION_METHODS.find((item) => item.id === selectedMethod);
  }, [selectedMethod]);

  const getDefaultUrl = () => selectedPlatform?.url || "/";

  const handleActivate = async () => {
  if (!selectedMethod || activating) return;

  try {
    setActivating(true);

    let urlToOpen = meetingLink.trim() || getDefaultUrl();

    const response = await onActivate?.({
      shareAudio,
      connectionMethod: selectedMethod,
      meetingLink: meetingLink.trim(),
    });

    if (response?.blocked) {
      return;
    }

    if (!response?.session && !response?.data?.session && !response?.meetingUrl) {
      return;
    }

    const latestCreditsResponse = await getUserCredits();
    const latestCredits = normalizeCredits(latestCreditsResponse);

    if (typeof latestCredits === "number") {
      localStorage.setItem("credits", latestCredits);

      window.dispatchEvent(
        new CustomEvent("creditsUpdated", {
          detail: { credits: latestCredits },
        })
      );
    }

    if (response?.data?.meetingUrl) {
      urlToOpen = response.data.meetingUrl;
    }

    if (response?.meetingUrl) {
      urlToOpen = response.meetingUrl;
    }

    if (response?.session?.meetingUrl) {
      urlToOpen = response.session.meetingUrl;
    }

    if (response?.data?.session?.meetingUrl) {
      urlToOpen = response.data.session.meetingUrl;
    }

    onClose?.();

    if (urlToOpen) {
      window.open(urlToOpen, "_blank");
    }
  } catch (error) {
    console.error("Failed to start session:", error);
  } finally {
    setActivating(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-fadeIn">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-30 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-500 shadow-sm transition-colors hover:text-slate-900"
          aria-label="Close connect modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Fixed Header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-5 pb-5 pt-6 sm:px-6">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--color-brand-subtle)] blur-2xl" />
          <div className="absolute -bottom-12 left-10 h-28 w-28 rounded-full bg-sky-100 blur-2xl" />

          <div className="relative flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm">
              <Zap className="h-6 w-6 text-brand" />
            </div>

            <div className="min-w-0 flex-1 pr-8">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Connect & Start
                </h2>

                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand shadow-sm">
                  0.5 credit
                </span>
              </div>

              <p className="text-sm leading-relaxed text-slate-500">
                Start your interview assistant for{" "}
                <span className="font-bold text-slate-800">
                  {position || "N/A"}
                </span>{" "}
                at{" "}
                <span className="font-bold text-slate-800">
                  {company || "N/A"}
                </span>
                .
              </p>
            </div>
          </div>

          <div className="relative mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
              <Globe2 className="h-3.5 w-3.5 text-brand" />
              {language || "English"}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
              <Bot className="h-3.5 w-3.5 text-brand" />
              {aiModel || "GPT-4.1"}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" />
              Auto extend enabled
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "var(--color-brand) transparent",
          }}
        >
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Choose meeting app
                </p>
                <p className="text-xs text-slate-500">
                  Select where your interview call will happen.
                </p>
              </div>

              <button
                type="button"
                className="hidden items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-[var(--color-brand)] hover:text-brand sm:inline-flex"
                style={{ borderColor: "var(--session-border)" }}
              >
                <PlayCircle className="h-4 w-4" />
                Tutorial
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-2 sm:grid-cols-4">
              {CONNECTION_METHODS.map((method) => {
                const isActive = selectedMethod === method.id;

                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={cx(
                      "group relative flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center transition-all",
                      isActive
                        ? "bg-white shadow-sm ring-2 ring-[var(--color-brand)]"
                        : "hover:bg-white hover:shadow-sm"
                    )}
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm">
                      <img
                        src={method.logo}
                        alt={method.label}
                        className="h-8 w-8 rounded-full object-contain"
                      />
                    </span>

                    <span className="text-xs font-bold text-slate-800">
                      {method.label}
                    </span>

                    {isActive && (
                      <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[var(--color-brand)] text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedPlatform && (
              <p className="mt-2 text-xs font-medium text-slate-500">
                Selected:{" "}
                <span className="font-bold text-brand">
                  {selectedPlatform.label}
                </span>{" "}
                • {selectedPlatform.sub}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <label
              className={cx(
                "flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition-colors",
                shareAudio
                  ? "border-[var(--color-brand)] bg-[var(--color-brand-subtle)]"
                  : "border-slate-200 bg-white hover:border-[var(--teal-mid)]"
              )}
            >
              <input
                type="radio"
                name="audioMode"
                checked={shareAudio}
                onChange={() => setShareAudio(true)}
                className="hidden"
              />

              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm">
                <Monitor className="h-5 w-5 text-brand" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-slate-900">
                  Share Tab Audio
                </span>
                <span className="block text-xs text-slate-500">
                  Recommended for Google Meet, Zoom web, and Teams web
                </span>
              </span>

              {shareAudio && <CheckCircle2 className="h-5 w-5 text-brand" />}
            </label>

            <label
              className={cx(
                "flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition-colors sm:w-48",
                !shareAudio
                  ? "border-[var(--color-brand)] bg-[var(--color-brand-subtle)]"
                  : "border-slate-200 bg-white hover:border-[var(--teal-mid)]"
              )}
            >
              <input
                type="radio"
                name="audioMode"
                checked={!shareAudio}
                onChange={() => setShareAudio(false)}
                className="hidden"
              />

              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm">
                <Mic className="h-5 w-5 text-brand" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-slate-900">
                  Mic
                </span>
                <span className="block text-xs text-slate-500">
                  Direct input
                </span>
              </span>

              {!shareAudio && <CheckCircle2 className="h-5 w-5 text-brand" />}
            </label>
          </div>

          <div
            className="rounded-2xl border-2 bg-white p-3"
            style={{ borderColor: "var(--session-border)" }}
          >
            <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <Link2 className="h-4 w-4 text-slate-400" />
              Meeting link
              <span className="text-xs font-semibold text-slate-400">
                (optional)
              </span>
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={meetingLink}
                onChange={(event) => setMeetingLink(event.target.value)}
                placeholder="Paste meeting URL or leave blank"
                className="min-w-0 flex-1 rounded-xl border-2 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand)]"
                style={{ borderColor: "var(--session-border)" }}
              />

              <button
                type="button"
                onClick={() => {
                  if (selectedPlatform?.url) {
                    setMeetingLink(selectedPlatform.url);
                  }
                }}
                disabled={!selectedPlatform}
                className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border-2 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-[var(--color-brand)] hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                style={{ borderColor: "var(--session-border)" }}
              >
                <ExternalLink className="h-4 w-4" />
                Use default
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-2xl bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              For browser meetings, choose <strong>Share Tab Audio</strong>{" "}
              while sharing your screen/audio so the assistant can listen
              properly.
            </span>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 border-t bg-white px-5 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onBack || onClose}
              className="btn-outline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              type="button"
              onClick={handleActivate}
              disabled={!selectedMethod || activating}
              className={cx(
                "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all",
                selectedMethod && !activating
                  ? "bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)]"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              )}
            >
              <Sparkles className="h-4 w-4" />
              {activating ? "Activating..." : "Activate & Connect"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}