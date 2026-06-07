import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Brain,
  Clock3,
  Copy,
  Expand,
  FileText,
  MessageCircle,
  Mic,
  Monitor,
  MoreVertical,
  PhoneOff,
  Send,
  Settings,
  Sparkles,
  Trash2,
  WandSparkles,
  Wifi,
  Zap,
} from "lucide-react";

import logo from "../../assets/logo_AnsweflowAI.jpg.png";

const INITIAL_SECONDS = 108;

const initialTranscript = [
  {
    id: 1,
    role: "Question",
    type: "interviewer",
    time: "00:12",
    text: "Context: Your company has a set of virtual machines running on Google Cloud that need to interact with a critical on-premises database using internal IPs, with requirements for high data transfer rates and low latency. Question: What solution would you propose",
  },
  {
    id: 2,
    role: "Answer",
    type: "you",
    time: "00:45",
    text: "That's a great question. I would recommend looking at Cloud VPN or Cloud Interconnect depending on the bandwidth and latency requirements.",
  },
  {
    id: 3,
    role: "Question",
    type: "interviewer",
    time: "01:32",
    text: "Can you elaborate on why Cloud Interconnect would be preferred over Cloud VPN in this scenario?",
  },
];

const initialAnswers = [
  {
    id: 1,
    time: "00:12",
    question:
      "Virtual machines on GCP connecting to on-premises database with high data transfer and low latency requirements",
    source: "Google Cloud Architecture Guide",
    confidence: "94% confidence",
    loading: false,
    copyText:
      "GCP VPC network peering enables secure, private connectivity between cloud and on-premises resources. This ensures low latency and high throughput for critical database interactions.\n\nProposed Solution Architecture: The solution would involve establishing a secure and reliable connection between Google Cloud and the on-premises environment. This would be achieved using a Cloud VPN or Cloud Interconnect for robust network connectivity.\n\nNetwork Connectivity Options: For high data transfer rates and low latency, Cloud Interconnect would be the preferred option over Cloud VPN, as it offers a dedicated private connection.\n\nSecurity Considerations: Security would be a paramount concern, employing encryption for data in transit, even with a private connection.",
    bullets: [
      {
        color: "teal",
        title: "Proposed Solution Architecture:",
        text: "The solution would involve establishing a secure and reliable connection between Google Cloud and the on-premises environment. This would be achieved using a Cloud VPN or Cloud Interconnect for robust network connectivity. The virtual machines in Google Cloud would then be configured with appropriate network routes to access the on-premises database via its internal IP addresses.",
      },
      {
        color: "orange",
        title: "Network Connectivity Options:",
        text: "For high data transfer rates and low latency, Cloud Interconnect would be the preferred option over Cloud VPN, as it offers a dedicated private connection. This minimizes network hops and potential internet congestion, directly addressing the performance requirements.",
      },
      {
        color: "blue",
        title: "Security Considerations:",
        text: "Security would be a paramount concern, employing encryption for data in transit, even with a private connection. Network security groups and firewall rules would be implemented in Google Cloud to restrict access to the on-premises database.",
      },
    ],
  },
  {
    id: 2,
    time: "01:32",
    question: "Why Cloud Interconnect over Cloud VPN?",
    loading: true,
  },
];

function formatFullTime(totalSeconds) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return {
    hours,
    minutes,
    seconds,
    full: `${hours}:${minutes}:${seconds}`,
  };
}

function formatTranscriptTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function BulletLabel({ color, children }) {
  const colorClass =
    color === "orange"
      ? "text-orange-300"
      : color === "blue"
        ? "text-blue-300"
        : "text-teal-300";

  return <span className={`font-bold ${colorClass}`}>{children}</span>;
}

function TopbarIconButton({ title, children }) {
  return (
    <button
      type="button"
      title={title}
      className="hidden h-8 w-8 shrink-0 place-items-center rounded-md border border-[#252839] bg-[#1a1d27] text-[#8b90a7] transition-colors hover:border-[#252839] hover:bg-[#252839] hover:text-[#e8eaf0] sm:grid"
    >
      {children}
    </button>
  );
}

