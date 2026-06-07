import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Coins,
  CreditCard,
  Gift,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

const PreStripeModal = ({
  plan,
  onPay,
  onBack,
  onClose,
  loading = false,
  isPaying = false,
}) => {
  if (!plan) return null;

  const baseCredits = Number(plan.credits || 0);
  const freeCredits = Number(plan.free || 0);
  const totalCredits = baseCredits + freeCredits;
  const hasFreeCredits = freeCredits > 0;
  const paying = loading || isPaying;

  const handleOverlayClose = () => {
    if (paying) return;
    onClose?.();
  };

  const handleBack = () => {
    if (paying) return;
    onBack?.();
  };

  const handleClose = () => {
    if (paying) return;
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 p-4 font-body backdrop-blur-sm"
      onClick={handleOverlayClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stripe-modal-title"
      >
        <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[var(--color-brand-subtle)] blur-2xl" />
        <div className="absolute -bottom-12 left-8 h-24 w-24 rounded-full bg-sky-100 blur-2xl" />

        <div className="relative px-5 pb-5 pt-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={paying}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--session-border)] bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition-colors hover:border-[var(--color-brand)] hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <button
              type="button"
              onClick={handleClose}
              disabled={paying}
              className="grid h-8 w-8 place-items-center rounded-lg bg-white text-slate-400 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close Stripe payment modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4 flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--color-brand-subtle)] text-brand">
              <CreditCard className="h-5 w-5" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Almost there
              </div>

              <h2
                id="stripe-modal-title"
                className="mt-2 text-xl font-bold text-slate-900"
              >
                Secure checkout
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                You’ll be redirected to Stripe. We never store card details.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--session-border)] bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {plan.title || plan.name || "Selected Plan"}
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  {totalCredits} interview credit{totalCredits > 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-subtle)] text-brand">
                {hasFreeCredits ? (
                  <Gift className="h-5 w-5" />
                ) : (
                  <Coins className="h-5 w-5" />
                )}
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="space-y-1 text-sm text-slate-500">
                <div>
                  Base:{" "}
                  <span className="font-bold text-slate-900">
                    {baseCredits}
                  </span>
                </div>

                {hasFreeCredits && (
                  <div className="text-emerald-600">
                    Free:{" "}
                    <span className="font-bold">+{freeCredits}</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold text-slate-400">
                  Amount
                </p>
                <p className="text-2xl font-bold text-brand">
                  ₹{plan.priceINR}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-subtle)] px-3 py-2 text-xs font-semibold text-[var(--color-brand-hover)]">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Stripe secure
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-subtle)] px-3 py-2 text-xs font-semibold text-[var(--color-brand-hover)]">
              <LockKeyhole className="h-4 w-4 shrink-0" />
              No card storage
            </div>
          </div>

          <button
            type="button"
            onClick={onPay}
            disabled={paying}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {paying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                Pay securely
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-slate-400">
            Secure payment powered by Stripe.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PreStripeModal;