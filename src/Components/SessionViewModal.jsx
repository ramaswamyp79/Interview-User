import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Languages,
  Link2,
  Mic,
  ShieldCheck,
  Sparkles,
  Timer,
  Volume2,
  X,
} from "lucide-react";
import { getPreviewSrc } from "../utils/getPreviewSrc";
import { fetchSignedResumeUrl, resolveApiUrl } from "../utils/apiUrl";

const STATUS_CONFIG = {
  active: {
    label: "Active",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClass: "bg-[var(--color-brand)]",
  },
  completed: {
    label: "Completed",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-600",
    dotClass: "bg-slate-400",
  },
  expired: {
    label: "Expired",
    badgeClass: "border-red-100 bg-red-50 text-red-600",
    dotClass: "bg-red-500",
  },
  draft: {
    label: "Draft",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-500",
    dotClass: "bg-slate-400",
  },
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return "—";

  try {
    let dateObj;

    if (typeof timestamp === "object" && typeof timestamp.toDate === "function") {
      dateObj = timestamp.toDate();
    } else if (typeof timestamp === "object" && timestamp._seconds) {
      dateObj = new Date(timestamp._seconds * 1000);
    } else if (typeof timestamp === "object" && timestamp.seconds) {
      dateObj = new Date(timestamp.seconds * 1000);
    } else {
      dateObj = new Date(timestamp);
    }

    if (Number.isNaN(dateObj.getTime())) return "Invalid Date";

    return dateObj.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
};

const toTitleCase = (value) => {
  if (!value) return "—";

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeSkills = (skills) => {
  if (!skills) return [];

  if (Array.isArray(skills)) {
    return skills
      .map((skill) => String(skill || "").trim())
      .filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills
      .split(/,|\n/)
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

const formatDuration = (value) => {
  if (!value && value !== 0) return "—";

  const text = String(value).trim();
  if (!text) return "—";

  return text.toLowerCase().includes("min") ? text : `${text} min`;
};

const getBooleanLabel = (value) => (value ? "Enabled" : "Disabled");

export default function SessionViewModal({ open, item, onClose }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const skills = useMemo(() => normalizeSkills(item?.skills), [item?.skills]);

  useEffect(() => {
    setPreviewOpen(false);
    setPreviewSrc("");
    setPreviewError("");

    if (!open || !item?.resumePreviewUrl) return;

    let mounted = true;

    const loadPreview = async () => {
      try {
        setPreviewLoading(true);

        const url = await getPreviewSrc(item.resumePreviewUrl);

        if (mounted) {
          setPreviewSrc(url || "");
          setPreviewError(url ? "" : "Preview is not available.");
        }
      } catch (error) {
        console.error("Preview failed:", error);

        if (mounted) {
          setPreviewError("Preview failed to load.");
        }
      } finally {
        if (mounted) {
          setPreviewLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      mounted = false;
    };
  }, [open, item?._id, item?.id, item?.resumePreviewUrl]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow || "";
    };
  }, [open]);

  if (!open || !item) return null;

  const handleClose = () => {
    setPreviewOpen(false);
    onClose();
  };

  const handleDownload = async () => {
    if (!item?.resumeDownloadUrl) return;

    try {
      const data = await fetchSignedResumeUrl(item.resumeDownloadUrl);

      if (data.url) {
        window.open(resolveApiUrl(data.url), "_blank", "noopener,noreferrer");
        return;
      }

      const blob = await data.response.blob();
      const blobUrl = URL.createObjectURL(blob);

      window.open(blobUrl, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 30000);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const statusKey = String(item.status || "active").toLowerCase();
  const status = STATUS_CONFIG[statusKey] || {
    label: toTitleCase(item.status || "Active"),
    badgeClass: "border-slate-200 bg-slate-50 text-slate-600",
    dotClass: "bg-slate-400",
  };

  const company = item.company || "—";
  const position = item.position || "—";
  const aiModel = item.aiModel || "—";
  const language = item.language || "—";
  const duration = formatDuration(
    item.durationMinutes || item.duration || item.durationInMinutes
  );
  const creditsUsed = item.creditsUsed ?? item.credits ?? 0;
  const aiUsage = item.aiUsage ?? item.usage ?? 0;
  const startAt = formatDateTime(item.startAt || item.startTime);
  const createdAt = formatDateTime(item.createdAt);
  const connectionMethod = toTitleCase(item.connectionMethod);
  const jobDescription = item.jobDescription || item.description || "—";
  const meetingLink = item.meetingLink || item.meetingUrl || item.joinUrl || "";

  const resumeTitle =
    item.resumeName ||
    item.selectedResumeName ||
    item.resumeId?.title ||
    item.resume?.title ||
    "Attached resume";

  const hasResume =
    Boolean(item.resumePreviewUrl) ||
    Boolean(item.resumeDownloadUrl) ||
    Boolean(item.resumeId) ||
    Boolean(item.resumeName) ||
    Boolean(item.selectedResumeName);

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 animate-fadeIn">
      <button
        type="button"
        aria-label="Close view session modal"
        className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <section className="relative z-[1000000] flex h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-30 grid h-8 w-8 place-items-center rounded-lg border-0 bg-white/80 text-slate-400 shadow-sm transition-colors hover:text-slate-900"
        >
          <X className="h-5 w-5" />
        </button>

        <header className="relative shrink-0 overflow-hidden border-b border-[var(--session-border)] bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-5 pb-5 pt-6 sm:px-6">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--color-brand-subtle)] blur-2xl" />
          <div className="absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-sky-100 blur-2xl" />

          <div className="relative flex flex-col gap-4 pr-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm">
                <Sparkles className="h-6 w-6 text-brand" />
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${status.badgeClass}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                    {status.label}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand shadow-sm">
                    View Session
                  </span>
                </div>

                <h2 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
                  {company}
                </h2>

                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                  <Briefcase className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{position}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-80">
              <SummaryPill icon={Timer} label="Duration" value={duration} />
              <SummaryPill icon={CreditCard} label="Credits" value={creditsUsed} />
              <SummaryPill icon={Activity} label="AI Usage" value={aiUsage} />
            </div>
          </div>
        </header>

        <div className="view-modal-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <InfoCard icon={Building2} label="Company" value={company} />
              <InfoCard icon={Briefcase} label="Position" value={position} />
              <InfoCard icon={Bot} label="AI Model" value={aiModel} />
              <InfoCard icon={Languages} label="Language" value={language} />
              <InfoCard
                icon={Volume2}
                label="Share Audio"
                value={getBooleanLabel(item.shareAudio)}
                valueClass={item.shareAudio ? "text-emerald-700" : "text-slate-700"}
              />
              <InfoCard
                icon={ShieldCheck}
                label="Auto Extend"
                value={getBooleanLabel(item.autoExtend)}
                valueClass={item.autoExtend ? "text-emerald-700" : "text-slate-700"}
              />
              <InfoCard icon={Clock3} label="Duration" value={duration} />
              <InfoCard icon={CreditCard} label="Credits Used" value={creditsUsed} />
              <InfoCard icon={Activity} label="AI Usage" value={`${aiUsage} usages`} />
              <InfoCard icon={CalendarDays} label="Start Time" value={startAt} />
              <InfoCard icon={CalendarDays} label="Created At" value={createdAt} />
              <InfoCard icon={Link2} label="Connection Method" value={connectionMethod} />

              {meetingLink && (
                <InfoCard
                  icon={ExternalLink}
                  label="Meeting Link"
                  value={
                    <a
                      href={meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-w-0 items-center gap-1.5 truncate font-bold text-brand hover:text-brand-hover"
                    >
                      <span className="truncate">Open meeting</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  }
                  wide
                />
              )}
            </div>

            <ViewSection icon={FileText} title="Job Description">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {jobDescription}
              </p>
            </ViewSection>

            {skills.length > 0 && (
              <ViewSection icon={CheckCircle2} title="Skills">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="inline-flex items-center rounded-full bg-[var(--color-brand-subtle)] px-3 py-1.5 text-xs font-bold text-brand"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </ViewSection>
            )}

            {hasResume && (
              <ViewSection icon={FileText} title="Resume">
                <div className="rounded-2xl border border-[var(--session-border)] bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--teal-mid)] bg-[var(--color-brand-subtle)]">
                        <FileText className="h-6 w-6 text-brand" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {resumeTitle}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Preview or download the resume linked with this interview session.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewOpen((current) => !current)}
                        disabled={!item.resumePreviewUrl}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Eye className="h-4 w-4" />
                        {previewOpen ? "Hide Preview" : "Preview Resume"}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownload}
                        disabled={!item.resumeDownloadUrl}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" />
                        Download Resume
                      </button>
                    </div>
                  </div>

                  {previewOpen && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--session-border)] bg-white">
                      {previewLoading && (
                        <div className="grid h-80 place-items-center text-sm font-semibold text-slate-500">
                          Loading resume preview...
                        </div>
                      )}

                      {!previewLoading && previewError && (
                        <div className="flex h-80 flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
                          <CircleAlert className="h-8 w-8 text-amber-500" />
                          <span>{previewError}</span>
                        </div>
                      )}

                      {!previewLoading && !previewError && previewSrc && (
                        <iframe
                          src={previewSrc}
                          title="Resume Preview"
                          className="h-[520px] w-full bg-white"
                        />
                      )}
                    </div>
                  )}
                </div>
              </ViewSection>
            )}

            <ViewSection icon={Mic} title="Interview Settings">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SettingRow
                  icon={Volume2}
                  title="Audio Capture"
                  description={
                    item.shareAudio
                      ? "Tab/system audio sharing is enabled for this session."
                      : "Audio sharing is disabled for this session."
                  }
                  enabled={Boolean(item.shareAudio)}
                />

                <SettingRow
                  icon={ShieldCheck}
                  title="Auto Extend"
                  description={
                    item.autoExtend
                      ? "Session can extend automatically when required."
                      : "Session duration is fixed."
                  }
                  enabled={Boolean(item.autoExtend)}
                />
              </div>
            </ViewSection>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-end border-t border-[var(--session-border)] bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center justify-center rounded-xl border-2 border-[var(--session-border)] bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-[var(--color-brand)] hover:text-brand"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}

function SummaryPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/80 px-3 py-3 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>

      <p className="truncate text-sm font-bold text-slate-900">{value ?? "—"}</p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  valueClass = "text-slate-900",
  wide = false,
}) {
  return (
    <div
      className={`flex min-w-0 items-start gap-3 rounded-2xl border border-[var(--session-border)] bg-white p-4 shadow-sm ${wide ? "xl:col-span-2" : ""
        }`}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-subtle)]">
        <Icon className="h-5 w-5 text-brand" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <div className={`mt-1 break-words text-sm font-bold ${valueClass}`}>
          {value ?? "—"}
        </div>
      </div>
    </div>
  );
}

function ViewSection({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-[var(--session-border)] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--color-brand-subtle)]">
          <Icon className="h-4.5 w-4.5 text-brand" />
        </span>

        <h3 className="text-base font-bold text-slate-900">{title}</h3>
      </div>

      {children}
    </section>
  );
}

function SettingRow({ icon: Icon, title, description, enabled }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${enabled
          ? "border-[var(--teal-mid)] bg-[var(--color-brand-subtle)]"
          : "border-[var(--session-border)] bg-slate-50"
        }`}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm">
        <Icon className={`h-5 w-5 ${enabled ? "text-brand" : "text-slate-400"}`} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <p className="text-sm font-bold text-slate-900">{title}</p>

          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${enabled
                ? "bg-white text-brand"
                : "bg-white text-slate-400"
              }`}
          >
            {enabled ? "On" : "Off"}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
    </div>
  );
}
