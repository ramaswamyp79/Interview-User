import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";

const CompletedTag = () => (
  <div className="completed-tag">
    ✅ Completed
  </div>
);

const StepBadge = ({ children, className = "" }) => (
  <div className={`step-badge ${className}`}>
    {children}
  </div>
);

const IconBox = ({ children }) => (
  <div className="icon-box">
    {children}
  </div>
);

const PrimaryButton = ({ children, onClick, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`primary-btn ${className}`}
  >
    {children}
  </button>
);

const StepCard = ({
  badge,
  badgeClassName = "",
  icon,
  description,
  buttonText,
  onButtonClick,
  completed,
  animationClass,
  isActive = false,
  showRecommendation = false,
  buttonClassName = "",
}) => (
  <div
    className={`step-card ${animationClass} ${
      isActive ? "step-card-active" : "step-card-hover"
    }`}
  >
    <StepBadge className={badgeClassName}>{badge}</StepBadge>

    <IconBox>{icon}</IconBox>

    <p className="card-description">
      {description}
    </p>

    <PrimaryButton
      onClick={onButtonClick}
      className={buttonClassName}
    >
      {buttonText}
    </PrimaryButton>

    {completed && <CompletedTag />}

    {showRecommendation && (
      <div className="recommendation-wrapper">
        <div className="text-3xl animate-bounce">👆</div>
        <div className="recommendation-text">
          We recommend starting your interview now
        </div>
      </div>
    )}
  </div>
);

const FeatureCard = ({ icon, title, description, animationClass }) => (
  <div className={`feature-card ${animationClass}`}>
    <div className="feature-icon-box">
      {icon}
    </div>

    <div className="feature-title">
      {title}
    </div>

    <p className="feature-description">
      {description}
    </p>
  </div>
);

const UploadIcon = () => (
  <svg
    className="step-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const PlayIcon = () => (
  <svg
    className="step-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const CreditIcon = () => (
  <svg
    className="step-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const InterviewIcon = () => (
  <svg
    className="step-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 5l2 2-2 2M9 19l-2-2 2-2" />
    <circle cx="12" cy="12" r="9" />
    <line x1="9" y1="12" x2="17" y2="12" />
  </svg>
);

const RealisticQuestionIcon = () => (
  <svg
    className="feature-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

const FeedbackIcon = () => (
  <svg
    className="feature-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const VoiceIcon = () => (
  <svg
    className="feature-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
  </svg>
);

const HeroIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="hero-svg"
    viewBox="0 0 72 72"
    fill="none"
  >
    <path
      d="M36 6C39.3 6 42 8.7 42 12C42 15.3 39.3 18 36 18C32.7 18 30 15.3 30 12C30 8.7 32.7 6 36 6ZM47.7 24.3C46.5 23.1 44.4 21 40.5 21H33C24.6 21 18 14.4 18 6H12C12 15.6 18.3 23.4 27 26.1V66H33V48C33 48 36.7771 47.259 39 48V66H45V30.3L57 42L61.2 37.8L47.7 24.3Z"
      fill="url(#g1)"
    />
    <defs>
      <linearGradient
        id="g1"
        x1="36.6"
        y1="6"
        x2="36.6"
        y2="66"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="var(--color-brand-gradient-start)" />
        <stop offset="1" stopColor="var(--color-brand-gradient-end)" />
      </linearGradient>
    </defs>
  </svg>
);

const SuccessIcon = () => (
  <svg
    className="payment-success-icon-svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const getIndianGreeting = () => {
  const hourPart = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    hour12: false,
  })
    .formatToParts(new Date())
    .find((part) => part.type === "hour")?.value;

  const hour = Number(hourPart) === 24 ? 0 : Number(hourPart);

  if (hour >= 5 && hour < 12) {
    return {
      title: "Good Morning",
      message: "Start your day with focused interview practice.",
    };
  }

  if (hour >= 12 && hour < 17) {
    return {
      title: "Good Afternoon",
      message: "Keep your preparation momentum strong today.",
    };
  }

  if (hour >= 17 && hour < 22) {
    return {
      title: "Good Evening",
      message: "A calm practice session can improve your confidence.",
    };
  }

  return {
    title: "Good Night",
    message: "It is late in India. You can do a light practice session or continue tomorrow with a fresh mind.",
  };
};

const isPaymentSuccess = (location) => {
  const state = location?.state || {};
  const params = new URLSearchParams(location.search);

  const status =
    params.get("payment") ||
    params.get("status") ||
    params.get("paymentStatus");

  const paymentSuccessParam = params.get("paymentSuccess");
  const successParam = params.get("success");

  return (
    state.paymentSuccess === true ||
    state.paymentStatus === "success" ||
    status === "success" ||
    status === "paid" ||
    status === "completed" ||
    paymentSuccessParam === "true" ||
    successParam === "true"
  );
};

