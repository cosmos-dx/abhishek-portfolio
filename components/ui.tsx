import { siGithub } from "simple-icons";
import { ArrowUpRight } from "lucide-react";

export function Arrow({ className = "" }: { className?: string }) {
  return <ArrowUpRight aria-hidden className={`arrow-nudge inline-block h-[1em] w-[1em] ${className}`} strokeWidth={1.5} />;
}

/** External/internal link that only renders as a link when it has a URL; otherwise plain text. */
export function MaybeLink({ href, children, className = "", download }: { href: string; children: React.ReactNode; className?: string; download?: string }) {
  if (!href) return <span className={className}>{children}</span>;
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      className={className}
      download={download}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

/** Brand marks (lucide dropped them; simple-icons has no LinkedIn). Decorative: the parent link carries the label. */
export function BrandIcon({ name, className = "h-4 w-4" }: { name: "github" | "linkedin"; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current ${className}`} aria-hidden>
      <path d={name === "github" ? siGithub.path : LINKEDIN_PATH} />
    </svg>
  );
}

/** Origami swan from the brand reference: geometric strokes with orange nodes. */
export function SwanMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="110 80 680 760" fill="none" className={className} aria-hidden>
      <g stroke="currentColor" strokeWidth="16" strokeLinejoin="round" strokeLinecap="round">
        <path d="M575 105 L688 122 L740 273 L610 238 L538 155 Z" />
        <path d="M625 160 L608 235 M575 105 L740 273" />
        <path d="M538 155 L488 201 L585 465 L660 680" />
        <path d="M610 245 L755 455 L672 680" />
        <path d="M585 465 L437 397 L392 461 L222 722 L640 680" />
        <path d="M392 461 L143 455 L280 630" />
        <path d="M367 712 L432 785 L660 682" />
      </g>
      <circle cx="488" cy="201" r="34" fill="#f06428" />
      <g fill="#f5f3ed" stroke="#f06428" strokeWidth="14">
        <circle cx="392" cy="461" r="32" />
        <circle cx="670" cy="681" r="32" />
        <circle cx="432" cy="785" r="32" />
      </g>
    </svg>
  );
}
