import { Sparkles } from "lucide-react";

export default function AILoader({
  text = "Loading...",
  subText = "",
  fullscreen = false,
  showText = true,
}) {
  return (
    <div
      className={`${
        fullscreen ? "fixed" : "absolute"
      } inset-0 z-40 flex items-center justify-center bg-white/60 px-4 font-body backdrop-blur-[2px]`}
    >
      <div className="inline-flex items-center gap-3 rounded-full border border-[var(--session-border)] bg-white/90 px-4 py-3 shadow-lg">
        <div className="relative grid h-10 w-10 place-items-center">
          <div className="ai-simple-loader-glow absolute inset-0 rounded-full bg-[var(--color-brand-subtle)]" />

          <div className="ai-simple-loader-ring absolute inset-0 rounded-full border-2 border-emerald-100 border-t-[var(--color-brand)]" />

          <div className="relative z-10 grid h-7 w-7 place-items-center rounded-full bg-[var(--color-brand)] text-white shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
        </div>

        {showText && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900">{text}</div>

            {subText && (
              <div className="mt-0.5 max-w-xs truncate text-xs font-medium text-slate-500">
                {subText}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}