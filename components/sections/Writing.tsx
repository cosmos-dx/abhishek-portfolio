import type { Content } from "@/lib/schema";
import { Arrow, MaybeLink } from "@/components/ui";
import { ImageFrame } from "@/components/ImageFrame";
import { Reveal } from "@/components/Reveal";

export function Writing({ writing, linkedin }: { writing: Content["writing"]; linkedin: string }) {
  if (!writing.length) return null;
  return (
    <section id="writing" aria-labelledby="writing-title" className="border-b border-line">
      <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <h2 id="writing-title" className="text-3xl font-medium tracking-tight sm:text-4xl">
          Thoughts on AI systems, infrastructure and engineering.
        </h2>
        <ul className="-mx-5 mt-10 flex snap-x snap-mandatory scroll-px-5 sm:scroll-px-8 md:scroll-px-0 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {writing.map((w, i) => (
            <li key={w.title} className="w-[78%] shrink-0 snap-start sm:w-[55%] md:w-auto">
              <Reveal delay={i * 80}>
                <MaybeLink href={w.url} className="group block">
                  <ImageFrame src={w.image} alt="" ratio="16/10" dark sizes="(min-width: 768px) 33vw, 100vw" className="w-full" />
                  <div className="label mt-4 flex items-center justify-between text-muted">
                    <span className={w.status === "draft" ? "" : "text-accent"}>{w.status === "draft" ? "Draft" : "Published"}</span>
                    {w.readTime && <span>{w.readTime}</span>}
                  </div>
                  <h3 className="mt-2 flex items-start justify-between gap-3 text-xl font-semibold leading-tight tracking-tight">
                    {w.title}
                    {w.url && <Arrow className="mt-1 shrink-0 text-accent" />}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{w.summary}</p>
                </MaybeLink>
              </Reveal>
            </li>
          ))}
        </ul>
        {linkedin && (
          <MaybeLink href={linkedin} className="label mt-8 inline-flex items-center gap-1 border-b border-ink pb-1 hover:border-accent hover:text-accent">
            More on LinkedIn <Arrow />
          </MaybeLink>
        )}
      </div>
    </section>
  );
}
