import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";
import { getUserCredits } from "../../Services/userService";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Home,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const statusConfig = {
  verifying: {
    title: "Verifying your payment",
    description: "Please wait while we securely confirm your transaction.",
    badge: "Secure verification",
  },
  paid: {
    title: "Payment Successful!",
    description: "Your interview credits have been added successfully.",
    badge: "Credits updated",
  },
  unpaid: {
    title: "Payment Verification Issue",
    description:
      "Payment was not completed. If money was deducted, contact support.",
    badge: "Payment incomplete",
  },
  error: {
    title: "Payment Verification Issue",
    description: "Something went wrong while verifying your payment.",
    badge: "Verification failed",
  },
  missing: {
    title: "Payment Verification Issue",
    description: "Invalid payment session. Please try again.",
    badge: "Invalid session",
  },
};

const fadeCard = {
  initial: { opacity: 0, scale: 0.96, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: -8 },
  transition: { duration: 0.28, ease: "easeOut" },
};

function StatusIcon({ status }) {
  if (status === "verifying") {
    return (
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (status === "paid") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--color-brand-subtle)] text-brand shadow-sm"
      >
        <CheckCircle2 className="h-9 w-9" />
      </motion.div>
    );
  }

  return (
    <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-500 shadow-sm">
      <AlertTriangle className="h-9 w-9" />
    </div>
  );
}

function TrustRow() {
  return (
    <div className="mt-5 grid grid-cols-1 gap-2 text-left">
      <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-subtle)] px-3 py-2 text-xs font-semibold text-[var(--color-brand-hover)]">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>Secure payment verification</span>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-subtle)] px-3 py-2 text-xs font-semibold text-[var(--color-brand-hover)]">
        <CreditCard className="h-4 w-4 shrink-0" />
        <span>Credits are synced with your account</span>
      </div>
    </div>
  );
}

const PaymentSuccess = () => {
  const [status, setStatus] = useState("verifying");

  const location = useLocation();
  const navigate = useNavigate();

  const currentStatus = useMemo(() => {
    return statusConfig[status] || statusConfig.verifying;
  }, [status]);

  const isSuccess = status === "paid";
  const isVerifying = status === "verifying";
  const isIssue = status === "unpaid" || status === "error" || status === "missing";

  useEffect(() => {
    let mounted = true;
    let redirectTimer = null;

    const params = new URLSearchParams(location.search);
    const session_id = params.get("session_id");

    if (!session_id) {
      setStatus("missing");
      return undefined;
    }

    const verifyPayment = async () => {
      try {
        const res = await api.post("/users/verify-checkout", { session_id });

        if (!mounted) return;

        if (res.data?.ok) {
          setStatus("paid");

          try {
            const credits = await getUserCredits();

            if (!mounted) return;

            console.log("Updated credits:", credits);

            localStorage.setItem("credits", credits);

            window.dispatchEvent(
              new CustomEvent("creditsUpdated", {
                detail: { credits },
              })
            );
          } catch (err) {
            console.error("Error fetching credits:", err);
          }

          redirectTimer = setTimeout(() => {
            navigate("/home", {
              state: {
                completedSteps: [0, 1, 2],
                ctaStep: 3,
              },
            });
          }, 3000);

          return;
        }

        setStatus("unpaid");
      } catch (err) {
        console.error("Verification failed:", err);

        if (mounted) {
          setStatus("error");
        }
      }
    };

    verifyPayment();

    return () => {
      mounted = false;

      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [location.search, navigate]);

  return (
    <main className="h-screen bg-page  font-body text-main">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-2xl border border-[var(--session-border)] bg-white shadow-2xl lg:grid-cols-[minmax(0,1fr)_26rem]">
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-8 py-10 lg:block">
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[var(--color-brand-subtle)] blur-3xl" />
            <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-sky-100 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  AnswerFlow Credits
                </div>

                <h1 className="max-w-md text-3xl font-bold leading-tight text-slate-900">
                  Your interview practice journey is ready to continue.
                </h1>

                <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
                  Once payment is verified, your new credits are added to your
                  account and you can start practicing with AI-powered interview
                  feedback instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-brand-subtle)] text-brand">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Secure verification
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Your checkout session is verified safely.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-brand-subtle)] text-brand">
                      <CreditCard className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Credits synced
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Your balance updates automatically after payment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative px-5 py-8 text-center sm:px-8 sm:py-10">
            <AnimatePresence mode="wait">
              <motion.div key={status} {...fadeCard}>
                <div
                  className={`mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                    isIssue
                      ? "bg-red-50 text-red-600"
                      : "bg-[var(--color-brand-subtle)] text-[var(--color-brand-hover)]"
                  }`}
                >
                  {isIssue ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {currentStatus.badge}
                </div>

                <StatusIcon status={status} />

                <h2 className="text-2xl font-bold text-slate-900">
                  {currentStatus.title}
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {currentStatus.description}
                </p>

                {isVerifying && (
                  <div className="mt-6">
                    <div className="mx-auto h-2 max-w-xs overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        className="h-full rounded-full bg-[var(--color-brand)]"
                        initial={{ width: "20%" }}
                        animate={{ width: ["20%", "70%", "92%"] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut",
                        }}
                      />
                    </div>

                    <p className="mt-3 text-xs font-medium text-slate-400">
                      Do not close this page while verification is in progress.
                    </p>
                  </div>
                )}

                {isSuccess && (
                  <>
                    <div className="mt-6 rounded-2xl border border-emerald-100 bg-[var(--color-brand-subtle)] p-4 text-left">
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand">
                          <Sparkles className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            You’re all set!
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Start practicing interviews with AI-powered feedback.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/home", {
                          state: {
                            completedSteps: [2],
                            ctaStep: 3,
                          },
                        })
                      }
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-brand-hover)]"
                    >
                      <Home className="h-4 w-4" />
                      Go to Home
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <p className="mt-3 text-xs text-slate-400">
                      Redirecting automatically in a few seconds…
                    </p>
                  </>
                )}

                {isIssue && (
                  <>
                    <TrustRow />

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => navigate("/pricing")}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[var(--session-border)] bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-[var(--color-brand)] hover:text-brand"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Pricing
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/support")}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-brand-hover)]"
                      >
                        Contact Support
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </div>
    </main>
  );
};

export default PaymentSuccess;