const PaymentSuccessBanner = ({ onStartInterview }) => (
  <div className="payment-success-card animate-fadeInUp">
    <div className="payment-success-left">
      <div className="payment-success-icon">
        <SuccessIcon />
      </div>

      <div>
        <h2 className="payment-success-title">
          Payment successful! Your credits are ready.
        </h2>

        <p className="payment-success-text">
          You can now start your interview session. We have highlighted the next recommended step for you.
        </p>
      </div>
    </div>

    <button
      type="button"
      className="primary-btn payment-success-action"
      onClick={onStartInterview}
    >
      Start Interview
    </button>
  </div>
);

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const outletContext = useOutletContext();

  const [completedSteps, setCompletedSteps] = useState([]);
  const [ctaStep, setCtaStep] = useState(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  const greeting = getIndianGreeting();

  const userName =
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    localStorage.getItem("fullName") ||
    "Radhika";

  useEffect(() => {
    const paymentSuccess = isPaymentSuccess(location);

    if (location?.state) {
      setCompletedSteps(location.state.completedSteps || []);
      setCtaStep(location.state.ctaStep || null);

      if (location.state.ctaStep === 3) {
        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
        }, 250);
      }
    }

    if (paymentSuccess) {
      setShowPaymentSuccess(true);

      setCompletedSteps((prev) => {
        const currentSteps = location.state?.completedSteps || prev;
        return Array.from(new Set([...currentSteps, 2]));
      });

      setCtaStep(3);

      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 150);
    }
  }, [location]);

  const handleUploadResume = () => {
    navigate("/resume");
  };

  const handleTrial = () => {
    if (outletContext?.openCreateSessionModal) {
      outletContext.openCreateSessionModal();
      return;
    }

    window.dispatchEvent(new Event("open-create-session"));
  };

  const handleBuyCredits = () => {
    navigate("/buy-credits");
  };

  const handleStartInterview = () => {
    navigate("/interview");
  };

  return (
    <div className="app-shell">
      <div className="page-container">
        {showPaymentSuccess && (
          <PaymentSuccessBanner onStartInterview={handleStartInterview} />
        )}

        {/* ═══ HERO GREETING ═══ */}
        <div className="hero-section">
          <div className="shrink-0">
            <HeroIcon />
          </div>

          <h1 className="hero-title">
            {greeting.title}, {userName}
          </h1>

          <p className="hero-subtitle">
            {greeting.message}
          </p>
        </div>

        {/* ═══ STEPS GRID ═══ */}
        <div className="steps-grid">
          <StepCard
            badge="Optional   Resume"
            badgeClassName="badge-optional"
            icon={<UploadIcon />}
            description="Upload your resume to generate custom answers for job interview questions."
            buttonText="Upload Resume"
            onButtonClick={handleUploadResume}
            completed={completedSteps.includes(0)}
            animationClass="animate-fadeSlide"
          />

          <StepCard
            badge="Step 1   Trial Session"
            icon={<PlayIcon />}
            description="Try a free 10-minute session and see how easy it is to practice interviews."
            buttonText="Create Session"
            onButtonClick={handleTrial}
            completed={completedSteps.includes(1)}
            animationClass="animate-fadeSlideDelay1"
          />

          <StepCard
            badge="Step 2   Buy Credits"
            icon={<CreditIcon />}
            description="Purchase credits for real interview sessions. No subscription needed!"
            buttonText="Buy Credits"
            onButtonClick={handleBuyCredits}
            completed={completedSteps.includes(2)}
            animationClass="animate-fadeSlideDelay2"
            buttonClassName="font-bold"
          />

          <StepCard
            badge="Step 3   Real Interview"
            icon={<InterviewIcon />}
            description="Use your credits for a real mock interview and get your dream job!"
            buttonText="Start Interview"
            onButtonClick={handleStartInterview}
            completed={false}
            animationClass="animate-fadeSlideDelay3"
            isActive={ctaStep === 3}
            showRecommendation={ctaStep === 3}
            buttonClassName={ctaStep === 3 ? "cta-btn-active" : ""}
          />
        </div>

        {/* ═══ FEATURES SECTION ═══ */}
        <div className="features-header">
          <div className="features-kicker">
            ✦ Features
          </div>

          <h2 className="features-heading">
            Your AI-Powered Interview Partner
          </h2>

          <p className="features-subtitle">
            Our platform helps you practice real interview scenarios, improve your confidence, and get job-ready with smart insights.
          </p>
        </div>

        <div className="features-grid">
          <FeatureCard
            icon={<RealisticQuestionIcon />}
            title="Realistic AI Questions"
            description="Get dynamic, job-specific questions just like real HR & technical rounds."
            animationClass="animate-slideUp"
          />

          <FeatureCard
            icon={<FeedbackIcon />}
            title="Instant Smart Feedback"
            description="Receive insights on structure, tone, clarity, and confidence after every answer."
            animationClass="animate-slideUpDelay1"
          />

          <FeatureCard
            icon={<VoiceIcon />}
            title="Voice-Based Interview Mode"
            description="Experience real-time audio interviews with AI for a real interviewer feel."
            animationClass="animate-slideUpDelay2"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;