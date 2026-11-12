import markAsset from "@/assets/rapid-systems-mark.webp.asset.json";
import { cn } from "@/lib/utils";

/** The supplied RS symbol, shown unaltered; the backdrop edges fade into the navy header. */
export function BrandMark({ className, name = "RAPID SYSTEMS" }: { className?: string; name?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <img
        src={markAsset.url}
        alt=""
        width={480}
        height={361}
        className="logo-fade h-11 w-auto md:h-12"
        aria-hidden="true"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[0.95rem] font-semibold tracking-[0.16em] text-on-navy">{name}</span>
        <span className="eyebrow mt-1 text-[0.6rem] text-on-navy-muted">Integrated Technology</span>
      </span>
    </span>
  );
}
