import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  FileUp,
  Globe2,
  Info,
  Link2,
  ListChecks,
  Mic,
  Monitor,
  Search,
  Sparkles,
  Timer,
  Upload,
  Video,
  Volume2,
  X,
  Zap,
  ExternalLink,
PlayCircle,
ShieldCheck,
} from "lucide-react";

import Toast from "../utils/toast";
import { getResumesService } from "../Services/resume.service";
import sessionService from "../Services/sessionService";
import { uploadToGCS } from "../utils/gcsUpload";
import ResumeProcessingLoader from "./ResumeProcessingLoader";
import { getUserCredits } from "../Services/userService";
import { getPreviewSrc } from "../utils/getPreviewSrc";

import ZoomLogo from "../assets/ZoomLogo.png";
import MeetLogo from "../assets/GoogleMeet.png";
import TeamsLogo from "../assets/Teams.png";
import WhatsappLogo from "../assets/Whatsapp.png";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const RESUME_PAGE_SIZE = 10;

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const STEPS = [
  {
    id: 1,
    label: "Company",
    icon: Building2,
  },
  {
    id: 2,
    label: "Language & AI",
    icon: Sparkles,
  },
  {
    id: 3,
    label: "Resume",
    icon: FileText,
  },
  {
    id: 4,
    label: "Duration",
    icon: Clock3,
  },
  {
    id: 5,
    label: "Connect",
    icon: Video,
  },
];

const AI_MODELS = [
  {
    value: "GPT-4.1",
    name: "GPT-4.1",
    desc: "Best quality answers",
    icon: "🤖",
  },
  {
    value: "GPT-4 Turbo",
    name: "GPT-4 Turbo",
    desc: "Smart and reliable",
    icon: "⚡",
  },
  {
    value: "GPT-4 Mini",
    name: "GPT-4 Mini",
    desc: "Fast & cheap",
    icon: "✨",
  },
  {
    value: "GPT-3.5",
    name: "GPT-3.5",
    desc: "Fast responses",
    icon: "💬",
  },
];

const DURATION_OPTIONS = [
  {
    value: 15,
    title: "Quick Screening",
    desc: "Short HR call or quick intro",
    badge: "Fast",
  },
  {
    value: 30,
    title: "Standard Interview",
    desc: "Best for most interviews",
    badge: "Recommended",
  },
  {
    value: 45,
    title: "Technical Round",
    desc: "Good for coding or deep discussion",
    badge: "Focused",
  },
  {
    value: 60,
    title: "Full Interview",
    desc: "Long technical or final round",
    badge: "Extended",
  },
];

const CONNECTION_METHODS = [
  {
    id: "zoom",
    label: "Zoom",
    sub: "Open Zoom meeting",
    logo: ZoomLogo,
  },
  {
    id: "meet",
    label: "Google Meet",
    sub: "Open Google Meet",
    logo: MeetLogo,
  },
  {
    id: "teams",
    label: "Microsoft Teams",
    sub: "Open Teams meeting",
    logo: TeamsLogo,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    sub: "Open WhatsApp Web",
    logo: WhatsappLogo,
  },
];

const INITIAL_FORM = {
  company: "",
  position: "",
  jobDescription: "",
  skills: "",
  language: "English",
  simpleEnglish: false,
  extraContext: "",
  aiModel: "GPT-4.1",
  resumeUrl: "",
  resumePreviewUrl: "",
  resumeDownloadUrl: "",
  resumeTitle: "",
  resumeFile: null,
  resumeId: "",
  durationMinutes: 30,
  autoExtend: true,
  _id: "",
  id: "",
};

