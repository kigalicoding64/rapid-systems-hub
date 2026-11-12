import { cn } from "@/lib/utils";

/** Thin circuit-trace motif drawn from the logo's line work. Decorative only. */
export function CircuitLines({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 400"
      fill="none"
      aria-hidden="true"
      className={cn("pointer-events-none", className)}
    >
      <g strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path pathLength={1} className="trace-line stroke-cyan/50" d="M0 300 H140 L180 260 H320 L360 220 H600" />
        <path pathLength={1} className="trace-line stroke-cyan/30" style={{ animationDelay: "300ms" }} d="M0 340 H220 L250 310 H420 L460 350 H600" />
        <path pathLength={1} className="trace-line stroke-on-navy/20" style={{ animationDelay: "600ms" }} d="M60 0 V80 L100 120 V200 L140 240" />
        <path pathLength={1} className="trace-line stroke-signal/50" style={{ animationDelay: "150ms" }} d="M0 120 H90" />
        <path pathLength={1} className="trace-line stroke-signal/30" style={{ animationDelay: "450ms" }} d="M0 150 H60" />
      </g>
      <g>
        <circle cx="180" cy="260" r="4" className="pulse-dot fill-none stroke-cyan/70" />
        <circle cx="360" cy="220" r="4" className="pulse-dot fill-none stroke-cyan/70" style={{ animationDelay: "1s" }} />
        <circle cx="460" cy="350" r="4" className="pulse-dot fill-none stroke-cyan/50" style={{ animationDelay: "2s" }} />
        <circle cx="140" cy="240" r="3" className="fill-none stroke-on-navy/40" />
      </g>
    </svg>
  );
}
