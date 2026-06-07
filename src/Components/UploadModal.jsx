import React, { useEffect, useMemo, useState } from "react";
import { FileCheck2, FileText, Upload, X } from "lucide-react";
import ResumeUploader from "./ResumeUploader";
import ResumeProcessingLoader from "./ResumeProcessingLoader";

const showUploadSessionToast = (message, type = "success") => {
  if (typeof document === "undefined") return;

  const oldToast = document.querySelector("[data-upload-session-toast='true']");

  if (oldToast) {
    oldToast.remove();
  }

  const toast = document.createElement("div");
  toast.setAttribute("data-upload-session-toast", "true");
  toast.className = `session-toast ${type === "error" ? "error" : ""}`;

  const icon = document.createElement("span");
  icon.className = "session-toast-icon";
  icon.textContent = type === "error" ? "✕" : "✓";

  const text = document.createElement("span");
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);

  document.body.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2500);
};

export default function UploadModal({ open, onClose, onUpload }) {
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [loaderOpen, setLoaderOpen] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const canUpload = useMemo(() => {
    return Boolean(title.trim() && selectedFile && !processing && !loaderOpen);
  }, [title, selectedFile, processing, loaderOpen]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setSelectedFile(null);
      setProcessing(false);
      setLoaderOpen(false);
      setUploadError("");
    }
  }, [open]);

  const handleClose = () => {
    if (processing || loaderOpen) return;
    onClose?.();
  };

  const handleUpload = async () => {
    if (!canUpload) return;

    try {
      setUploadError("");
      setLoaderOpen(true);
      setProcessing(true);

      const response = await onUpload?.({
        file: selectedFile,
        title: title.trim(),
      });

      const isSuccess = response?.success !== false && response?.error !== true;

      if (!isSuccess) {
        throw new Error(response?.message || "Upload failed");
      }

      window.dispatchEvent(new Event("resume-updated"));

      setProcessing(false);
    } catch (error) {
      console.error("Resume upload failed:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Upload failed. Please try again.";

      setLoaderOpen(false);
      setProcessing(false);
      setUploadError(message);

      showUploadSessionToast(message, "error");
    }
  };

  if (!open) return null;

  return (
    <div
      className="edit-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="edit-modal-box max-w-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-resume-title"
      >
        <button
          type="button"
          onClick={handleClose}
          disabled={processing || loaderOpen}
          className="edit-modal-close disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close upload resume modal"
        >
          <X />
        </button>

        <div className="edit-modal-header">
          <div className="edit-modal-icon">
            <Upload />
          </div>

          <div className="min-w-0">
            <h2 id="upload-resume-title" className="edit-modal-title">
              Upload Resume
            </h2>

            <p className="edit-modal-sub">
              Upload a resume to use in interview sessions and AI answers.
            </p>
          </div>
        </div>

        <div className="edit-body view-modal-scroll">
          <div className="space-y-5">
            <div className="edit-info-box">
              <div className="edit-info-title">Resume Upload</div>

              <div className="edit-info-desc">
                Add a clear resume title and upload a PDF, DOC, DOCX, or TXT
                file. The resume will be processed and saved securely.
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="edit-form-label">
                <FileText />
                Resume Title <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Example: Frontend Developer Resume"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setUploadError("");
                }}
                disabled={processing || loaderOpen}
                className="edit-form-input disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
              />
            </div>

            <div className="space-y-2">
              <label className="edit-form-label">
                <FileCheck2 />
                Upload Resume <span className="text-red-500">*</span>
              </label>

              <ResumeUploader
                allowExisting={false}
                onSelect={({ file }) => {
                  setSelectedFile(file || null);
                  setUploadError("");
                }}
                height="h-96"
              />
            </div>

            {uploadError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {uploadError}
              </div>
            )}
          </div>
        </div>

        <div className="edit-footer">
          <button
            type="button"
            onClick={handleClose}
            disabled={processing || loaderOpen}
            className="btn-outline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={!canUpload}
            className="btn-teal ml-auto disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload />
            Upload Resume
          </button>
        </div>
      </div>

      <ResumeProcessingLoader
        open={loaderOpen}
        processing={processing}
        onComplete={() => {
          setLoaderOpen(false);
          setProcessing(false);

          showUploadSessionToast("Resume uploaded successfully.");

          onClose?.();
        }}
        successMessage="Resume saved successfully!"
      />
    </div>
  );
}