import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string | undefined;
  title: ReactNode;
  description?: ReactNode | undefined;
  align?: "left" | "center" | undefined;
  className?: string | undefined;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("eyebrow flex items-center gap-3 text-cyan-deep dark:text-cyan", align === "center" && "justify-center")}>
          <span className="h-px w-8 bg-current" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-[2.5rem]">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{description}</p>}
    </div>
  );
}
