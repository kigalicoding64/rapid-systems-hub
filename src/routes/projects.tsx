import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { ProjectsGrid } from "@/components/site/ProjectsGrid";
import { CtaBand } from "@/components/site/CtaBand";
import { portfolioQueryOptions } from "@/lib/portfolio.functions";
import heroImg from "@/assets/service-av.jpg";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects | RAPID SYSTEMS" },
      {
        name: "description",
        content: "Verified RAPID SYSTEMS project records across security, fire safety, audio visual and smart building infrastructure.",
      },
      { property: "og:title", content: "Projects | RAPID SYSTEMS" },
      { property: "og:description", content: "Verified project records published by RAPID SYSTEMS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(portfolioQueryOptions());
  },
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: projects } = useSuspenseQuery(portfolioQueryOptions());
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Projects"
        title="Project portfolio"
        description="Only project records that have been verified and approved for publication are shown here."
        crumbs={[{ label: "Projects" }]}
        image={heroImg}
        imageAlt="Boardroom with video wall"
      />
      <section className="container-site py-16 md:py-24">
        <ProjectsGrid projects={projects} />
      </section>
      <CtaBand />
    </SiteLayout>
  );
}
