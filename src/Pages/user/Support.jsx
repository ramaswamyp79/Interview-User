import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileText,
  HelpCircle,
  MessageCircle,
  Phone,
  Send,
  XCircle,
} from "lucide-react";

const quickCards = [
  {
    title: "FAQ Interview Prep",
    description: "Common questions & quick help.",
    toast: "Opening FAQ...",
    Icon: HelpCircle,
  },
  {
    title: "Getting Started",
    description: "Setup your account quickly.",
    toast: "Opening Getting Started...",
    Icon: BookOpen,
  },
  {
    title: "Live Chat",
    description: "Quick help during office hours.",
    toast: "Connecting to live chat...",
    Icon: MessageCircle,
  },
  {
    title: "Email Templates",
    description: "Write professional emails easily.",
    toast: "Opening Email Templates...",
    Icon: FileText,
  },
];

const subjectOptions = [
  "Interview & Scoring",
  "Account & Billing",
  "Technical Issue",
  "Credits & Payments",
  "General Inquiry",
];

function SupportToast({ toast }) {
  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div
      className={`session-toast ${isError ? "error" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="session-toast-icon">
        {isError ? (
          <XCircle className="h-4 w-4" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}

export default function SupportPage() {
  const toastTimerRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ message, type });

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (status === "sent" || status === "error") {
      setStatus(null);
    }
  };

  const handleQuickCardClick = (message) => {
    showToast(message);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setStatus("sending");

      await new Promise((resolve) => {
        setTimeout(resolve, 900);
      });

      setStatus("sent");
      showToast("Message sent! We'll reply within 24 hours.");
    } catch (error) {
      console.error("Support form submit failed:", error);
      setStatus("error");
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  const isSending = status === "sending";
  const showInterviewTip = form.subject === "Interview & Scoring";

  return (
    <section className="w-full font-body animate-fadeInUp">
      <SupportToast toast={toast} />

      <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-2">
        <motion.div
          className="min-w-0"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="mb-6 max-w-md">
            <h1 className="mb-2 text-2xl font-bold text-main md:text-3xl">
              How Can We Help?
            </h1>

            <p className="text-sm leading-6 text-muted">
              Our support team is here to assist you with interview preparation,
              technical issues, or account-related questions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {quickCards.map(
              ({ title, description, toast: toastMessage, Icon }, index) => (
                <motion.button
                  key={title}
                  type="button"
                  onClick={() => handleQuickCardClick(toastMessage)}
                  className="group flex w-full cursor-pointer items-start gap-3 rounded-2xl border-2 border-brand bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-subtle hover:shadow-lg"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-subtle text-brand transition-colors group-hover:bg-white">
                    <Icon className="h-5 w-5" />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-main">
                      {title}
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-muted">
                      {description}
                    </span>
                  </span>
                </motion.button>
              )
            )}
          </div>
        </motion.div>

        <motion.aside
          className="w-full rounded-2xl border-2 border-brand bg-white p-5 shadow-sm sm:p-6"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4 p-3">
            <div>
              <label
                htmlFor="support-name"
                className="mb-1.5 block text-sm font-semibold text-main"
              >
                Your Name
              </label>

              <input
                id="support-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Radhika Gaikwad"
                className="input-focus-ring w-full rounded-lg border-2 border-brand bg-white px-3 py-2.5 text-sm text-main outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-400"
              />
            </div>

            <div>
              <label
                htmlFor="support-email"
                className="mb-1.5 block text-sm font-semibold text-main"
              >
                Your Email
              </label>

              <input
                id="support-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@company.com"
                className="input-focus-ring w-full rounded-lg border-2 border-brand bg-white px-3 py-2.5 text-sm text-main outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-400"
              />
            </div>

            <div>
              <label
                htmlFor="support-subject"
                className="mb-1.5 block text-sm font-semibold text-main"
              >
                Subject
              </label>

              <div className="relative">
                <select
                  id="support-subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="input-focus-ring w-full cursor-pointer appearance-none rounded-lg border-2 border-brand bg-white px-3 py-2.5 pr-9 text-sm text-main outline-none transition-colors focus:border-emerald-400"
                >
                  <option value="">Choose a topic</option>

                  {subjectOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label
                htmlFor="support-message"
                className="mb-1.5 block text-sm font-semibold text-main"
              >
                Message
              </label>

              <textarea
                id="support-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                required
                placeholder="Tell us about your issue..."
                className="input-focus-ring min-h-28 w-full resize-y rounded-lg border-2 border-brand bg-white px-3 py-2.5 text-sm leading-6 text-main outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-400"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSending}
                className="btn-dark justify-center disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Sending...
                  </>
                ) : status === "sent" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Sent
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Phone className="h-3.5 w-3.5" />
                <span>+1 (800) 123-4567</span>
              </div>
            </div>

            {showInterviewTip && (
              <motion.div
                className="rounded-lg bg-brand-subtle px-3 py-2 text-xs leading-5 text-brand-hover"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <strong>TIP:</strong> Selecting{" "}
                <strong>Interview & Scoring</strong> helps us fetch your latest
                mock interview results.
              </motion.div>
            )}

            {status === "sent" && (
              <motion.div
                className="rounded-lg border-2 border-emerald-100 bg-brand-subtle px-3 py-2 text-xs font-medium leading-5 text-brand-hover"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Message received! Our team will get back to you within 24 hours.
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                className="rounded-lg border-2 border-red-100 bg-red-50 px-3 py-2 text-xs font-medium leading-5 text-red-600"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Something went wrong while sending your message. Please try again.
              </motion.div>
            )}
          </form>
        </motion.aside>
      </div>
    </section>
  );
}