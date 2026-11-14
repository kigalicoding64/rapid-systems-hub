import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { companyQueryOptions } from "@/lib/company.functions";
import { DIVISIONS } from "@/lib/site-content";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";
import { DivisionIcon } from "./DivisionIcon";

const NAV = [
  { to: "/solutions", label: "Solutions" },
  { to: "/industries", label: "Industries" },
  { to: "/projects", label: "Projects" },
  { to: "/partners", label: "Partners" },
  { to: "/our-process", label: "Our Process" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

const linkBase = "rounded-md px-3 py-2 text-sm font-medium text-on-navy-muted transition-colors hover:text-on-navy";

export function SiteHeader() {
  const { data: company } = useSuspenseQuery(companyQueryOptions());
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-on-navy/10 bg-navy-deep/90 backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-navy-deep/80 to-transparent",
      )}
    >
      <div className="container-site flex h-[72px] items-center justify-between gap-6">
        <Link to="/" aria-label={`${company.companyName} home`} className="shrink-0">
          <BrandMark name={company.companyName} />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(linkBase, "flex items-center gap-1 outline-none")}>
              Services <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 p-2">
              {DIVISIONS.map((d) => (
                <DropdownMenuItem key={d.slug} asChild className="cursor-pointer items-start gap-3 p-3">
                  <Link to="/services/$slug" params={{ slug: d.slug }}>
                    <DivisionIcon slug={d.slug} className="mt-0.5 h-5 w-5 text-cyan-deep" />
                    <span>
                      <span className="block text-sm font-semibold">{d.name}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{d.tagline}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer p-3 text-sm font-medium">
                <Link to="/services">All services overview</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className={linkBase} activeProps={{ className: "text-on-navy" }}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/track" className={cn(linkBase, "flex items-center gap-1.5")}>
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            Track request
          </Link>
          <Button asChild size="sm" className="bg-cyan text-navy-deep hover:bg-cyan/90">
            <Link to="/request-quote">Request a Quote</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-on-navy lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="dark w-[86vw] max-w-sm overflow-y-auto bg-background text-foreground">
            <SheetHeader>
              <SheetTitle className="text-left font-display tracking-[0.14em]">{company.companyName}</SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobile" className="mt-2 flex flex-col px-4 pb-8">
              <p className="eyebrow mb-2 mt-2 text-muted-foreground">Services</p>
              {DIVISIONS.map((d) => (
                <Link
                  key={d.slug}
                  to="/services/$slug"
                  params={{ slug: d.slug }}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-md py-2.5 text-sm"
                >
                  <DivisionIcon slug={d.slug} className="h-4 w-4 text-cyan" />
                  {d.name}
                </Link>
              ))}
              <div className="my-4 h-px bg-border" />
              {NAV.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="py-2.5 text-sm">
                  {item.label}
                </Link>
              ))}
              <Link to="/track" onClick={() => setOpen(false)} className="py-2.5 text-sm">
                Track a request
              </Link>
              <Button asChild className="mt-6">
                <Link to="/request-quote" onClick={() => setOpen(false)}>
                  Request a Quote
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
