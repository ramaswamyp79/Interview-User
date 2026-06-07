import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Database,
  FileUp,
  Loader2,
  ScanText,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

const PROCESS_STEPS = [
  {
    label: "Uploading resume.",
    icon: FileUp,
  },
  {
    label: "Extracting content.",
    icon: ScanText,
  },
  {
    label: "Analyzing skills with AI.",
    icon: Sparkles,
  },
  {
    label: "Generating structured data.",
    icon: Database,
  },
  {
    label: "Saving resume securely.",
    icon: ShieldCheck,
  },
];

export default function ResumeProcessingLoader({
  open,
  processing = true,
  onComplete,
  onClose,
  successMessage = "Resume saved successfully!",
}) {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const completedCalledRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setCompleted(false);
      completedCalledRef.current = false;
      return;
    }

    setProgress(0);
    setCompleted(false);
    completedCalledRef.current = false;
  }, [open]);

  useEffect(() => {
    if (!open || !processing) return undefined;

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 86) return current;

        const nextValue = current + 7;
        return nextValue > 86 ? 86 : nextValue;
      });
    }, 220);

    return () => window.clearInterval(interval);
  }, [open, processing]);

  useEffect(() => {
    if (!open || processing) return undefined;

    setProgress(100);
    setCompleted(true);

    const timer = window.setTimeout(() => {
      if (!completedCalledRef.current) {
        completedCalledRef.current = true;
        onComplete?.();
      }
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [open, processing, onComplete]);

  if (!open) return null;

  const activeStep = completed
    ? PROCESS_STEPS.length
    : Math.max(1, Math.ceil((progress / 100) * PROCESS_STEPS.length));

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {onClose && completed && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-md text-slate-400 transition-colors hover:text-slate-700"
            aria-label="Close processing modal"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="px-7 py-8 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full border-2 border-[var(--color-brand)] bg-[var(--color-brand-subtle)]">
            {completed ? (
              <CheckCircle2 className="h-7 w-7 text-brand" />
            ) : (
              <Loader2 className="h-7 w-7 animate-spin text-brand" />
            )}
          </div>

          <h3 className="mb-1 text-lg font-bold text-brand">
            {completed ? "Resume Processed!" : "Processing Resume..."}
          </h3>

          <p className="mb-6 text-xs leading-relaxed text-slate-500">
            {completed
              ? successMessage
              : "Please wait while we upload, analyze, and save your resume."}
          </p>

          <div className="mb-6 space-y-2.5 text-left">
            {PROCESS_STEPS.map((step, index) => {
              const Icon = step.icon;
              const stepNumber = index + 1;
              const isDone = completed || stepNumber < activeStep;
              const isActive = !completed && stepNumber === activeStep;

              return (
                <div
                  key={step.label}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-[var(--color-brand-subtle)] text-[var(--color-brand-hover)]"
                      : isDone
                        ? "text-[var(--color-brand-hover)]"
                        : "text-slate-400"
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                      isDone
                        ? "bg-[var(--color-brand)] text-white"
                        : isActive
                          ? "bg-white text-brand"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </span>

                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[var(--color-brand)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-2 text-right text-[11px] font-bold text-slate-400">
            {progress}%
          </div>
        </div>
      </div>
    </div>
  );
}