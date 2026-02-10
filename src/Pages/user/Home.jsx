import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";


const CompletedTag = () => (
  <div className="mt-2 text-sm text-green-600 font-semibold animate-fadeIn">
    ✅ Completed
  </div>
);

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [completedSteps, setCompletedSteps] = useState([]);
  const [ctaStep, setCtaStep] = useState(null);

useEffect(() => {
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
}, [location.state]);


  const userName = "Radhika";

  // Button Handlers
  const handleUploadResume = () => console.log("Upload Resume");
  const handleTrial = () => navigate("/websocket-interview");
  const handleBuyCredits = () => console.log("Buy Credits");
  const handleStartInterview = () => console.log("Start Interview");

  return (
    <div className="theme-bg min-h-screen px-4 md:px-2 py-2">

      {/* Greeting */}
      <h1 className="text-2xl md:text-3xl font-bold mb-10 text-center animate-float">
        Hi, <span className="theme-text">{userName} 👋</span>
      </h1>

      {/* Steps Container */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2">

        {/* OPTIONAL RESUME */}
        <div className="flex flex-col items-center w-full md:w-[22%] animate-fadeSlide">

          {/* HEADER */}
          <div className="text-center mb-2 leading-tight">
            <p className="theme-text font-semibold text-lg">Optional :</p>
            <p className="font-semibold text-gray-800 text-lg">Resume 📄</p>
          </div>

          {/* CARD */}
          <div className="glass-card rounded-2xl px-5 h-52 shadow-xl flex items-center text-center hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 animate-scaleIn">
            <p className="text-gray-700 text-base leading-relaxed">
              Upload your resume to generate custom answers for job interview questions.
            </p>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleUploadResume}
            className="mt-3 theme-primary px-4 py-2 rounded-xl shadow hover:scale-110 transition"
          >
            📤 Upload Resume
          </button>

          {completedSteps.includes(0) && <CompletedTag />}

        </div>

        {/* ARROW */}
        <div className="flex flex-col items-center animate-arrow">
          <span className="hidden md:flex items-center justify-center text-2xl bg-blue-100 rounded-full w-10 h-10 pb-2">👉</span>
          <span className="md:hidden flex items-center justify-center text-2xl bg-blue-100 rounded-full w-10 h-10 mt-2">👇</span>
        </div>

        {/* STEP 1 */}
        <div className="flex flex-col items-center w-full md:w-[22%] animate-fadeSlideDelay1">

          {/* HEADER */}
          <div className="text-center mb-2 leading-tight">
            <p className="theme-text font-semibold text-lg">Step 1 :</p>
            <p className="font-semibold text-gray-800 text-lg">Trial Session ⏱️</p>
          </div>

          {/* CARD */}
          <div className="glass-card rounded-2xl px-5 h-52 shadow-xl flex items-center text-center hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 animate-scaleIn">
            <p className="text-gray-700 text-base leading-relaxed">
              Try a free 10-minute session and see how easy it is to practice interviews.
            </p>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleTrial}
            className="mt-3 theme-primary px-4 py-2 rounded-xl shadow hover:scale-110 transition"
          >
            ▶️ Create Session
          </button>
          {completedSteps.includes(1) && <CompletedTag />}

        </div>

        {/* ARROW */}
        <div className="flex flex-col items-center animate-arrow">
          <span className="hidden md:flex items-center justify-center text-2xl bg-blue-100 rounded-full w-10 h-10 pb-2">👉</span>
          <span className="md:hidden flex items-center justify-center text-2xl bg-blue-100 rounded-full w-10 h-10 mt-2">👇</span>
        </div>

        {/* STEP 2 */}
        <div className="flex flex-col items-center w-full md:w-[22%] animate-fadeSlideDelay2">

          {/* HEADER */}
          <div className="text-center mb-2 leading-tight">
            <p className="theme-text font-semibold text-lg">Step 2 :</p>
            <p className="font-semibold text-gray-800 text-lg">Buy Credits 💳</p>
          </div>

          {/* CARD */}
          <div className="glass-card rounded-2xl px-5 h-52 shadow-xl flex items-center text-center hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 animate-scaleIn">
            <p className="text-gray-700 text-base leading-relaxed">
              Purchase credits for real interview sessions. No subscription needed!
            </p>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleBuyCredits}
            className="mt-3 theme-primary px-4 py-2 rounded-xl shadow hover:scale-110 transition"
          >
            💰 Buy Credits
          </button>

     {completedSteps.includes(2) && <CompletedTag />}

        </div>

        {/* ARROW */}
        <div className="flex flex-col items-center animate-arrow">
          <span className="hidden md:flex items-center justify-center text-2xl bg-blue-100 rounded-full w-10 h-10 pb-2">👉</span>
          <span className="md:hidden flex items-center justify-center text-2xl bg-blue-100 rounded-full w-10 h-10 mt-2">👇</span>
        </div>

        {/* STEP 3 */}
        <div
          className={`flex flex-col items-center w-full md:w-[22%] animate-fadeSlideDelay3
          ${
            ctaStep === 3
              ? "ring-4 ring-indigo-400 bg-indigo-50 scale-[1.05] shadow-2xl"
              : ""
          }`}
        >

          {/* HEADER */}
          <div className="text-center mb-2 leading-tight">
            <p className="theme-text font-semibold text-lg">Step 3 :</p>
            <p className="font-semibold text-gray-800 text-lg">Real Interview 🎤</p>
          </div>

          {/* CARD */}
          <div className="glass-card rounded-2xl px-5 h-52 shadow-xl flex items-center text-center hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 animate-scaleIn">
            <p className="text-gray-700 text-base leading-relaxed">
              Use your credits for a real mock interview and get your dream job!
            </p>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleStartInterview}
            className={`mt-3 theme-primary px-4 py-2 rounded-xl shadow transition
            ${ctaStep === 3 ? "animate-pulse scale-110" : "hover:scale-110"}`}
          >
            🚀 Start Interview
          </button>

     {ctaStep === 3 && (
  <div className="mt-3 flex flex-col items-center gap-2">
    <div className="text-3xl animate-bounce">👆</div>
    <div className="text-sm text-indigo-700 font-semibold animate-pulse text-center">
      We recommend starting your interview now
    </div>
  </div>
)}

        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="mt-20">
        <h2 className="text-center text-2xl md:text-3xl font-bold theme-text mb-8">
          Your AI-Powered Interview Partner 🤖✨
        </h2>

        <p className="text-center max-w-3xl mx-auto text-gray-700 text-lg leading-relaxed mb-14 animate-fadeIn">
          Our platform helps you practice real interview scenarios, improve your confidence,
          and get job-ready with smart insights. No fluff only practical, powerful mock interviews.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 rounded-2xl shadow-xl hover:scale-[1.03] transition-all animate-slideUp">
            <h3 className="font-semibold text-xl theme-text mb-3">💬 Realistic AI Questions</h3>
            <p className="text-gray-700 leading-relaxed">
              Get dynamic, job-specific questions just like real HR & technical rounds.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl shadow-xl hover:scale-[1.03] transition-all delay-100 animate-slideUp">
            <h3 className="font-semibold text-xl theme-text mb-3">📊 Instant Smart Feedback</h3>
            <p className="text-gray-700 leading-relaxed">
              Receive insights on structure, tone, clarity, and confidence.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl shadow-xl hover:scale-[1.03] transition-all delay-200 animate-slideUp">
            <h3 className="font-semibold text-xl theme-text mb-3">🎧 Voice-Based Interview Mode</h3>
            <p className="text-gray-700 leading-relaxed">
              Experience real-time audio interviews with AI for a real interviewer feel.
            </p>
          </div>
        </div>

        <div className="text-center mt-16 animate-fadeInUp">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Ready to Crack Your Next Interview?
          </h3>

          <button
            onClick={handleStartInterview}
            className="theme-primary px-6 py-3 rounded-2xl text-lg shadow-lg hover:scale-110 transition-all"
          >
            🚀 Start My AI Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
