import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  FileText,
  Search,
  Upload,
  X,
} from "lucide-react";
import mammoth from "mammoth/mammoth.browser";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const RESUME_PAGE_SIZE = 8;

const ACCEPTED_EXTENSIONS = ["pdf", "doc", "docx", "txt"];

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export default function ResumeUploader({
  resumes = [],
  onSelect,
  allowExisting = true,
  height = "h-96",
}) {
  const fileInputRef = useRef(null);

  const [selectedResume, setSelectedResume] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState(allowExisting ? "existing" : "upload");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(RESUME_PAGE_SIZE);

  const getResumeId = (resume) => String(resume?._id || resume?.id || "");

  const getResumeTitle = (resume) =>
    resume?.title || resume?.fileName || resume?.name || "Untitled Resume";

  const getResumePreviewUrl = (resume) =>
    resume?.previewUrl ||
    resume?.resumePreviewUrl ||
    resume?.resumeUrl ||
    resume?.downloadUrl ||
    resume?.resumeDownloadUrl ||
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

  const filteredResumes = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return resumes;

    return resumes.filter((resume) => {
      const title = getResumeTitle(resume).toLowerCase();
      const fileName = String(resume?.fileName || resume?.name || "").toLowerCase();

      return title.includes(value) || fileName.includes(value);
    });
  }, [resumes, search]);

  const visibleResumes = useMemo(() => {
    return filteredResumes.slice(0, visibleCount);
  }, [filteredResumes, visibleCount]);

  useEffect(() => {
    setVisibleCount(RESUME_PAGE_SIZE);
  }, [search, mode]);

  useEffect(() => {
    setMode(allowExisting ? "existing" : "upload");
  }, [allowExisting]);

  useEffect(() => {
    return () => {
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview?.url]);

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetUploadSelection = () => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }

    setFile(null);
    setPreview(null);
    setError("");
    clearFileInput();

    onSelect?.({
      file: null,
      existing: null,
      preview: null,
    });
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    const isAcceptedExtension = ACCEPTED_EXTENSIONS.includes(extension);
    const isAcceptedMime = ACCEPTED_FILE_TYPES.includes(selectedFile.type);

    if (!isAcceptedExtension && !isAcceptedMime) {
      setError("Only PDF, DOC, DOCX, or TXT files are allowed.");
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Resume file size must be less than 10MB.");
      return false;
    }

    return true;
  };

  const handleFile = async (selectedFile) => {
    if (!validateFile(selectedFile)) return;

    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }

    setError("");
    setFile(selectedFile);
    setSelectedResume(null);

    onSelect?.({
      file: selectedFile,
      existing: null,
      preview: null,
    });

    if (selectedFile.type === "application/pdf") {
      const url = URL.createObjectURL(selectedFile);
      setPreview({ type: "pdf", url });
      return;
    }

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();

    if (extension === "txt" || selectedFile.type === "text/plain") {
      try {
        const text = await selectedFile.text();
        setPreview({ type: "text", text });
      } catch {
        setPreview({ type: "text", text: "" });
      }

      return;
    }

    if (
      selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      selectedFile.type === "application/msword" ||
      extension === "doc" ||
      extension === "docx"
    ) {
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const { value: text } = await mammoth.extractRawText({ arrayBuffer });

        setPreview({
          type: "doc",
          text,
        });
      } catch {
        setPreview({
          type: "doc",
          text: "",
        });
      }

      return;
    }

    setPreview(null);
  };

  const selectExisting = (resume) => {
    const previewUrl = getResumePreviewUrl(resume);

    setSelectedResume(resume);
    setFile(null);
    setPreview(null);
    setError("");
    clearFileInput();

    onSelect?.({
      file: null,
      existing: resume,
      preview: previewUrl,
    });
  };

  return (
    <div className="space-y-4">
      {allowExisting && (
        <div className="edit-resume-tabs">
          <button
            type="button"
            onClick={() => {
              resetUploadSelection();
              setSelectedResume(null);
              setMode("existing");
            }}
            className={`edit-resume-tab ${mode === "existing" ? "active" : ""}`}
          >
            Select Existing
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedResume(null);
              setMode("upload");
            }}
            className={`edit-resume-tab ${mode === "upload" ? "active" : ""}`}
          >
            Upload Resume
          </button>
        </div>
      )}

      {mode === "existing" && allowExisting && (
        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="edit-section-title">Saved Resumes</p>
              <p className="edit-helper-text">
                Showing {Math.min(visibleCount, filteredResumes.length)} of{" "}
                {filteredResumes.length} resumes
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search resume..."
                className="edit-form-input py-2 pl-9 pr-3"
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

          {resumes.length === 0 ? (
            <div className="edit-empty-box">
              No saved resumes found. You can upload a new resume instead.
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="edit-empty-box">No resumes found for “{search}”.</div>
          ) : (
            <>
              <div className="view-modal-scroll max-h-80 space-y-2 overflow-y-auto pr-1">
                {visibleResumes.map((resume, index) => {
                  const id = getResumeId(resume) || `${getResumeTitle(resume)}-${index}`;
                  const isSelected = getResumeId(selectedResume) === getResumeId(resume);

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectExisting(resume)}
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

              {visibleCount < filteredResumes.length && (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((current) => current + RESUME_PAGE_SIZE)
                  }
                  className="mt-3 w-full rounded-lg border-2 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:border-[var(--color-brand)] hover:text-brand"
                >
                  Show more resumes
                </button>
              )}
            </>
          )}
        </div>
      )}

      {mode === "upload" && (
        <div className="space-y-3">
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
              handleFile(event.dataTransfer.files?.[0]);
            }}
            className={`edit-dropzone ${dragActive ? "active" : ""}`}
          >
            <Upload />

            <div>
              <div className="edit-dropzone-title">
                {file ? file.name : "Drop your resume here"}
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
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </div>

          {file && (
            <div className="edit-uploaded-file">
              <FileCheck2 />
              <span className="truncate">{file.name}</span>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  resetUploadSelection();
                }}
                aria-label="Remove selected resume"
              >
                <X />
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {(preview || selectedResume) && (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Preview</p>
              <p className="text-xs text-slate-500">
                {file
                  ? file.name
                  : selectedResume
                    ? getResumeTitle(selectedResume)
                    : "Resume preview"}
              </p>
            </div>

            <FileText className="h-5 w-5 text-brand" />
          </div>

          <div className="view-modal-scroll max-h-[60vh] overflow-y-auto p-4">
            {preview?.type === "pdf" && (
              <iframe
                title="resume-preview"
                src={preview.url}
                className={`w-full rounded-xl border bg-slate-50 ${height}`}
              />
            )}

            {(preview?.type === "doc" || preview?.type === "text") && (
              <div className={`view-modal-scroll overflow-y-auto rounded-xl border bg-slate-50 p-4 text-left text-sm leading-relaxed text-slate-700 ${height}`}>
                {preview.text ? (
                  <pre className="whitespace-pre-wrap break-words font-sans">
                    {preview.text}
                  </pre>
                ) : (
                  <div className="edit-empty-box">
                    Browser preview is not available for this file. The selected file
                    can still be uploaded.
                  </div>
                )}
              </div>
            )}

            {!preview && selectedResume && getResumePreviewUrl(selectedResume) && (
              <iframe
                title="resume-preview"
                src={getResumePreviewUrl(selectedResume)}
                className={`w-full rounded-xl border bg-slate-50 ${height}`}
              />
            )}

            {!preview && selectedResume && !getResumePreviewUrl(selectedResume) && (
              <div className="edit-empty-box">
                Preview is not available for this saved resume.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}