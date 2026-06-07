import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.35, ease: "easeOut" },
};

const CheckIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 10l4 4 8-8" />
  </svg>
);

const WindowsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

const MacIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12a3 3 0 016 0" />
    <path d="M12 15v3" />
  </svg>
);

const LinuxIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const LightningIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ClockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4l3 3" />
  </svg>
);

const OfflineIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 6l5 5 5-5" />
    <path d="M5 11V3" />
    <path d="M15 12h5" />
    <path d="M18 9v6" />
  </svg>
);

const DOWNLOAD_OPTIONS = [
  {
    key: "windows",
    label: "Windows",
    message: "Downloading for Windows.",
    icon: <WindowsIcon />,
    href: "#",
  },
  {
    key: "mac",
    label: "Mac",
    message: "Downloading for Mac.",
    icon: <MacIcon />,
    href: "#",
  },
  {
    key: "linux",
    label: "Linux",
    message: "Downloading for Linux.",
    icon: <LinuxIcon />,
    href: "#",
  },
];

const FEATURES = [
  {
    title: "Blazing Fast Performance",
    description: "Runs smoothly even on low-end devices.",
    icon: <LightningIcon />,
  },
  {
    title: "Smart AI Assistance",
    description: "Ask AI, get suggestions, improve instantly.",
    icon: <ClockIcon />,
  },
  {
    title: "Offline Mode",
    description: "Practice anytime—even without internet.",
    icon: <OfflineIcon />,
  },
];

const SETUP_STEPS = [
  {
    step: "Step 1",
    title: "Download",
    description: "Choose your OS and download.",
  },
  {
    step: "Step 2",
    title: "Install",
    description: "Open installer & follow steps.",
  },
  {
    step: "Step 3",
    title: "Start Practicing",
    description: "Launch and begin instantly.",
  },
];

export default function Download() {
  const toastTimerRef = useRef(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
  });

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      open: true,
      message,
    });

    toastTimerRef.current = setTimeout(() => {
      setToast({
        open: false,
        message: "",
      });
    }, 2500);
  };

  const handleDownload = (option) => {
    showToast(option.message);

    if (option.href && option.href !== "#") {
      window.open(option.href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-full bg-page  font-body text-main">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-7">
        {/* HERO SECTION */}
        <motion.section
          {...fadeUp}
          className="rounded-xl border border-brand bg-white px-5 py-10 text-center shadow-sm sm:px-8 lg:px-10"
        >
          <h1 className="font-body text-2xl font-bold tracking-tight text-main sm:text-3xl">
            Download AnswerFlow Desktop App
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base">
            Supercharge your interview practice with a clean, fast and offline-ready desktop app.
          </p>

          <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {DOWNLOAD_OPTIONS.map((option) => (
              <DownloadButton
                key={option.key}
                icon={option.icon}
                label={option.label}
                onClick={() => handleDownload(option)}
              />
            ))}
          </div>
        </motion.section>

        {/* FEATURES SECTION */}
        <section>
          <motion.h2
            {...fadeUp}
            className="mb-5 text-center font-body text-lg font-bold text-main sm:text-xl"
          >
            Powerful Features — Built for You
          </motion.h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>

        {/* SETUP STEPS SECTION */}
        <section>
          <motion.h2
            {...fadeUp}
            className="mb-5 text-center font-body text-lg font-bold text-main sm:text-xl"
          >
            Setup in 3 Simple Steps
          </motion.h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {SETUP_STEPS.map((item) => (
              <StepCard
                key={item.step}
                step={item.step}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <motion.section
          {...fadeUp}
          className="rounded-xl bg-slate-900 px-5 py-10 text-center shadow-sm sm:px-8"
        >
          <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
            Ready to Level Up Your Interview Skills?
          </h2>

          <p className="mx-auto mt-2 mb-6 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
            Download the free Desktop App and start your journey.
          </p>

          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {DOWNLOAD_OPTIONS.map((option) => (
              <DownloadButton
                key={`cta-${option.key}`}
                icon={option.icon}
                label={option.label}
                variant="white"
                onClick={() => handleDownload(option)}
              />
            ))}
          </div>
        </motion.section>
      </div>

      {/* TOAST */}
      <div
        aria-live="polite"
        className={`fixed bottom-6 right-6 z-[999999] flex max-w-xs items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-xl transition-all duration-200 ${
          toast.open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <span className="text-brand">
          <CheckIcon />
        </span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

function DownloadButton({ icon, label, variant = "default", onClick }) {
  const isWhite = variant === "white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-body text-sm font-semibold transition-all duration-150 ${
        isWhite
          ? "border border-white/40 bg-white/10 text-white hover:bg-white/20"
          : "bg-brand text-white shadow-md hover-bg-brand"
      }`}
    >
      <span className="h-4 w-4 shrink-0">{icon}</span>
      <span>Download for {label}</span>
    </button>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.article
      {...fadeUp}
      whileHover={{ y: -3 }}
      className="rounded-xl border border-brand bg-white px-5 py-7 text-center shadow-sm transition-shadow duration-200 hover:shadow-xl"
    >
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-brand-subtle text-brand">
        <span className="h-7 w-7">{icon}</span>
      </div>

      <h3 className="mb-2 text-base font-semibold text-main">{title}</h3>

      <p className="text-sm leading-6 text-muted">{description}</p>
    </motion.article>
  );
}

function StepCard({ step, title, description }) {
  return (
    <motion.article
      {...fadeUp}
      whileHover={{ y: -3 }}
      className="rounded-xl border border-brand bg-white px-5 py-6 text-center shadow-sm transition-shadow duration-200 hover:shadow-xl"
    >
      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">
        {step}
      </div>

      <h3 className="mb-1.5 text-base font-bold text-main">{title}</h3>

      <p className="text-sm leading-6 text-muted">{description}</p>
    </motion.article>
  );
}