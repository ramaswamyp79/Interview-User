import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
  Wifi,
  Zap,
} from "lucide-react";

import logo from "../../assets/logo_AnsweflowAI.jpg.png";

const INITIAL_SECONDS = 108;

const initialTranscript = [
  {
    id: 1,
    type: "question",
    time: "00:12",
    text: "Context: Your company has a set of virtual machines running on Google Cloud that need to interact with a critical on-premises database using internal IPs, with requirements for high data transfer rates and low latency. Question: What solution would you propose",
  },
  {
    id: 2,
    type: "answer",
    time: "00:45",
    text: "That's a great question. I would recommend looking at Cloud VPN or Cloud Interconnect depending on the bandwidth and latency requirements.",
  },
  {
    id: 3,
    type: "question",
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
    loading: false,
    highlight: (
      <>
        <span className="font-semibold text-[#00c896]">GCP VPC network peering</span>{" "}
        enables secure, private connectivity between cloud and on-premises resources. This
        ensures <span className="font-semibold text-[#00c896]">low latency</span> and{" "}
        <span className="font-semibold text-[#4ade80]">high throughput</span> for critical
        database interactions.
      </>
    ),
    bullets: [
      {
        title: "Proposed Solution Architecture:",
        text: "The solution would involve establishing a secure and reliable connection between Google Cloud and the on-premises environment. This would be achieved using a Cloud VPN or Cloud Interconnect for robust network connectivity. The virtual machines in Google Cloud would then be configured with appropriate network routes to access the on-premises database via its internal IP addresses.",
      },
      {
        title: "Network Connectivity Options:",
        text: "For high data transfer rates and low latency, Cloud Interconnect would be the preferred option over Cloud VPN, as it offers a dedicated private connection. This minimizes network hops and potential internet congestion, directly addressing the performance requirements.",
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

function formatFullTimer(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `00:${minutes}:${seconds}`;
}

function formatShortTimer(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function AnswerCard({ answer, copiedId, onCopy }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#1e2d3d] bg-[#111820] transition-colors hover:border-[#00c896]/30">
      <div className="flex items-center justify-between border-b border-[#1e2d3d] bg-[#151d27] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold text-amber-300">
            Question Asked
          </span>
          <span className="font-mono text-xs text-[#4d6070]">{answer.time}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onCopy(answer)}
            className="grid h-7 w-7 place-items-center rounded-md border border-[#1e2d3d] text-[#8899aa] transition hover:bg-[#1e2d3d] hover:text-[#00c896]"
            title="Copy"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-md border border-[#1e2d3d] text-[#8899aa] transition hover:bg-[#1e2d3d] hover:text-[#00c896]"
            title="More"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="border-b border-[#1e2d3d] px-4 py-3 text-xs italic leading-6 text-[#8899aa]">
        “{answer.question}”
      </div>

      <div className="flex flex-col gap-3 px-4 py-3">
        {answer.loading ? (
          <div className="flex items-center gap-2 text-xs italic text-[#4d6070]">
            <span className="h-2 w-2 rounded-full bg-[#00c896] live-dot-pulse" />
            Generating response…
          </div>
        ) : (
          <>
            <div className="text-xs leading-6 text-[#8899aa]">{answer.highlight}</div>

            <div className="flex flex-col gap-2">
              {answer.bullets?.map((bullet, index) => (
                <div key={`${answer.id}-${index}`} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00c896]" />
                  <p className="text-xs leading-6 text-[#8899aa]">
                    <strong className="font-semibold text-[#00c896]">{bullet.title}</strong>{" "}
                    {bullet.text}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {copiedId === answer.id && (
        <div className="border-t border-[#1e2d3d] bg-[#151d27] px-4 py-2 text-[11px] font-semibold text-[#00c896]">
          Copied to clipboard
        </div>
      )}
    </article>
  );
}

export default function LiveInterview({ onEndSession }) {
  const navigate = useNavigate();

  const [elapsedSeconds, setElapsedSeconds] = useState(INITIAL_SECONDS);
  const [query, setQuery] = useState("");
  const [transcript, setTranscript] = useState(initialTranscript);
  const [answers, setAnswers] = useState(initialAnswers);
  const [copiedId, setCopiedId] = useState(null);

  const transcriptEndRef = useRef(null);
  const answersEndRef = useRef(null);

  const fullTimer = useMemo(() => formatFullTimer(elapsedSeconds), [elapsedSeconds]);
  const shortTimer = useMemo(() => formatShortTimer(elapsedSeconds), [elapsedSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [transcript]);

  useEffect(() => {
    answersEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [answers]);

  const handleQuery = () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const newId = Date.now();

    setTranscript((prev) => [
      ...prev,
      {
        id: newId,
        type: "question",
        time: shortTimer,
        text: trimmedQuery,
      },
    ]);

    setAnswers((prev) => [
      ...prev,
      {
        id: newId,
        time: shortTimer,
        question: trimmedQuery,
        loading: true,
      },
    ]);

    setQuery("");
  };

  const handleQueryKeyDown = (event) => {
    if (event.key === "Enter") {
      handleQuery();
    }
  };

  const handleClearAnswers = () => {
    setAnswers([]);
  };

  const handleCopyAnswer = async (answer) => {
    const textToCopy = answer.loading
      ? `Question: ${answer.question}\nGenerating response...`
      : `Question: ${answer.question}\n\n${answer.bullets
          ?.map((bullet) => `${bullet.title} ${bullet.text}`)
          .join("\n\n")}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(answer.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setCopiedId(null);
    }
  };

  const handleEndSession = () => {
    if (typeof onEndSession === "function") {
      onEndSession();
      return;
    }

    navigate("/interview");
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#0d1117] font-body text-[#e8f0fe]">
      {/* TOP NAV */}
      <nav className="flex h-14 items-center justify-between gap-4 border-b border-[#1e2d3d] bg-[#111820] px-5">
        <div className="flex shrink-0 items-center gap-2.5">
          <img
            src={logo}
            alt="AnswerFlow AI"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <span className="hidden text-base font-bold text-[#e8f0fe] sm:inline">
            AnswerFlow AI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-[#8899aa]">
            <Clock3 className="h-4 w-4" />
            <span className="font-mono tabular-nums">{fullTimer}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-[#00c896]/30 bg-[#00c896]/10 px-3 py-1.5 text-xs font-medium text-[#00c896]">
            <span className="h-2 w-2 rounded-full bg-[#00c896] live-dot-pulse" />
            Connected
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            title="Microphone"
            className="hidden h-9 w-9 place-items-center rounded-lg border border-[#1e2d3d] bg-[#151d27] text-[#8899aa] transition hover:bg-[#1e2d3d] hover:text-[#00c896] sm:grid"
          >
            <Mic className="h-4 w-4" />
          </button>

          <button
            type="button"
            title="Screen share"
            className="hidden h-9 w-9 place-items-center rounded-lg border border-[#1e2d3d] bg-[#151d27] text-[#8899aa] transition hover:bg-[#1e2d3d] hover:text-[#00c896] sm:grid"
          >
            <Monitor className="h-4 w-4" />
          </button>

          <button
            type="button"
            title="Settings"
            className="hidden h-9 w-9 place-items-center rounded-lg border border-[#1e2d3d] bg-[#151d27] text-[#8899aa] transition hover:bg-[#1e2d3d] hover:text-[#00c896] md:grid"
          >
            <Settings className="h-4 w-4" />
          </button>

          <div className="hidden h-6 w-px bg-[#1e2d3d] md:block" />

          <button
            type="button"
            onClick={handleEndSession}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-600"
          >
            <PhoneOff className="h-4 w-4" />
            <span className="hidden sm:inline">End Session</span>
          </button>

          <button
            type="button"
            onClick={handleClearAnswers}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e2d3d] px-3 py-2 text-xs font-medium text-[#8899aa] transition hover:border-[#00c896] hover:text-[#00c896]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </nav>

      {/* MAIN WORKSPACE */}
      <main className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden lg:flex-row">
        {/* LEFT PANEL */}
        <section className="flex min-h-0 flex-col overflow-hidden border-b border-[#1e2d3d] lg:w-5/12 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between bg-[#151d27] px-4 py-2.5">
            <div className="flex items-center gap-2 rounded-full border border-[#00c896] bg-[#00c896]/15 px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#00c896]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00c896] live-dot-pulse" />
              SHARING
            </div>

            <button
              type="button"
              className="rounded-md bg-red-500 px-3.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-red-600"
            >
              Stop Sharing
            </button>
          </div>

          <div className="flex h-52 shrink-0 flex-col items-center justify-center gap-2.5 border-b border-[#1e2d3d] bg-[#151d27]">
            <Monitor className="h-14 w-14 text-[#8899aa]/30" />
            <div className="text-sm font-medium text-[#8899aa]">Screen sharing active</div>
            <div className="text-xs text-[#4d6070]">Sharing: meet.google.com</div>
          </div>

          <div className="flex items-center justify-between border-b border-[#1e2d3d] bg-[#111820] px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#e8f0fe]">
              <MessageCircle className="h-4 w-4 text-[#8899aa]" />
              Live Transcript
              <span className="h-2 w-2 rounded-full bg-[#00c896] live-dot-pulse" />
            </div>

            <button
              type="button"
              title="Expand transcript"
              className="text-[#8899aa] transition hover:text-[#00c896]"
            >
              <Expand className="h-4 w-4" />
            </button>
          </div>

          <div className="live-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-3">
            {transcript.map((item) => {
              const isQuestion = item.type === "question";

              return (
                <div key={item.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#4d6070]">
                      {item.time}
                    </span>

                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        isQuestion
                          ? "border border-red-400/30 bg-red-400/10 text-red-400"
                          : "border border-green-400/25 bg-green-400/10 text-green-400"
                      }`}
                    >
                      {isQuestion ? "Question" : "Answer"}
                    </span>
                  </div>

                  <p
                    className={`border-l-2 pl-3 text-xs leading-6 text-[#8899aa] ${
                      isQuestion ? "border-red-400/40" : "border-green-400/35"
                    }`}
                  >
                    {item.text}
                  </p>
                </div>
              );
            })}

            <div ref={transcriptEndRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-[#1e2d3d] bg-[#111820] px-4 py-3">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleQueryKeyDown}
              placeholder="Ask a follow-up question or type your own query..."
              className="min-w-0 flex-1 rounded-lg border border-[#1e2d3d] bg-[#151d27] px-4 py-2.5 text-xs text-[#e8f0fe] outline-none transition placeholder:text-[#4d6070] focus:border-[#00c896]"
            />

            <button
              type="button"
              onClick={handleQuery}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#00c896] px-4 py-2.5 text-xs font-bold text-[#05140e] transition hover:bg-[#00a87e]"
            >
              <Send className="h-3.5 w-3.5" />
              Query
            </button>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#0d1117] lg:w-7/12">
          <div className="flex items-center justify-between border-b border-[#1e2d3d] bg-[#111820] px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#0c9784] text-white">
                <Brain className="h-4 w-4" />
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-[#e8f0fe]">
                  AI Answer Engine
                  <Sparkles className="h-3.5 w-3.5 text-[#00c896]" />
                </div>
                <p className="text-[11px] text-[#4d6070]">
                  Real-time intelligent interview suggestions
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-[#00c896]/30 bg-[#00c896]/10 px-3 py-1.5 text-[11px] font-semibold text-[#00c896] sm:flex">
              <Wifi className="h-3.5 w-3.5" />
              Listening
            </div>
          </div>

          <div className="live-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
            {answers.length > 0 ? (
              answers.map((answer) => (
                <AnswerCard
                  key={answer.id}
                  answer={answer}
                  copiedId={copiedId}
                  onCopy={handleCopyAnswer}
                />
              ))
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-sm text-center">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-[#1e2d3d] bg-[#111820] text-[#00c896]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#e8f0fe]">No answers yet</h3>
                  <p className="mt-1 text-xs leading-5 text-[#8899aa]">
                    Ask a query or wait for interview questions to appear here.
                  </p>
                </div>
              </div>
            )}

            <div ref={answersEndRef} />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[#1e2d3d] bg-[#111820] px-5 py-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-[#00c896]">
              <Mic className="h-3.5 w-3.5" />
              Audio capture active
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 rounded-md border border-[#1e2d3d] bg-[#151d27] px-2.5 py-1 text-[10px] text-[#8899aa] sm:flex">
                <Zap className="h-3.5 w-3.5" />
                GPT-4.1
              </div>

              <div className="hidden rounded-md border border-[#1e2d3d] bg-[#151d27] px-2.5 py-1 text-[10px] text-[#8899aa] sm:block">
                English
              </div>

              <span className="h-1.5 w-1.5 rounded-full bg-[#00c896] live-dot-pulse" />
              <span className="text-[10px] text-[#00c896]">
                All systems operational
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}