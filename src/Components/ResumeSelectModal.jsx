import React, { useState, useEffect } from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import ResumeUploader from "./ResumeUploader";

export default function ResumeSelectModal({
  isOpen,
  onClose,
  onBack,
  onNext,
  resumes = [],
}) {
  const [selection, setSelection] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSelection(null);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (!selection) {
      setError("Please select or upload a resume.");
      return;
    }

    onNext({
      selectedResume: selection.existing || null,
      uploadedFile: selection.file || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative max-h-[90vh] overflow-auto p-6">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-2">Select Resume</h2>
        <p className="text-gray-600 text-sm mb-6">
          Choose an existing resume or upload a new one.
        </p>

        {/* Reusable uploader */}
        <ResumeUploader
          resumes={resumes}
          allowExisting={true}
          onSelect={(data) => {
            setSelection(data);
            setError("");
          }}
          height="h-[450px]"
        />

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            <ArrowLeft size={15} /> Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium
            bg-gradient-to-r from-indigo-600 via-sky-500 to-teal-500
            hover:from-indigo-700 hover:via-sky-600 hover:to-teal-600"
          >
            Next <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}