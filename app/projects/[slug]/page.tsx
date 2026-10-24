import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { Arrow, MaybeLink } from "@/components/ui";
import { ImageFrame } from "@/components/ImageFrame";

export const dynamic = "force-dynamic";

async function find(slug: string) {
  const p = (await getContent()).projects.featured;
  return p.slug === slug ? p : null;
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const p = await find((await params).slug);
  return p ? { title: `${p.name} · Abhishek Gupta`, description: p.tagline } : {};
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-ink py-10 lg:grid-cols-12 lg:py-14">
      <div className="lg:col-span-3">
        <h2 className="label">{title}</h2>
      </div>
      <div className="lg:col-span-9">{children}</div>
    </section>
  );
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const p = await find((await params).slug);
  if (!p) notFound();

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10">
      <Link href="/#projects" className="label text-muted hover:text-accent">
        ← Back
      </Link>

      <header className="py-12 lg:py-20">
        <h1 className="text-[clamp(3.5rem,12vw,9rem)] font-extrabold leading-[0.85] tracking-[-0.055em]">{p.name}</h1>
        <p className="mt-6 max-w-2xl text-xl font-medium leading-snug sm:text-2xl">{p.tagline}</p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">{p.description}</p>
        <dl className="label mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          <dt className="text-muted">Role</dt>
          <dd>{p.role}</dd>
          {p.url && (
            <>
              <dt className="text-muted">Live</dt>
              <dd>
                <MaybeLink href={p.url} className="inline-flex items-center gap-1 hover:text-accent">
                  {p.url.replace(/^https?:\/\//, "")} <Arrow />
                </MaybeLink>
              </dd>
            </>
          )}
        </dl>
      </header>

      <div className="relative mb-6 bg-dark">
        <ImageFrame src={p.image} alt="" ratio="16/9" dark sizes="1200px" className="w-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative aspect-[16/10] w-[78%] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
            <ImageFrame src={p.screenshot} alt={`${p.name} product walkthrough`} ratio="fill" fit="scroll" dark sizes="1000px" />
          </div>
        </div>
      </div>

      <Block title="Problem">
        <p className="max-w-2xl text-lg leading-relaxed">{p.problem}</p>
      </Block>
      <Block title="Solution">
        <p className="max-w-2xl text-lg leading-relaxed">{p.solution}</p>
      </Block>
      <Block title="Architecture">
        <ul className="grid gap-px border border-line bg-line sm:grid-cols-2">
          {p.architecture.map((a) => (
            <li key={a.name} className="bg-bg p-5">
              <div className="label text-accent">{a.name}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{a.role}</p>
            </li>
          ))}
        </ul>
      </Block>
      <Block title="Engineering decisions">
        <ol className="space-y-8">
          {p.decisions.map((d, i) => (
            <li key={d.title} className="grid grid-cols-[2.5rem_1fr] gap-4">
              <span className="label text-muted">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{d.title}</h3>
                <p className="mt-2 max-w-2xl leading-relaxed text-muted">{d.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Block>
      <Block title="Technology">
        <ul className="label flex flex-wrap gap-2">
          {p.tech.map((t) => (
            <li key={t} className="border border-line px-3 py-1.5">
              {t}
            </li>
          ))}
        </ul>
      </Block>
      {p.subProducts.length > 0 && (
        <Block title="Also in Hireish">
          <div className="space-y-8">
            {p.subProducts.map((s) => (
              <div key={s.name} className="grid gap-6 md:grid-cols-2">
                <ImageFrame src={s.image} alt={`${s.name} sample`} ratio="16/9" sizes="(min-width: 768px) 40vw, 100vw" className="w-full border border-line" />
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    <MaybeLink href={s.url} className="inline-flex items-baseline gap-2 hover:text-accent">
                      {s.name}
                      {s.url && <Arrow className="text-accent" />}
                    </MaybeLink>
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted">{s.description}</p>
                  <ul className="label mt-4 space-y-1">
                    {s.points.map((pt) => (
                      <li key={pt}>
                        <span className="text-accent" aria-hidden>›</span> {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Block>
      )}
      {p.tradeoffs.length > 0 && (
        <Block title="Trade-offs">
          <ul className="max-w-2xl space-y-3 leading-relaxed">
            {p.tradeoffs.map((t) => (
              <li key={t} className="flex gap-3">
                <span className="text-accent" aria-hidden>›</span>
                {t}
              </li>
            ))}
          </ul>
        </Block>
      )}
      {p.outcomes.length > 0 && (
        <Block title="Outcomes">
          <ul className="max-w-2xl space-y-3 leading-relaxed">
            {p.outcomes.map((t) => (
              <li key={t} className="flex gap-3">
                <span className="text-accent" aria-hidden>›</span>
                {t}
              </li>
            ))}
          </ul>
        </Block>
      )}
      <div className="border-t border-ink py-10">
        <Link href="/#projects" className="label hover:text-accent">
          ← Back to portfolio
        </Link>
      </div>
    </main>
  );
}
