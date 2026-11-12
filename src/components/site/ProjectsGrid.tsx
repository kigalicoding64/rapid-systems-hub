import { Link } from "@tanstack/react-router";
import { FolderOpen, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PortfolioProject } from "@/lib/portfolio.functions";
import { DIVISIONS, isDivisionSlug } from "@/lib/site-content";

const STATUS_LABEL: Record<PortfolioProject["completionStatus"], string> = {
  planned: "Planned",
  in_progress: "In progress",
  completed: "Completed",
};

export function ProjectsGrid({ projects, limit }: { projects: PortfolioProject[]; limit?: number | undefined }) {
  const shown = limit ? projects.slice(0, limit) : projects;

  if (shown.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card px-6 py-14 text-center">
        <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
        <h3 className="mt-4 text-lg font-semibold">Project case studies are being prepared</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Verified project records will appear here once they have been reviewed and approved for publication. To
          discuss relevant experience for your facility, speak with our team.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/contact">Contact our team</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {shown.map((p) => {
        const division = isDivisionSlug(p.serviceCategory)
          ? DIVISIONS.find((d) => d.slug === p.serviceCategory)
          : undefined;
        return (
          <article key={p.slug} className="group overflow-hidden rounded-xl border bg-card shadow-soft">
            <div className="aspect-[16/10] overflow-hidden bg-muted">
              {p.imageUrls[0] ? (
                <img
                  src={p.imageUrls[0]}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="grid-lines-light h-full w-full" aria-hidden="true" />
              )}
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                {division && <Badge variant="secondary">{division.name}</Badge>}
                <Badge variant="outline">{STATUS_LABEL[p.completionStatus]}</Badge>
              </div>
              <h3 className="mt-4 text-lg font-semibold leading-snug">{p.title}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {p.location} · {p.industry}
              </p>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
              {p.technologies.length > 0 && (
                <p className="mt-4 text-xs text-muted-foreground">{p.technologies.join(" · ")}</p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
