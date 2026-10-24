import Link from "next/link";
import type { Content } from "@/lib/schema";
import { Arrow, MaybeLink } from "@/components/ui";
import { ImageFrame } from "@/components/ImageFrame";
import { Reveal } from "@/components/Reveal";

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="label flex flex-wrap gap-x-4 gap-y-1 text-muted">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export function Projects({ projects }: { projects: Content["projects"] }) {
  const p = projects.featured;
  return (
    <section id="projects" aria-labelledby="projects-title" className="border-b border-line">
      <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <h2 id="projects-title" className="mb-10 max-w-xl text-3xl font-medium tracking-tight sm:text-4xl">
          One product, built end to end.
        </h2>

        <Reveal>
          <article className="group relative grid border border-line bg-[#faf9f5] lg:grid-cols-12">
            {/* Stretched link makes the whole card open the case study */}
            <Link href={`/projects/${p.slug}`} className="absolute inset-0 z-0" aria-label={`${p.name} case study`} />

            <div className="relative flex aspect-[16/10] items-center justify-center bg-dark lg:col-span-7 lg:aspect-auto lg:min-h-[30rem]">
              <ImageFrame src={p.image} alt="" ratio="fill" dark sizes="(min-width: 1024px) 58vw, 100vw" />
              <div className="relative aspect-[16/10] w-[90%] lg:w-[84%] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
                <ImageFrame src={p.screenshot} alt={`${p.name} product walkthrough`} ratio="fill" fit="scroll" dark sizes="(min-width: 1024px) 50vw, 90vw" />
              </div>
              <div className="label absolute left-4 top-4 flex items-center gap-2 text-white">
                <ImageFrame src="/images/hireish-logo.svg" alt="" ratio="1/1" className="h-6 w-6" sizes="24px" />
                {p.name}
              </div>
            </div>

            <div className="pointer-events-none relative z-10 flex flex-col justify-between gap-8 p-6 sm:p-8 lg:col-span-5 lg:p-10">
              <div>
                <h3 className="flex items-baseline gap-3 text-5xl font-extrabold tracking-[-0.04em] sm:text-6xl">
                  {p.name}
                  <Arrow className="text-accent" />
                </h3>
                <p className="mt-4 text-lg font-medium leading-snug">{p.tagline}</p>
                <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-muted">{p.description}</p>
              </div>

              <div className="space-y-6">
                {p.subProducts.map((s) => (
                  <div key={s.name} className="border-t border-line pt-4">
                    <div className="label text-muted">Also in Hireish</div>
                    <MaybeLink href={s.url} className="pointer-events-auto mt-2 inline-flex items-baseline gap-2 text-lg font-semibold tracking-tight hover:text-accent">
                      {s.name}
                      {s.url && <Arrow className="text-accent" />}
                    </MaybeLink>
                    <p className="mt-1 max-w-md text-sm leading-relaxed text-muted">{s.description}</p>
                  </div>
                ))}
                <dl className="label grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                  <dt className="text-muted">Role</dt>
                  <dd>{p.role}</dd>
                  <dt className="text-muted">Stack</dt>
                  <dd>
                    <Tags items={p.tech} />
                  </dd>
                </dl>
                <div className="pointer-events-auto flex flex-wrap items-center gap-x-8 gap-y-3">
                  <Link href={`/projects/${p.slug}`} className="label border-b border-ink pb-1 hover:border-accent hover:text-accent">
                    Read case study →
                  </Link>
                  <MaybeLink href={p.url} className="label inline-flex items-center gap-1 text-muted hover:text-accent">
                    Visit site <Arrow />
                  </MaybeLink>
                </div>
              </div>
            </div>
          </article>
        </Reveal>

        {projects.other.length > 0 && (
          <div className="mt-16">
            <h3 className="label">Other work</h3>
            <ul className="mt-4 border-t border-ink">
              {projects.other.map((o, i) => (
                <li key={o.name} className="border-b border-line">
                  <MaybeLink href={o.url} className="group grid grid-cols-[2rem_1fr] items-baseline gap-x-4 gap-y-1 py-5 md:grid-cols-[3rem_14rem_1fr_auto]">
                    <span className="label text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex items-baseline gap-2 text-xl font-semibold tracking-tight">
                      {o.name}
                      {o.url && <Arrow className="text-accent" />}
                    </span>
                    <span className="col-start-2 text-sm text-muted md:col-start-auto">{o.description}</span>
                    <span className="label col-start-2 md:col-start-auto md:text-right">
                      <Tags items={[...o.tech, ...(o.year ? [o.year] : [])]} />
                    </span>
                  </MaybeLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
