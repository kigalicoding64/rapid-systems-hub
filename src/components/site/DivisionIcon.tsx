import { ShieldCheck, Flame, MonitorSpeaker, Building2, Zap, Tv, type LucideProps } from "lucide-react";
import type { DivisionSlug } from "@/lib/site-content";

const ICONS: Record<DivisionSlug, typeof ShieldCheck> = {
  "security-systems": ShieldCheck,
  "fire-life-safety": Flame,
  "audio-visual": MonitorSpeaker,
  "smart-buildings-ict": Building2,
  "electrical-plumbing": Zap,
  "iptv-signage": Tv,
};

export function DivisionIcon({ slug, ...props }: { slug: DivisionSlug } & LucideProps) {
  const Icon = ICONS[slug];
  return <Icon strokeWidth={1.6} aria-hidden="true" {...props} />;
}
