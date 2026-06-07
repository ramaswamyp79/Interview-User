import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Coins,
  CreditCard,
  Gift,
  HelpCircle,
  ShieldCheck,
  Tag,
  TimerReset,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { buyCredits } from "../../Services/paymentService";
import PreStripeModal from "../../Components/PreStripeModal";
import ConfirmPlanModal from "../../Components/ConfirmPlanModal";

const plansRow1 = [
  {
    id: "basic",
    title: "Basic",
    priceINR: "2,450",
    priceUSD: "$29.50",
    credits: 3,
    free: 0,
    popular: false,
    cta: "Buy credit",
  },
  {
    id: "plus",
    title: "Plus",
    priceINR: "4,500",
    priceUSD: "$50.00",
    credits: 6,
    free: 0,
    popular: true,
    cta: "Buy credit",
  },
  {
    id: "advanced",
    title: "Advanced",
    priceINR: "7,950",
    priceUSD: "$78.50",
    credits: 6,
    free: 3,
    popular: false,
    cta: "Buy credit",
  },
];

const plansRow2 = [
  {
    id: "starter",
    title: "Starter",
    priceINR: "1,450",
    priceUSD: "$16.00",
    credits: 1,
    free: 0,
    popular: false,
    cta: "Buy Credit",
  },
  {
    id: "pro",
    title: "Pro",
    priceINR: "10,500",
    priceUSD: "$121.50",
    credits: 12,
    free: 0,
    popular: false,
    cta: "Buy Credit",
  },
  {
    id: "enterprise",
    title: "Enterprise",
    priceINR: "18,500",
    priceUSD: "$217.00",
    credits: 20,
    free: 0,
    popular: false,
    cta: "Contact",
    isContactPlan: true,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

const CheckBadge = ({ children }) => (
  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-mid)] sm:text-sm">
    <Check className="h-3.5 w-3.5 shrink-0 text-[var(--teal)]" />
    <span>{children}</span>
  </div>
);

const PromoBanner = () => {
  return (
    <motion.div
      {...fadeUp}
      className="mb-7 flex flex-wrap items-center justify-center gap-2 rounded-lg border px-4 py-3 text-center text-sm font-medium shadow-sm sm:justify-start sm:px-5"
      style={{
        backgroundColor: "var(--teal-light)",
        borderColor: "var(--teal-mid)",
        color: "var(--text-mid)",
      }}
    >
      <Tag className="h-4 w-4 shrink-0 text-[var(--teal)]" />

      <span>Special offer for</span>

      <strong className="font-bold text-[var(--text-dark)]">IN India</strong>

      <span>users! Use code</span>

      <span className="rounded-md bg-[var(--teal)] px-2.5 py-1 text-xs font-bold tracking-wide text-white">
        INDA25
      </span>

      <span>for 25% off!</span>
    </motion.div>
  );
};

const PricingHeader = () => {
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.3, delay: 0.04, ease: "easeOut" }}
      className="mb-7 text-center"
    >
      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--teal)]">
        Pricing
      </div>

      <h1 className="mb-2 font-body text-3xl font-bold text-[var(--text-dark)]">
        No Subscription
      </h1>

      <p className="mb-3 text-sm text-[var(--text-mid)]">One-time payment</p>

      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
        <CheckBadge>30-Day Money Back</CheckBadge>
        <CheckBadge>Credits Never Expire</CheckBadge>
        <CheckBadge>1 Credit = 1 Interview</CheckBadge>
      </div>
    </motion.div>
  );
};

