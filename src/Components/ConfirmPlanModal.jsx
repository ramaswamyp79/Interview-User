import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  Gift,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

const ConfirmPlanModal = ({ plan, onConfirm, onClose }) => {
  if (!plan) return null;

  const baseCredits = Number(plan.credits || 0);
  const freeCredits = Number(plan.free || 0);
  const totalCredits = baseCredits + freeCredits;
  const hasFreeCredits = freeCredits > 0;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 p-4 font-body backdrop-blur-sm"
      onClick={onClose}
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
        aria-labelledby="confirm-plan-title"
      >
        <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[var(--color-brand-subtle)] blur-2xl" />
        <div className="absolute -bottom-12 left-8 h-24 w-24 rounded-full bg-sky-100 blur-2xl" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-slate-400 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close confirm plan modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative px-5 pb-5 pt-6">
          <div className="mb-4 flex items-start gap-3 pr-8">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--color-brand-subtle)] text-brand">
              {hasFreeCredits ? (
                <Gift className="h-5 w-5" />
              ) : (
                <Coins className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                One-time payment
              </div>

              <h2
                id="confirm-plan-title"
                className="mt-2 text-xl font-bold text-slate-900"
              >
                Confirm your plan
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review your plan before checkout.
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

              {plan.popular && (
                <span className="rounded-full bg-[var(--color-brand)] px-2.5 py-1 text-[11px] font-bold text-white">
                  Popular
                </span>
              )}
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
                  Payable
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
              Safe payment
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-subtle)] px-3 py-2 text-xs font-semibold text-[var(--color-brand-hover)]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Never expires
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-[var(--session-border)] bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-[var(--color-brand)] hover:text-brand"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-brand-hover)]"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmPlanModal;