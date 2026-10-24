import type { Content } from "@/lib/schema";
import { Arrow, MaybeLink, SwanMark } from "@/components/ui";

export function Footer({ profile }: { profile: Content["profile"] }) {
  const links = [
    profile.email && { label: "Email", href: `mailto:${profile.email}` },
    profile.github && { label: "GitHub", href: profile.github },
    profile.linkedin && { label: "LinkedIn", href: profile.linkedin },
    profile.resumeUrl && { label: "Resume", href: profile.resumeUrl },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="mx-auto flex max-w-[1600px] flex-col gap-10 px-5 py-14 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
      <div className="flex items-end gap-6">
        <SwanMark className="h-20 w-20 text-ink" />
        <div>
          <p className="text-2xl font-extralight tracking-tight sm:text-3xl">
            Let&apos;s build <span className="font-extrabold">better systems</span>.
          </p>
          <p className="label mt-2 text-muted">
            © {new Date().getFullYear()} {profile.first} {profile.last} · {profile.location}
          </p>
        </div>
      </div>
      {links.length > 0 && (
        <ul className="label flex flex-wrap gap-x-8 gap-y-3">
          {links.map((l) => (
            <li key={l.label}>
              <MaybeLink href={l.href} download={l.label === "Resume" ? "Abhishek-Gupta-Resume.pdf" : undefined} className="inline-flex items-center gap-1 hover:text-accent">
                {l.label} <Arrow />
              </MaybeLink>
            </li>
          ))}
        </ul>
      )}
    </footer>
  );
}
