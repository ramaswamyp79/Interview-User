import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import ResumeUploader from "./ResumeUploader";
import { uploadToGCS } from "../utils/gcsUpload";
import ResumeProcessingLoader from "./ResumeProcessingLoader";

export default function UploadResumeModal({
  isOpen,
  onClose,
  onUpload,
}) {
  const [selection, setSelection] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelection(null);
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!selection?.file) {
      setError("Please upload a resume.");
      return;
    }

    try {
      setProcessing(true);

      const url = await uploadToGCS(
        selection.file,
        selection.file.name
      );

      onUpload(url, selection.file.name);

    } catch (err) {
      setError("Upload failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
     <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative p-6 
                max-h-[90vh] flex flex-col">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-2">Upload Resume</h2>
        <p className="text-gray-600 text-sm mb-6">
          Upload your resume to use in sessions.
        </p>

        {/* ResumeUploader (upload mode only) */}
        <ResumeUploader
          allowExisting={false}
          onSelect={(data) => {
            setSelection(data);
            setError("");
          }}
          height="h-[400px]"
        />

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-6 py-2 rounded-lg text-white font-medium
            bg-gradient-to-r from-indigo-600 via-sky-500 to-teal-500
            hover:from-indigo-700 hover:via-sky-600 hover:to-teal-600
            disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
     <div className="flex-1 overflow-y-auto pr-1">
  <ResumeUploader
    allowExisting={false}
    onSelect={(data) => {
      setSelection(data);
      setError("");
    }}
    height="h-[450px]"
  />
</div>
    </div>
  );
}