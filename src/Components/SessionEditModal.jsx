import React, { useEffect, useRef, useState } from "react";
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
  ListChecks,
  Sparkles,
  Timer,
  Upload,
  X,
} from "lucide-react";

import Toast from "../utils/toast";
import { getResumesService } from "../Services/resume.service";
import { uploadToGCS } from "../utils/gcsUpload";
import ResumeProcessingLoader from "./ResumeProcessingLoader";
import { getPreviewSrc } from "../utils/getPreviewSrc";
import AILoader from "./AILoader";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

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
    value: "GPT-3.5",
    name: "GPT-3.5",
    desc: "Fast responses",
    icon: "💬",
  },
  {
    value: "GPT-4 Mini",
    name: "GPT-4 Mini",
    desc: "Fast & cheap",
    icon: "✨",
  },
];

export default function SessionEditModal({ open, item, onClose, onSave }) {
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [resumeMode, setResumeMode] = useState("current");
  const [existingResumes, setExistingResumes] = useState([]);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState("");
  const [signedPreview, setSignedPreview] = useState("");
  const [initializing, setInitializing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [form, setForm] = useState({
    company: "",
    position: "",
    resumeId: "",
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
    durationMinutes: 30,
    autoExtend: true,
  });

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const showToast = (message, type = "success") => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, message, type }]);
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

  const getRawItem = () => item?.raw || item || {};

  const getCurrentResumeLinks = () => {
    const raw = getRawItem();

    const previewLink =
      raw.resumePreviewUrl ||
      (raw.resumeId?._id ? `/api/resume/view/${raw.resumeId._id}` : "") ||
      raw.resumeUrl ||
      raw.downloadUrl ||
      "";

    const downloadLink =
      raw.resumeDownloadUrl ||
      raw.resumeUrl ||
      raw.downloadUrl ||
      previewLink ||
      "";

    return {
      previewLink,
      downloadLink,
      title: raw.selectedResumeName || raw.resumeName || raw.resumeId?.title || "Current Resume",
    };
  };

  const resetUploadState = () => {
    setField("resumeTitle", "");
    setField("resumeFile", null);
    setField("resumeUrl", "");
    setField("resumePreviewUrl", "");
    setField("resumeDownloadUrl", "");
    setField("resumeId", "");
    setPreviewUrl("");
    setSignedPreview("");
    setUploadComplete(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const loadCurrentResume = async () => {
    const { previewLink, downloadLink, title } = getCurrentResumeLinks();

    setField("resumeId", "");
    setField("resumeUrl", downloadLink || previewLink);
    setField("resumePreviewUrl", previewLink);
    setField("resumeDownloadUrl", downloadLink);
    setField("resumeTitle", title);

    setPreviewUrl(previewLink || downloadLink);
    setSignedPreview("");

    const signed = await safePreviewSrc(previewLink || downloadLink);
    setSignedPreview(signed);
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
    return Boolean(form.resumeUrl || form.resumePreviewUrl || form.resumeDownloadUrl || previewUrl);
  };

  const goToStep = (targetStep) => {
    if (targetStep === step) return;

    if (step === 1 && targetStep > 1 && !validateStep1()) return;

    if (step === 3 && targetStep > 3 && !hasSelectedResume()) {
      showToast("Please select or upload a resume", "error");
      return;
    }

    setStep(targetStep);
  };

  const next = () => {
    if (step === 1 && !validateStep1()) return;

    if (step === 3) {
      if (resumeMode === "upload" && !uploadComplete) {
        showToast("Please upload resume before continuing", "error");
        return;
      }

      if (!hasSelectedResume()) {
        showToast("Please select or upload a resume", "error");
        return;
      }
    }

    setStep((current) => Math.min(4, current + 1));
  };

  const prev = () => {
    setStep((current) => Math.max(1, current - 1));
  };

  const handleClose = () => {
    setStep(1);
    onClose();
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

      setField("resumeId", "");
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

  const save = async () => {
    try {
      if (!form.company.trim() || !form.position.trim()) {
        showToast("Company & Position are required", "error");
        setStep(1);
        return;
      }

      const raw = getRawItem();
      const currentLinks = getCurrentResumeLinks();

      const effectivePreviewUrl =
        form.resumePreviewUrl ||
        previewUrl ||
        raw.resumePreviewUrl ||
        currentLinks.previewLink ||
        form.resumeUrl ||
        "";

      const effectiveDownloadUrl =
        form.resumeDownloadUrl ||
        form.resumeUrl ||
        raw.resumeDownloadUrl ||
        raw.resumeUrl ||
        currentLinks.downloadLink ||
        effectivePreviewUrl ||
        "";

      if (!effectivePreviewUrl && !effectiveDownloadUrl) {
        showToast("Please select or upload a resume", "error");
        setStep(3);
        return;
      }

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
        resumeUrl: effectiveDownloadUrl || effectivePreviewUrl,
        resumePreviewUrl: effectivePreviewUrl || effectiveDownloadUrl,
        resumeDownloadUrl: effectiveDownloadUrl || effectivePreviewUrl,
        selectedResumeName:
          form.resumeTitle ||
          raw.selectedResumeName ||
          raw.resumeName ||
          currentLinks.title ||
          "",
        durationMinutes: Number(form.durationMinutes) || 30,
        autoExtend: Boolean(form.autoExtend),
      };

      if (form.resumeId) {
        payload.resumeId = form.resumeId;
      }

      setSaving(true);

      await onSave(payload);

      window.dispatchEvent(new Event("session-updated"));
      showToast("Session updated successfully!", "success");

      setTimeout(() => {
        handleClose();
      }, 800);
    } catch (error) {
      console.error("Edit save failed:", error);
      showToast("Failed to update session", "error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setForm({
        company: "",
        position: "",
        resumeId: "",
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
        durationMinutes: 30,
        autoExtend: true,
      });

      setPreviewUrl("");
      setSignedPreview("");
      setExistingResumes([]);
      setResumeMode("current");
      setUploadComplete(false);
      setErrors({});
      setDragActive(false);
      return;
    }

    setToasts([]);
  }, [open]);

  useEffect(() => {
    if (!open || !item) return;

    const load = async () => {
      try {
        setInitializing(true);

        const raw = getRawItem();

        const previewLink =
          raw.resumePreviewUrl ||
          (raw.resumeId?._id ? `/api/resume/view/${raw.resumeId._id}` : "") ||
          raw.resumeUrl ||
          raw.downloadUrl ||
          "";

        const downloadLink =
          raw.resumeDownloadUrl ||
          raw.resumeUrl ||
          raw.downloadUrl ||
          previewLink ||
          "";

        const finalPreview = previewLink || downloadLink;
        const signed = await safePreviewSrc(finalPreview);

        setForm({
          company: raw.company || "",
          position: raw.position || "",
          jobDescription: raw.jobDescription || "",
          skills: Array.isArray(raw.skills) ? raw.skills.join(", ") : raw.skills || "",
          language: raw.language || "English",
          simpleEnglish: Boolean(raw.simpleEnglish),
          extraContext: raw.extraContext || "",
          aiModel: raw.aiModel || "GPT-4.1",
          resumeId: "",
          resumeUrl: downloadLink || finalPreview,
          resumePreviewUrl: previewLink,
          resumeDownloadUrl: downloadLink,
          resumeTitle: raw.selectedResumeName || raw.resumeName || raw.resumeId?.title || "",
          resumeFile: null,
          durationMinutes: raw.durationMinutes || 30,
          autoExtend: raw.autoExtend ?? true,
        });

        setPreviewUrl(finalPreview);
        setSignedPreview(signed);
        setResumeMode("current");
        setUploadComplete(false);
        setStep(1);
      } catch (error) {
        console.error("Session edit load failed:", error);
        showToast("Failed to load session details", "error");
      } finally {
        setInitializing(false);
      }
    };

    load();
  }, [item, open]);

  useEffect(() => {
    if (!open || resumeMode !== "existing") return;

    getResumesService()
      .then((res) => {
        setExistingResumes(normalizeResumes(res));
      })
      .catch((error) => {
        console.error("Failed to load resumes:", error);
        showToast("Failed to load resumes", "error");
      });
  }, [open, resumeMode]);

  useEffect(() => {
    if (!open || resumeMode !== "current" || !item) return;

    loadCurrentResume();
  }, [resumeMode]);

  if (!open) return null;

  const currentLinks = getCurrentResumeLinks();

  const isNextDisabled =
    initializing ||
    (step === 3 && resumeMode === "upload" && !uploadComplete) ||
    (step === 3 && resumeMode !== "current" && !hasSelectedResume());

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
            <FileCheck2 />
          </div>

          <div className="min-w-0">
            <h2 className="edit-modal-title">Edit Session</h2>
            <p className="edit-modal-sub">
              Update interview details and preferences. Step {step} of {STEPS.length}
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
                className={`edit-tab ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
              >
                {isDone ? <CheckCircle2 /> : <Icon />}
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="edit-body">
          {initializing ? (
            <div className="flex min-h-80 items-center justify-center">
              <AILoader text="Loading session..." />
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-4">
                  <div className="edit-info-box">
                    <div className="edit-info-title">Company & Role Details</div>
                    <div className="edit-info-desc">
                      Update the company name, job role, description, and key skills for this interview session.
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
                      placeholder="Paste or update the job description here..."
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
                      Keep answers in English and choose how simple or advanced the AI responses should be.
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
                      placeholder="Write any extra instructions..."
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
                      Use the current resume, select an existing resume, or upload a new resume for this session.
                    </div>
                  </div>

                  <div className="edit-resume-tabs">
                    <button
                      type="button"
                      onClick={() => {
                        resetUploadState();
                        setResumeMode("current");
                      }}
                      className={`edit-resume-tab ${resumeMode === "current" ? "active" : ""}`}
                    >
                      Use Current
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        resetUploadState();
                        setResumeMode("existing");
                      }}
                      className={`edit-resume-tab ${resumeMode === "existing" ? "active" : ""}`}
                    >
                      Select Existing
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        resetUploadState();
                        setResumeMode("upload");
                      }}
                      className={`edit-resume-tab ${resumeMode === "upload" ? "active" : ""}`}
                    >
                      Upload Resume
                    </button>
                  </div>

                  {resumeMode === "current" && (
                    <div className="edit-resume-card active">
                      <div className="edit-resume-file-icon">
                        <FileText />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="edit-resume-name">
                          {form.resumeTitle || currentLinks.title || "Current Resume"}
                        </div>
                        <div className="edit-resume-meta">
                          Currently attached to this session
                        </div>
                      </div>

                      <CheckCircle2 className="h-5 w-5 shrink-0 text-brand" />
                    </div>
                  )}

                  {resumeMode === "existing" && (
                    <div className="space-y-3">
                      {existingResumes.length === 0 ? (
                        <div className="edit-empty-box">
                          No saved resumes found. You can upload a new resume instead.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {existingResumes.map((resume) => {
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
                      )}

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
                            setPreviewUrl("");
                            setSignedPreview("");

                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="text-xs font-semibold text-brand-hover underline"
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
                <div className="space-y-4">
                  <div className="edit-info-box">
                    <div className="edit-info-title">Session Duration</div>
                    <div className="edit-info-desc">
                      Adjust the session duration and auto-extension setting for this interview.
                    </div>
                  </div>

                  <div className="edit-toggle-row">
                    <div>
                      <div className="edit-toggle-title">Auto Extend Session</div>
                      <p className="edit-toggle-sub">
                        Keep the interview session active when more time is needed.
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

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[30, 60].map((duration) => (
                      <label
                        key={duration}
                        className={`edit-duration-card ${
                          Number(form.durationMinutes) === duration ? "active" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="durationMinutes"
                          value={duration}
                          checked={Number(form.durationMinutes) === duration}
                          onChange={() => setField("durationMinutes", duration)}
                          className="hidden"
                        />

                        <Timer />
                        <span>
                          <span className="edit-duration-value">{duration}</span>
                          <span className="edit-duration-sub">
                            minutes {duration === 30 ? "• ½ credit" : "• 1 credit"}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <label className="edit-form-label">
                      <Clock3 />
                      Custom Duration
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={form.durationMinutes}
                      onChange={(event) => setField("durationMinutes", event.target.value)}
                      className="edit-form-input"
                    />
                  </div>
                </div>
              )}
            </>
          )}
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

            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                disabled={isNextDisabled}
                className="btn-teal disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ArrowRight />
              </button>
            ) : (
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="btn-teal disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
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
            onClose={(id) => setToasts((prev) => prev.filter((item) => item.id !== id))}
          />
        ))}
      </div>
    </div>
  );
}