const PlanCard = ({ plan, selected, disabled, onSelect, onBuy }) => {
  const totalCredits = plan.credits + plan.free;

  return (
    <motion.div
      layout
      {...fadeUp}
      whileHover={{ y: -3 }}
      onClick={() => onSelect(plan.id)}
      className={`relative flex h-full cursor-pointer flex-col rounded-2xl border bg-white px-5 py-6 shadow-sm transition-all duration-200 ${
        selected ? "shadow-lg ring-2 ring-[var(--teal)]" : "hover:shadow-lg"
      }`}
      style={{
        borderColor: selected || plan.popular ? "var(--teal)" : "var(--border)",
      }}
    >
      {plan.popular && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--teal)] px-4 py-1 text-xs font-bold tracking-wide text-white shadow-sm">
          Popular
        </div>
      )}

      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[var(--text-dark)]">
            {plan.title}
          </h3>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-light)]">
            <CreditCard className="h-3.5 w-3.5" />
            <span>One-time</span>
          </div>
        </div>

        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--teal-light)] text-[var(--teal)]">
          {plan.free > 0 ? (
            <Gift className="h-5 w-5" />
          ) : (
            <Coins className="h-5 w-5" />
          )}
        </div>
      </div>

      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[var(--text-dark)]">
          ₹{plan.priceINR}
        </span>

        <span className="text-sm text-[var(--text-light)] line-through">
          {plan.priceUSD}
        </span>
      </div>

      <div className="mb-1 text-sm font-semibold text-[var(--text-dark)]">
        {plan.free > 0
          ? `${plan.credits} Interview Credits + ${plan.free} Free`
          : `${plan.credits} Interview Credit${plan.credits > 1 ? "s" : ""}`}
      </div>

      <div className="mb-5 text-xs text-[var(--text-light)]">
        {totalCredits} total credit{totalCredits > 1 ? "s" : ""} • One-time
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          onBuy(plan);
        }}
        className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
          plan.isContactPlan
            ? "border-2 border-[var(--teal)] bg-white text-[var(--teal)] hover:bg-[var(--teal-light)]"
            : "bg-[var(--teal)] text-white hover:bg-[var(--teal-dark)]"
        }`}
      >
        <span>{disabled ? "Please wait..." : plan.cta}</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

const SplitInfo = () => {
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
      className="mb-6 rounded-2xl border bg-white px-4 py-4 text-center shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--teal-light)] text-[var(--teal)]">
          <TimerReset className="h-5 w-5" />
        </div>

        <div>
          <strong className="block text-sm font-bold text-[var(--text-dark)]">
            You can split credits into 30-minute sessions.
          </strong>

          <span className="mt-1 block text-xs text-[var(--text-light)]">
            Use one credit for a full interview session or split into 2 slots.
            Each slot is 30 minutes.
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const BottomHelpCard = ({ selectedPlan, onBuySelected, onContact, disabled }) => {
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.3, delay: 0.12, ease: "easeOut" }}
      className="mt-2 flex flex-col items-start justify-between gap-4 rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur md:flex-row md:items-center"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--teal-light)] text-[var(--teal)]">
          <HelpCircle className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-base font-bold text-[var(--text-dark)]">
            Ready to buy credits?
          </h3>

          <p className="mt-1 text-sm text-[var(--text-mid)]">
            Selected plan:{" "}
            <span className="font-bold text-[var(--text-dark)]">
              {selectedPlan ? selectedPlan.title : "None"}
            </span>
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <button
          type="button"
          disabled={!selectedPlan || disabled || selectedPlan?.isContactPlan}
          onClick={onBuySelected}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--teal)] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--teal-dark)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy Selected Plan
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onContact}
          className="inline-flex items-center justify-center gap-2 rounded-lg border-2 bg-white px-4 py-2.5 text-sm font-bold text-[var(--text-dark)] transition-colors hover:border-[var(--teal)] hover:text-[var(--teal)]"
          style={{ borderColor: "var(--border)" }}
        >
          Contact Support
        </button>
      </div>
    </motion.div>
  );
};

const InterviewCredits = () => {
  const navigate = useNavigate();

  const [activePlan, setActivePlan] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showStripePrep, setShowStripePrep] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const allPlans = useMemo(() => [...plansRow1, ...plansRow2], []);

  const selectedPlan = useMemo(
    () => allPlans.find((plan) => plan.id === selectedPlanId) || null,
    [allPlans, selectedPlanId]
  );

  const openPaymentFlow = (plan) => {
    if (!plan || isPaying) return;

    setSelectedPlanId(plan.id);

    if (plan.isContactPlan) {
      navigate("/support");
      return;
    }

    setActivePlan(plan);
    setShowConfirm(true);
  };

  const closeConfirm = () => {
    if (isPaying) return;
    setShowConfirm(false);
  };

  const confirmPlan = () => {
    setShowConfirm(false);
    setShowStripePrep(true);
  };

  const closeStripePrep = () => {
    if (isPaying) return;
    setShowStripePrep(false);
    setActivePlan(null);
  };

  const handleStripeBack = () => {
    if (isPaying) return;
    setShowStripePrep(false);
    setShowConfirm(true);
  };

  const handlePay = async () => {
    if (!activePlan || isPaying) return;

    try {
      setIsPaying(true);

      await buyCredits({
        title: activePlan.title,
        amount: Number(String(activePlan.priceINR).replace(/,/g, "")),
        credits: activePlan.credits + activePlan.free,
      });
    } catch (error) {
      console.error("Failed to start payment:", error);
      setIsPaying(false);
    }
  };

  return (
    <>
      {showConfirm && activePlan && (
        <ConfirmPlanModal
          plan={activePlan}
          onClose={closeConfirm}
          onConfirm={confirmPlan}
        />
      )}

      {showStripePrep && activePlan && (
        <PreStripeModal
          plan={activePlan}
          onPay={handlePay}
          onBack={handleStripeBack}
          onClose={closeStripePrep}
          loading={isPaying}
          isPaying={isPaying}
        />
      )}

      <div className="content font-body">
        <PromoBanner />

        <PricingHeader />

        <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {plansRow1.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlanId === plan.id}
              disabled={isPaying}
              onSelect={setSelectedPlanId}
              onBuy={openPaymentFlow}
            />
          ))}
        </div>

        <SplitInfo />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {plansRow2.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlanId === plan.id}
              disabled={isPaying}
              onSelect={setSelectedPlanId}
              onBuy={openPaymentFlow}
            />
          ))}
        </div>

        <BottomHelpCard
          selectedPlan={selectedPlan}
          disabled={isPaying}
          onBuySelected={() => openPaymentFlow(selectedPlan)}
          onContact={() => navigate("/support")}
        />
      </div>
    </>
  );
};

export default InterviewCredits;