export default function CreateSession({ open, onClose, onCreated }) {
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [existingResumes, setExistingResumes] = useState([]);
  const [resumeMode, setResumeMode] = useState("existing");
  const [resumeSearch, setResumeSearch] = useState("");
  const [visibleResumeCount, setVisibleResumeCount] = useState(RESUME_PAGE_SIZE);

  const [previewUrl, setPreviewUrl] = useState("");
  const [signedPreview, setSignedPreview] = useState("");
  const [uploadComplete, setUploadComplete] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  const [shareAudio, setShareAudio] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const [form, setForm] = useState(INITIAL_FORM);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const showToast = (message, type = "success") => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const normalizeResumes = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    if (Array.isArray(response?.resumes)) return response.resumes;
    return [];
  };

  const getResumeId = (resume) => String(resume?._id || resume?.id || "");

  const getResumeTitle = (resume) =>
    resume?.title || resume?.fileName || resume?.name || "Untitled Resume";

  const getResumePreviewLink = (resume) =>
    resume?.previewUrl ||
    resume?.resumePreviewUrl ||
    resume?.resumeUrl ||
    resume?.downloadUrl ||
    resume?.resumeDownloadUrl ||
    "";

  const getResumeDownloadLink = (resume) =>
    resume?.downloadUrl ||
    resume?.resumeDownloadUrl ||
    resume?.resumeUrl ||
    resume?.previewUrl ||
    "";

  const formatResumeMeta = (resume) => {
    const rawDate = resume?.createdAt || resume?.updatedAt || resume?.uploadedAt;

    if (!rawDate) return "Saved resume";

    try {
      const date =
        typeof rawDate === "object" && rawDate._seconds
          ? new Date(rawDate._seconds * 1000)
          : new Date(rawDate);

      return Number.isNaN(date.getTime())
        ? "Saved resume"
        : date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
    } catch {
      return "Saved resume";
    }
  };

  const safePreviewSrc = async (url) => {
    if (!url) return "";

    try {
      return await getPreviewSrc(url);
    } catch (error) {
      console.error("Preview URL error:", error);
      return "";
    }
  };

  const filteredResumes = useMemo(() => {
    const search = resumeSearch.trim().toLowerCase();

    if (!search) return existingResumes;

    return existingResumes.filter((resume) => {
      const title = getResumeTitle(resume).toLowerCase();
      const fileName = String(resume?.fileName || resume?.name || "").toLowerCase();

      return title.includes(search) || fileName.includes(search);
    });
  }, [existingResumes, resumeSearch]);

  const visibleResumes = useMemo(() => {
    return filteredResumes.slice(0, visibleResumeCount);
  }, [filteredResumes, visibleResumeCount]);

  const selectedResume = useMemo(() => {
    if (!form.resumeId) return null;

    return existingResumes.find((resume) => getResumeId(resume) === String(form.resumeId));
  }, [existingResumes, form.resumeId]);

  const resetUploadState = () => {
    setPreviewUrl("");
    setSignedPreview("");
    setUploadComplete(false);
    setIsUploading(false);
    setDragActive(false);

    setForm((prev) => ({
      ...prev,
      resumeFile: null,
      resumeId: "",
      resumeUrl: "",
      resumePreviewUrl: "",
      resumeDownloadUrl: "",
      resumeTitle: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetAllState = () => {
    setStep(1);
    setForm(INITIAL_FORM);
    setExistingResumes([]);
    setResumeMode("existing");
    setResumeSearch("");
    setVisibleResumeCount(RESUME_PAGE_SIZE);
    setPreviewUrl("");
    setSignedPreview("");
    setUploadComplete(false);
    setIsUploading(false);
    setCreating(false);
    setConnecting(false);
    setErrors({});
    setDragActive(false);
    setSelectedMethod("");
    setMeetingLink("");
    setShareAudio(true);
    setToasts([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!form.company.trim()) {
      newErrors.company = "Company name is required";
    }

    if (!form.position.trim()) {
      newErrors.position = "Position is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const hasSelectedResume = () => {
    return Boolean(
      form.resumeId ||
        form.resumeUrl ||
        form.resumePreviewUrl ||
        form.resumeDownloadUrl ||
        previewUrl
    );
  };

  const isResumeStepValid = () => {
    if (resumeMode === "existing") {
      return Boolean(form.resumeId && hasSelectedResume());
    }

    if (resumeMode === "upload") {
      return Boolean(uploadComplete && hasSelectedResume());
    }

    return false;
  };

  const getDefaultUrl = (method) => {
    switch (method) {
      case "zoom":
        return "https://zoom.us/";
      case "meet":
        return "https://meet.google.com/";
      case "teams":
        return "https://teams.microsoft.com/";
      case "whatsapp":
        return "https://web.whatsapp.com/";
      default:
        return "/";
    }
  };

  const goToStep = (targetStep) => {
    if (targetStep === step) return;

    if (targetStep > 1 && !validateStep1()) return;

    if (targetStep > 3 && !isResumeStepValid()) {
      showToast("Please select or upload a resume", "error");
      setStep(3);
      return;
    }

    if (targetStep === 5 && !(form._id || form.id)) {
      showToast("Please create the session before connecting", "error");
      return;
    }

    setStep(targetStep);
  };

  const next = () => {
    if (step === 1 && !validateStep1()) return;

    if (step === 3 && !isResumeStepValid()) {
      showToast(
        resumeMode === "upload"
          ? "Please upload resume before continuing"
          : "Please select a resume",
        "error"
      );
      return;
    }

    setStep((current) => Math.min(5, current + 1));
  };

  const prev = () => {
    setStep((current) => {
      const nextStep = Math.max(1, current - 1);

      if (current === 5) {
        setSelectedMethod("");
        setMeetingLink("");
        setShareAudio(true);
      }

      return nextStep;
    });
  };

  const handleClose = () => {
    onClose?.();
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    const isAcceptedExtension = ["pdf", "doc", "docx", "txt"].includes(extension);
    const isAcceptedMime = ACCEPTED_FILE_TYPES.includes(file.type);

    if (!isAcceptedMime && !isAcceptedExtension) {
      showToast("Only PDF, DOC, DOCX, or TXT files are allowed", "error");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast("Resume file size must be less than 10MB", "error");
      return;
    }

    setField("resumeFile", file);

    if (!form.resumeTitle?.trim()) {
      setField("resumeTitle", file.name.replace(/\.[^/.]+$/, ""));
    }

    setUploadComplete(false);
    setPreviewUrl("");
    setSignedPreview("");
  };

  const handleUploadResume = async () => {
    try {
      if (!form.resumeTitle?.trim()) {
        showToast("Resume title is required", "error");
        return;
      }

      if (!form.resumeFile) {
        showToast("Please choose a resume file", "error");
        return;
      }

      setIsUploading(true);

      const res = await uploadToGCS(form.resumeFile, form.resumeTitle);
      const uploaded = res?.resume || res?.data?.resume || res?.data || res;

      if (!uploaded) {
        throw new Error("Upload response is empty");
      }

      const uploadedId = getResumeId(uploaded);

      const uploadedPreview =
        uploaded.previewUrl ||
        uploaded.resumePreviewUrl ||
        uploaded.resumeUrl ||
        uploaded.downloadUrl ||
        "";

      const uploadedDownload =
        uploaded.downloadUrl ||
        uploaded.resumeDownloadUrl ||
        uploaded.resumeUrl ||
        uploadedPreview ||
        "";

      setField("resumeId", uploadedId);
      setField("resumeUrl", uploadedDownload || uploadedPreview);
      setField("resumePreviewUrl", uploadedPreview);
      setField("resumeDownloadUrl", uploadedDownload);
      setField("resumeTitle", uploaded.title || form.resumeTitle);

      const signed = await safePreviewSrc(uploadedPreview || uploadedDownload);

      setPreviewUrl(uploadedPreview || uploadedDownload);
      setSignedPreview(signed);
      setUploadComplete(true);

      showToast("Resume uploaded successfully!", "success");
    } catch (error) {
      console.error("Resume upload failed:", error);
      showToast("Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleExistingResumeSelect = async (resume) => {
    const id = getResumeId(resume);
    const title = getResumeTitle(resume);
    const previewLink = getResumePreviewLink(resume);
    const downloadLink = getResumeDownloadLink(resume);

    if (!id) return;

    setField("resumeId", id);
    setField("resumeUrl", downloadLink || previewLink);
    setField("resumePreviewUrl", previewLink);
    setField("resumeDownloadUrl", downloadLink);
    setField("resumeTitle", title);

    setPreviewUrl(previewLink || downloadLink);
    setSignedPreview("");

    const signed = await safePreviewSrc(previewLink || downloadLink);
    setSignedPreview(signed);
  };

  const createSession = async () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    if (!isResumeStepValid()) {
      showToast("Please select or upload a resume", "error");
      setStep(3);
      return;
    }

    const effectivePreviewUrl = form.resumePreviewUrl || previewUrl || form.resumeUrl || "";

    const effectiveDownloadUrl =
      form.resumeDownloadUrl || form.resumeUrl || effectivePreviewUrl || "";

    const payload = {
      company: form.company.trim(),
      position: form.position.trim(),
      jobDescription: form.jobDescription || "",
      skills: form.skills
        ? form.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [],
      language: form.language || "English",
      simpleEnglish: Boolean(form.simpleEnglish),
      extraContext: form.extraContext || "",
      aiModel: form.aiModel || "GPT-4.1",
      resumeId: form.resumeId || undefined,
      resumeUrl: effectiveDownloadUrl || effectivePreviewUrl || undefined,
      resumePreviewUrl: effectivePreviewUrl || effectiveDownloadUrl || undefined,
      resumeDownloadUrl: effectiveDownloadUrl || effectivePreviewUrl || undefined,
      selectedResumeName: form.resumeTitle || "",
      saveTranscript: false,
      durationMinutes: Number(form.durationMinutes) || 30,
      autoExtend: Boolean(form.autoExtend),
    };

    try {
      setCreating(true);

      const response = await sessionService.createSession(payload);
      const session = response?.session || response?.data || response;

      const sessionId = session?._id || session?.id;

      if (!sessionId) {
        throw new Error("Session ID missing from create response");
      }

      const createdSession = {
        ...session,
        _id: session?._id || sessionId,
        id: session?.id || sessionId,
      };

      setForm((prev) => ({
        ...prev,
        _id: sessionId,
        id: sessionId,
      }));

      onCreated?.(createdSession);
      window.dispatchEvent(
        new CustomEvent("session-updated", {
          detail: {
            type: "created",
            session: createdSession,
          },
        })
      );

      showToast("Session created successfully 🎉", "success");

      setTimeout(() => {
        setStep(5);
      }, 500);
    } catch (error) {
      console.error("Failed to create session:", error);
      showToast(error?.response?.data?.message || "Failed to create session", "error");
    } finally {
      setCreating(false);
    }
  };

  const activateAndConnect = async () => {
    if (!selectedMethod) {
      showToast("Select connection method", "error");
      return;
    }

    const sessionId = form._id || form.id;

    if (!sessionId) {
      showToast("Session ID missing", "error");
      return;
    }

    try {
      setConnecting(true);

      const response = await sessionService.connectSession(sessionId, {
        shareAudio,
        connectionMethod: selectedMethod,
        meetingLink,
        language: form.language,
        aiModel: form.aiModel,
      });

      const creditsResponse = await getUserCredits();

      const credits =
        typeof creditsResponse === "number"
          ? creditsResponse
          : creditsResponse?.credits ?? creditsResponse?.data?.credits;

      if (typeof credits === "number") {
        localStorage.setItem("credits", credits);

        window.dispatchEvent(
          new CustomEvent("creditsUpdated", {
            detail: { credits },
          })
        );
      }

      let urlToOpen = meetingLink?.trim() || getDefaultUrl(selectedMethod);

      if (response?.data?.meetingUrl) {
        urlToOpen = response.data.meetingUrl;
      }

      if (response?.meetingUrl) {
        urlToOpen = response.meetingUrl;
      }

      if (response?.session?.meetingUrl) {
        urlToOpen = response.session.meetingUrl;
      }

      const activatedSession = response?.session || response?.data?.session;

      if (activatedSession) {
        window.dispatchEvent(
          new CustomEvent("session-updated", {
            detail: {
              type: "connected",
              session: activatedSession,
            },
          })
        );
      }

      showToast("Session activated! 🎉", "success");

      handleClose();

      if (urlToOpen) {
        window.open(urlToOpen, "_blank");
      }
    } catch (error) {
      console.error("Failed to activate session:", error);
      showToast(error?.response?.data?.message || "Failed to start session", "error");
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      resetAllState();
      return;
    }

    setToasts([]);

    getResumesService()
      .then((response) => {
        setExistingResumes(normalizeResumes(response));
      })
      .catch((error) => {
        console.error("Failed to load resumes:", error);
        showToast("Failed to load resumes", "error");
      });
  }, [open]);

  useEffect(() => {
    setVisibleResumeCount(RESUME_PAGE_SIZE);
  }, [resumeSearch, resumeMode]);

  if (!open) return null;

  const isNextDisabled =
    creating ||
    connecting ||
    (step === 3 && !isResumeStepValid()) ||
    (step === 5 && !selectedMethod);

  return (
    <div
      className="edit-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="edit-modal-box" role="dialog" aria-modal="true">
        <button type="button" onClick={handleClose} className="edit-modal-close">
          <X />
        </button>

        <div className="edit-modal-header">
          <div className="edit-modal-icon">
            {step === 5 ? <Video /> : <FileCheck2 />}
          </div>

          <div className="min-w-0">
            <h2 className="edit-modal-title">
              {step === 5 ? "Connect & Start" : "Create Session"}
            </h2>
            <p className="edit-modal-sub">
              Set up your interview details and preferences. Step {step} of {STEPS.length}
            </p>
          </div>
        </div>

        <div className="edit-tabs">
          {STEPS.map((tab) => {
            const Icon = tab.icon;
            const isActive = step === tab.id;
            const isDone = step > tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => goToStep(tab.id)}
                className={`edit-tab ${isActive ? "active" : ""} ${
                  isDone ? "done" : ""
                }`}
              >
                {isDone ? <CheckCircle2 /> : <Icon />}
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="edit-body">
          {step === 1 && (
            <div className="space-y-4">
              <div className="edit-info-box">
                <div className="edit-info-title">Company & Role Details</div>
                <div className="edit-info-desc">
                  Enter the company name and job role so the AI understands the
                  interview context and gives relevant answers.
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="edit-form-label">
                  <Building2 />
                  Company <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter company name"
                  value={form.company}
                  onChange={(event) => {
                    setField("company", event.target.value);
                    setErrors((prev) => ({ ...prev, company: "" }));
                  }}
                  className={`edit-form-input ${errors.company ? "error" : ""}`}
                />

                {errors.company && <p className="edit-error-text">{errors.company}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="edit-form-label">
                  <Briefcase />
                  Position <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter position / role"
                  value={form.position}
                  onChange={(event) => {
                    setField("position", event.target.value);
                    setErrors((prev) => ({ ...prev, position: "" }));
                  }}
                  className={`edit-form-input ${errors.position ? "error" : ""}`}
                />

                {errors.position && <p className="edit-error-text">{errors.position}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="edit-form-label">
                  <ListChecks />
                  Job Description
                </label>

                <textarea
                  rows={4}
                  placeholder="Paste job description or responsibilities here..."
                  value={form.jobDescription}
                  onChange={(event) => setField("jobDescription", event.target.value)}
                  className="edit-form-input resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="edit-form-label">
                  <Sparkles />
                  Skills
                </label>

                <input
                  type="text"
                  placeholder="e.g. React, Node.js, SQL"
                  value={form.skills}
                  onChange={(event) => setField("skills", event.target.value)}
                  className="edit-form-input"
                />

                <p className="edit-helper-text">Separate skills with commas.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="edit-info-box">
                <div className="edit-info-title">Language & AI Settings</div>
                <div className="edit-info-desc">
                  Keep answers in English and choose how simple or advanced the AI
                  responses should be.
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="edit-form-label">
                  <Globe2 />
                  Interview Language
                </label>

                <div className="edit-readonly-field">English</div>
              </div>

              <div className="edit-toggle-row">
                <div>
                  <div className="edit-toggle-title">Simple English</div>
                  <p className="edit-toggle-sub">
                    Enable this if you want the AI to avoid complex vocabulary.
                  </p>
                </div>

                <label className="edit-switch">
                  <input
                    type="checkbox"
                    checked={form.simpleEnglish || false}
                    onChange={() => setField("simpleEnglish", !form.simpleEnglish)}
                  />
                  <span />
                </label>
              </div>

              <div className="space-y-2">
                <label className="edit-form-label">
                  <Bot />
                  AI Model
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {AI_MODELS.map((model) => (
                    <label
                      key={model.value}
                      className={`edit-option-card ${
                        form.aiModel === model.value ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="aiModel"
                        value={model.value}
                        checked={form.aiModel === model.value}
                        onChange={() => setField("aiModel", model.value)}
                        className="hidden"
                      />

                      <span className="text-2xl">{model.icon}</span>

                      <span>
                        <span className="edit-option-title">{model.name}</span>
                        <span className="edit-option-sub">{model.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="edit-form-label">
                  <ListChecks />
                  Extra Context / Instructions
                </label>

                <textarea
                  rows={4}
                  placeholder="Write any extra instructions for AI..."
                  value={form.extraContext || ""}
                  onChange={(event) => setField("extraContext", event.target.value)}
                  className="edit-form-input resize-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="edit-info-box">
                <div className="edit-info-title">Resume / CV</div>
                <div className="edit-info-desc">
                  Select from saved resumes or upload a new one. The list is searchable
                  and paginated, so it works cleanly even when you have many resumes.
                </div>
              </div>

              <div className="edit-resume-tabs">
                <button
                  type="button"
                  onClick={() => {
                    resetUploadState();
                    setResumeMode("existing");
                  }}
                  className={`edit-resume-tab ${
                    resumeMode === "existing" ? "active" : ""
                  }`}
                >
                  Select Existing
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetUploadState();
                    setResumeMode("upload");
                  }}
                  className={`edit-resume-tab ${
                    resumeMode === "upload" ? "active" : ""
                  }`}
                >
                  Upload Resume
                </button>
              </div>

              {resumeMode === "existing" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border bg-white p-4">
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="edit-section-title">Saved Resumes</p>
                        <p className="edit-helper-text">
                          Showing {Math.min(visibleResumeCount, filteredResumes.length)} of{" "}
                          {filteredResumes.length} resumes
                        </p>
                      </div>

                      <div className="relative w-full sm:max-w-xs">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={resumeSearch}
                          onChange={(event) => setResumeSearch(event.target.value)}
                          placeholder="Search resume..."
                          className="w-full rounded-lg border-2 bg-white py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-[var(--color-brand)]"
                          style={{ borderColor: "var(--session-border)" }}
                        />
                      </div>
                    </div>

                    {selectedResume && (
                      <div className="mb-3 flex items-center gap-3 rounded-xl border bg-[var(--color-brand-subtle)] p-3">
                        <div className="edit-resume-file-icon">
                          <CheckCircle2 />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="edit-resume-name">
                            Selected: {getResumeTitle(selectedResume)}
                          </div>
                          <div className="edit-resume-meta">
                            {formatResumeMeta(selectedResume)}
                          </div>
                        </div>
                      </div>
                    )}

                    {existingResumes.length === 0 ? (
                      <div className="edit-empty-box">
                        No saved resumes found. You can upload a new resume instead.
                      </div>
                    ) : filteredResumes.length === 0 ? (
                      <div className="edit-empty-box">
                        No resumes found for “{resumeSearch}”.
                      </div>
                    ) : (
                      <>
                        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                          {visibleResumes.map((resume) => {
                            const id = getResumeId(resume);
                            const isSelected = String(form.resumeId) === id;

                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => handleExistingResumeSelect(resume)}
                                className={`edit-resume-card text-left ${
                                  isSelected ? "active" : ""
                                }`}
                              >
                                <div className="edit-resume-file-icon">
                                  <FileText />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="edit-resume-name">
                                    {getResumeTitle(resume)}
                                  </div>
                                  <div className="edit-resume-meta">
                                    {formatResumeMeta(resume)}
                                  </div>
                                </div>

                                {isSelected && (
                                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {visibleResumeCount < filteredResumes.length && (
                          <button
                            type="button"
                            onClick={() =>
                              setVisibleResumeCount((prev) => prev + RESUME_PAGE_SIZE)
                            }
                            className="mt-3 w-full rounded-lg border-2 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:border-[var(--color-brand)] hover:text-brand"
                            style={{ borderColor: "var(--session-border)" }}
                          >
                            Show more resumes
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {!previewUrl && (
                    <p className="edit-helper-text">Select a resume to preview it.</p>
                  )}
                </div>
              )}

              {resumeMode === "upload" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="edit-form-label">
                      <FileCheck2 />
                      Resume Title <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Resume title"
                      value={form.resumeTitle || ""}
                      onChange={(event) => setField("resumeTitle", event.target.value)}
                      className="edit-form-input"
                    />
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setDragActive(true);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      setDragActive(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragActive(false);
                      handleFileSelect(event.dataTransfer.files?.[0]);
                    }}
                    className={`edit-dropzone ${dragActive ? "active" : ""}`}
                  >
                    <Upload />

                    <div>
                      <div className="edit-dropzone-title">
                        {form.resumeFile ? form.resumeFile.name : "Drop your resume here"}
                      </div>
                      <div className="edit-dropzone-sub">
                        PDF, DOC, DOCX, or TXT • Max 10MB
                      </div>
                    </div>

                    <span className="edit-dropzone-btn">Browse files</span>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={(event) => handleFileSelect(event.target.files?.[0])}
                    />
                  </div>

                  {form.resumeFile && (
                    <div className="edit-uploaded-file">
                      <FileCheck2 />
                      <span className="truncate">{form.resumeFile.name}</span>

                      <button
                        type="button"
                        onClick={() => {
                          setField("resumeFile", null);
                          setUploadComplete(false);

                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        <X />
                      </button>
                    </div>
                  )}

                  {!uploadComplete && (
                    <button
                      type="button"
                      disabled={!form.resumeTitle?.trim() || !form.resumeFile || isUploading}
                      onClick={handleUploadResume}
                      className="btn-teal disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FileUp />
                      {isUploading ? "Uploading..." : "Upload Resume"}
                    </button>
                  )}

                  {uploadComplete && (
                    <div className="edit-success-box">
                      <CheckCircle2 />
                      Resume uploaded successfully. You can continue to the next step.
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="edit-section-title">Preview</p>

                  {resumeMode === "upload" && uploadComplete && (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadComplete(false);
                        setField("resumeFile", null);
                        setField("resumeTitle", "");
                        setField("resumeId", "");
                        setField("resumeUrl", "");
                        setField("resumePreviewUrl", "");
                        setField("resumeDownloadUrl", "");
                        setPreviewUrl("");
                        setSignedPreview("");

                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold text-brand-hover underline"
                    >
                      Upload another resume
                    </button>
                  )}
                </div>

                {signedPreview ? (
                  <iframe
                    key={signedPreview}
                    src={signedPreview}
                    className="edit-preview-frame"
                    title="resume-preview"
                  />
                ) : (
                  <div className="edit-empty-box">
                    {previewUrl
                      ? "Preview is loading or not available for this file."
                      : "No resume preview selected yet."}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="edit-info-box">
                <div className="edit-info-title">Session Duration</div>
                <div className="edit-info-desc">
                  Choose a realistic interview duration. You can also enable auto-extend
                  so the session does not stop suddenly during a live interview.
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm">
                      <Timer className="h-6 w-6 text-brand" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900">
                        {form.durationMinutes || 30} minute interview session
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Best for {Number(form.durationMinutes) <= 15
                          ? "quick screening calls."
                          : Number(form.durationMinutes) <= 30
                            ? "standard interview rounds."
                            : Number(form.durationMinutes) <= 45
                              ? "technical and project discussions."
                              : "full-length technical or final interviews."}
                      </p>
                    </div>

                    <span className="rounded-full bg-[var(--color-brand-subtle)] px-3 py-1 text-xs font-bold text-brand">
                      {form.autoExtend ? "Auto extend on" : "Fixed duration"}
                    </span>
                  </div>
                </div>

                <div className="border-t p-4" style={{ borderColor: "var(--session-border)" }}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Pick duration
                      </p>
                      <p className="text-xs text-slate-500">
                        Select a preset or enter a custom value.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {DURATION_OPTIONS.map((duration) => {
                      const active = Number(form.durationMinutes) === duration.value;

                      return (
                        <label
                          key={duration.value}
                          className={`relative cursor-pointer rounded-2xl border-2 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                            active
                              ? "border-[var(--color-brand)] bg-[var(--color-brand-subtle)] ring-4 ring-[var(--color-brand-ring)]"
                              : "border-slate-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name="durationMinutes"
                            value={duration.value}
                            checked={active}
                            onChange={() => setField("durationMinutes", duration.value)}
                            className="hidden"
                          />

                          <div className="flex items-start gap-3">
                            <div
                              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                                active ? "bg-white" : "bg-slate-50"
                              }`}
                            >
                              <Clock3
                                className={`h-5 w-5 ${
                                  active ? "text-brand" : "text-slate-400"
                                }`}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-bold text-slate-900">
                                  {duration.value} min
                                </p>

                                <span
                                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    active
                                      ? "bg-white text-brand"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {duration.badge}
                                </span>
                              </div>

                              <p className="mt-1 text-xs font-semibold text-slate-700">
                                {duration.title}
                              </p>
                              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                                {duration.desc}
                              </p>
                            </div>

                            {active && (
                              <CheckCircle2 className="h-5 w-5 shrink-0 text-brand" />
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <label className="edit-form-label">
                        <Timer />
                        Custom Duration
                      </label>

                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="180"
                          value={form.durationMinutes}
                          onChange={(event) =>
                            setField("durationMinutes", event.target.value)
                          }
                          className="edit-form-input"
                        />
                        <span className="text-sm font-semibold text-slate-500">
                          min
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        You can enter any duration between 1 and 180 minutes.
                      </p>
                    </div>

                    <div className="edit-toggle-row !rounded-2xl">
                      <div>
                        <div className="edit-toggle-title">Auto Extend Session</div>
                        <p className="edit-toggle-sub">
                          Recommended for real interviews, so your session can continue
                          if the call goes longer.
                        </p>
                      </div>

                      <label className="edit-switch">
                        <input
                          type="checkbox"
                          checked={form.autoExtend}
                          onChange={() => setField("autoExtend", !form.autoExtend)}
                        />
                        <span />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {step === 5 &&
  (() => {
    const selectedPlatform = CONNECTION_METHODS.find(
      (method) => method.id === selectedMethod
    );

    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--color-brand-subtle)] blur-2xl" />
          <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-sky-100 blur-2xl" />

          <div className="relative flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm">
              <Zap className="h-6 w-6 text-brand" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Ready to activate your interview assistant
                </h3>

                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand shadow-sm">
                  0.5 credit
                </span>
              </div>

              <p className="text-xs leading-relaxed text-slate-500">
                Start your live assistant for{" "}
                <span className="font-bold text-slate-800">
                  {form.position || "N/A"}
                </span>{" "}
                at{" "}
                <span className="font-bold text-slate-800">
                  {form.company || "N/A"}
                </span>
                .
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                  <Globe2 className="h-3.5 w-3.5 text-brand" />
                  {form.language || "English"}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                  <Bot className="h-3.5 w-3.5 text-brand" />
                  {form.aiModel || "GPT-4.1"}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand" />
                  {form.autoExtend ? "Auto extend on" : "Fixed duration"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
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
                  className={`group relative flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center transition-all ${
                    isActive
                      ? "bg-white shadow-sm ring-2 ring-[var(--color-brand)]"
                      : "hover:bg-white hover:shadow-sm"
                  }`}
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
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition-colors ${
              shareAudio
                ? "border-[var(--color-brand)] bg-[var(--color-brand-subtle)]"
                : "border-slate-200 bg-white hover:border-[var(--teal-mid)]"
            }`}
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
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition-colors sm:w-48 ${
              !shareAudio
                ? "border-[var(--color-brand)] bg-[var(--color-brand-subtle)]"
                : "border-slate-200 bg-white hover:border-[var(--teal-mid)]"
            }`}
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
              <span className="block text-xs text-slate-500">Direct input</span>
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
                if (selectedMethod) {
                  setMeetingLink(getDefaultUrl(selectedMethod));
                }
              }}
              disabled={!selectedMethod}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border-2 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-[var(--color-brand)] hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderColor: "var(--session-border)" }}
            >
              <ExternalLink className="h-4 w-4" />
              Use default
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            If no link is added, the selected meeting app will open by default.
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-2xl bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            For browser meetings, choose <strong>Share Tab Audio</strong> while
            sharing your screen/audio so the assistant can listen properly.
          </span>
        </div>
      </div>
    );
  })()}
        </div>

        <div className="edit-footer">
          {step > 1 ? (
            <button type="button" onClick={prev} className="btn-outline">
              <ArrowLeft className="h-4 w-4" />
              Prev
            </button>
          ) : (
            <div />
          )}

          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={handleClose} className="btn-outline">
              Cancel
            </button>

            {step < 4 && (
              <button
                type="button"
                onClick={next}
                disabled={isNextDisabled}
                className="btn-teal disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ArrowRight />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={createSession}
                disabled={creating}
                className="btn-teal disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Session"}
              </button>
            )}

            {step === 5 && (
              <button
                type="button"
                onClick={activateAndConnect}
                disabled={!selectedMethod || connecting}
                className="btn-teal disabled:cursor-not-allowed disabled:opacity-50"
              >
                {connecting ? "Connecting..." : "Activate & Connect"}
              </button>
            )}
          </div>
        </div>
      </div>

      <ResumeProcessingLoader
        open={isUploading}
        processing={isUploading}
        successMessage="Resume Uploaded Successfully!"
      />

      <div className="fixed right-6 top-6 z-[999999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={(id) =>
              setToasts((prev) => prev.filter((item) => item.id !== id))
            }
          />
        ))}
      </div>
    </div>
  );
}