function AnswerCard({ answer, copiedId, onCopy }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#252839] bg-[#1a1d27] shadow-[0_12px_40px_rgba(0,0,0,0.16)] transition-colors hover:border-[#14b8a6]/40">
      <div className="flex items-center justify-between gap-3 border-b border-[#252839] bg-[#1e2130] px-4 py-3">
        <span className="inline-flex items-center rounded-md bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold text-amber-300">
          Question Asked
        </span>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-medium text-[#525870]">
            {answer.time}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onCopy(answer)}
              className="grid h-7 w-7 place-items-center rounded-md border border-[#252839] bg-transparent text-[#8b90a7] transition-colors hover:bg-[#252839] hover:text-[#2dd4bf]"
              title="Copy answer"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              className="grid h-7 w-7 place-items-center rounded-md border border-[#252839] bg-transparent text-[#8b90a7] transition-colors hover:bg-[#252839] hover:text-[#2dd4bf]"
              title="More options"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {answer.loading ? (
        <div className="flex items-center gap-3 px-4 py-5 text-xs font-medium text-[#525870]">
          <div className="mock-typing-dots flex items-center gap-1">
            <span />
            <span />
            <span />
          </div>
          <span>Analysing: “{answer.question}” ...</span>
        </div>
      ) : (
        <>
          <div className="border-b border-[#252839] px-4 py-3 text-xs italic leading-6 text-[#8b90a7]">
            “{answer.question}”
          </div>

          <div className="space-y-3 px-4 py-4">
            <p className="rounded-lg border border-[#252839] bg-[#1e2130]/70 px-3 py-3 text-xs leading-6 text-[#8b90a7]">
              <span className="font-bold text-teal-300">
                GCP VPC network peering
              </span>{" "}
              enables secure, private connectivity between cloud and on-premises
              resources. This ensures{" "}
              <span className="font-bold text-green-300">low latency</span> and{" "}
              <span className="font-bold text-blue-300">high throughput</span>{" "}
              for critical database interactions.
            </p>

            <div className="space-y-3">
              {answer.bullets?.map((bullet, index) => (
                <div key={`${answer.id}-${index}`} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#14b8a6]" />

                  <p className="text-xs leading-6 text-[#8b90a7]">
                    <BulletLabel color={bullet.color}>{bullet.title}</BulletLabel>{" "}
                    {bullet.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-[#252839] bg-[#1e2130]/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#8b90a7]">
              <BookOpen className="h-3.5 w-3.5 text-[#525870]" />
              {answer.source}
            </div>

            <span className="w-max rounded-full border border-green-400/20 bg-green-400/10 px-2.5 py-1 text-[10px] font-bold text-green-300">
              {answer.confidence}
            </span>
          </div>
        </>
      )}

      {copiedId === answer.id && (
        <div className="border-t border-[#252839] bg-[#13161f] px-4 py-2 text-[11px] font-semibold text-[#2dd4bf]">
          Copied to clipboard
        </div>
      )}
    </article>
  );
}

export default function MockInterview({ onEndSession }) {
  const navigate = useNavigate();

  const [elapsedSeconds, setElapsedSeconds] = useState(INITIAL_SECONDS);
  const [query, setQuery] = useState("");
  const [isSharing, setIsSharing] = useState(true);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [answers, setAnswers] = useState(initialAnswers);
  const [copiedId, setCopiedId] = useState(null);

  const transcriptEndRef = useRef(null);
  const answersEndRef = useRef(null);

  const timer = useMemo(() => formatFullTime(elapsedSeconds), [elapsedSeconds]);
  const transcriptTime = useMemo(
    () => formatTranscriptTime(elapsedSeconds),
    [elapsedSeconds]
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [transcript]);

  useEffect(() => {
    answersEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [answers]);

  const submitQuery = () => {
    const value = query.trim();

    if (!value) return;

    setTranscript((current) => [
      ...current,
      {
        id: Date.now(),
        role: "You",
        type: "you",
        time: transcriptTime,
        text: value,
      },
    ]);

    setQuery("");
  };

  const handleQueryKeyDown = (event) => {
    if (event.key === "Enter") {
      submitQuery();
    }
  };

  const clearAnswers = () => {
    setAnswers([]);
  };

  const handleEndSession = () => {
    const shouldEnd = window.confirm("End this interview session?");

    if (!shouldEnd) return;

    if (typeof onEndSession === "function") {
      onEndSession();
      return;
    }

    navigate("/interview");
  };

  const handleCopy = async (answer) => {
    try {
      const textToCopy = answer.loading
        ? `Question: ${answer.question}\n\nAnalysing response...`
        : `Question: ${answer.question}\n\n${answer.copyText || ""}`;

      await navigator.clipboard.writeText(textToCopy);

      setCopiedId(answer.id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#0f1117] font-body text-[#e8eaf0]">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[#252839] bg-[#13161f] px-4 sm:gap-8">
        <div className="flex shrink-0 items-center gap-2.5">
          <img
            src={logo}
            alt="AnswerFlow AI"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <span className="hidden text-sm font-bold text-[#e8eaf0] sm:inline">
            AnswerFlow AI
          </span>
        </div>

        <div className="hidden min-w-0 items-center gap-3 md:flex">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#14b8a6] text-white shadow-lg shadow-teal-900/20">
            <Zap className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-bold text-[#e8eaf0]">
              AI Answer Engine
              <Sparkles className="h-3.5 w-3.5 text-[#2dd4bf]" />
            </div>
            <div className="text-[11px] font-medium text-[#525870]">
              Real-time intelligent responses
            </div>
          </div>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-[#252839] bg-[#1a1d27] px-3 py-1.5 text-xs font-semibold text-[#e8eaf0] sm:flex">
            <Clock3 className="h-3.5 w-3.5 text-[#8b90a7]" />

            <span className="font-mono tabular-nums">
              {timer.hours}
              <span className="mock-timer-colon">:</span>
              {timer.minutes}
              <span className="mock-timer-colon">:</span>
              {timer.seconds}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-green-400/20 bg-green-400/10 px-2.5 py-1.5 text-[11px] font-bold text-green-300">
            <span className="mock-pulse-dot h-1.5 w-1.5 rounded-full bg-green-400" />
            Connected
          </div>

          <TopbarIconButton title="Microphone">
            <Mic className="h-3.5 w-3.5" />
          </TopbarIconButton>

          <TopbarIconButton title="Screen">
            <Monitor className="h-3.5 w-3.5" />
          </TopbarIconButton>

          <TopbarIconButton title="Settings">
            <Settings className="h-3.5 w-3.5" />
          </TopbarIconButton>

          <div className="hidden h-6 w-px bg-[#252839] md:block" />

          <button
            type="button"
            onClick={handleEndSession}
            className="inline-flex items-center gap-1.5 rounded-md bg-red-500 px-3 py-2 text-xs font-bold text-white shadow-[0_0_12px_rgba(239,68,68,0.25)] transition-colors hover:bg-red-600"
          >
            <PhoneOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">End Session</span>
          </button>

          <button
            type="button"
            onClick={clearAnswers}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#252839] bg-[#1a1d27] px-3 py-2 text-xs font-semibold text-[#8b90a7] transition-colors hover:bg-[#252839] hover:text-[#e8eaf0]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </header>

      <main className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col overflow-hidden lg:flex-row">
        <section className="flex min-h-0 flex-col border-b border-[#252839] bg-[#13161f] lg:w-2/5 lg:border-b-0 lg:border-r">
          <div className="relative flex h-52 shrink-0 flex-col items-center justify-center overflow-hidden border-b border-[#252839] bg-[#08090d] px-4">
            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.018)_2px,rgba(255,255,255,0.018)_4px)]" />

            <div
              className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg ${
                isSharing
                  ? "bg-green-500 shadow-green-500/30"
                  : "bg-slate-600 shadow-black/10"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isSharing ? "mock-pulse-dot bg-white" : "bg-slate-300"
                }`}
              />
              {isSharing ? "Sharing" : "Paused"}
            </div>

            <button
              type="button"
              onClick={() => setIsSharing((current) => !current)}
              className="absolute right-3 top-3 rounded-md bg-red-500/85 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur transition-colors hover:bg-red-500"
            >
              {isSharing ? "Stop Sharing" : "Start Sharing"}
            </button>

            <div className="relative flex h-16 w-20 items-center justify-center rounded-md border-2 border-[#2a2d3e] bg-[#141720] after:absolute after:-bottom-3 after:left-1/2 after:h-2 after:w-7 after:-translate-x-1/2 after:rounded-b after:border-t-2 after:border-[#2a2d3e] after:bg-[#1e2130]">
              <Monitor className="h-7 w-7 text-[#3a3f58]" />
            </div>

            <div className="mt-5 text-xs font-semibold text-[#6b7280]">
              {isSharing ? "Screen sharing active" : "Screen sharing paused"}
            </div>

            {isSharing && (
              <div className="mt-1 text-[11px] font-medium text-[#3d4258]">
                Sharing: meet.google.com
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between border-b border-[#252839] px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8b90a7]">
              <MessageCircle className="h-4 w-4 text-[#525870]" />
              Transcript
              <span className="mock-pulse-dot h-1.5 w-1.5 rounded-full bg-green-400" />
            </div>

            <button
              type="button"
              className="grid h-7 w-7 place-items-center rounded-md border border-[#252839] bg-transparent text-[#525870] transition-colors hover:bg-[#252839] hover:text-[#8b90a7]"
              title="Expand transcript"
            >
              <Expand className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mock-dark-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
            {transcript.map((item) => {
              const isYou = item.type === "you";

              return (
                <div key={item.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-medium text-[#3d4258]">
                      {item.time}
                    </span>

                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        isYou
                          ? "bg-green-400/10 text-green-300"
                          : "bg-amber-400/10 text-amber-300"
                      }`}
                    >
                      {item.role}
                    </span>
                  </div>

                  <p
                    className={`rounded-r-md border border-[#1e2233] bg-[#1a1d27] px-3 py-2 text-xs leading-6 text-[#8b90a7] ${
                      isYou ? "border-l-green-500" : "border-l-amber-500"
                    } border-l-[3px]`}
                  >
                    {item.text}
                  </p>
                </div>
              );
            })}

            <div ref={transcriptEndRef} />
          </div>

          <div className="shrink-0 border-t border-[#252839] px-4 py-3">
            <div className="flex items-center gap-2 rounded-lg border border-[#252839] bg-[#1e2130] p-1.5 transition-colors focus-within:border-[#14b8a6]">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleQueryKeyDown}
                placeholder="Ask a follow-up question or type your own query..."
                className="min-w-0 flex-1 bg-transparent px-2 text-xs font-medium text-[#e8eaf0] outline-none placeholder:text-[#525870]"
              />

              <button
                type="button"
                onClick={submitQuery}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#14b8a6] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0f766e]"
              >
                <Send className="h-3.5 w-3.5" />
                Query
              </button>
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-1 flex-col bg-[#0f1117] lg:w-3/5">
          <div className="mock-dark-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5">
            {answers.length > 0 ? (
              answers.map((answer) => (
                <AnswerCard
                  key={answer.id}
                  answer={answer}
                  copiedId={copiedId}
                  onCopy={handleCopy}
                />
              ))
            ) : (
              <div className="flex h-full items-center justify-center py-12">
                <div className="max-w-sm text-center">
                  <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-[#252839] bg-[#1a1d27] text-[#6366f1]/70">
                    <Zap className="h-7 w-7" />
                  </div>

                  <h3 className="text-sm font-bold text-[#e8eaf0]">
                    No answers yet
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#525870]">
                    Start speaking or type a query to generate AI-powered
                    interview responses.
                  </p>
                </div>
              </div>
            )}

            <div ref={answersEndRef} />
          </div>

          <div className="flex shrink-0 flex-col gap-3 border-t border-[#252839] bg-[#13161f] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8b90a7]">
                <Mic className="h-3.5 w-3.5 text-green-400" />
                Audio capture active
              </div>

              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8b90a7]">
                <WandSparkles className="h-3.5 w-3.5 text-purple-300" />
                GPT-4.1 · English
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-300">
              <span className="mock-pulse-dot h-1.5 w-1.5 rounded-full bg-green-400" />
              All systems operational
              <Wifi className="h-3.5 w-3.5" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}