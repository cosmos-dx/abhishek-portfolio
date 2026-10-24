import type { Content } from "@/lib/schema";
import { Arrow, MaybeLink } from "@/components/ui";
import { ImageFrame } from "@/components/ImageFrame";
import { Reveal } from "@/components/Reveal";

type Entry = { kind: string; title: string; org: string; orgUrl: string; place: string; start: string; end: string; points: string[] };

/** Dark "work & trajectory" band: dashed spine, large year numerals, orange nodes. */
export function Experience({ experience, education, image }: { experience: Content["experience"]; education: Content["education"]; image: string }) {
  const entries: Entry[] = [
    ...experience.map((e) => ({ kind: "Work", title: e.role, org: e.company, orgUrl: e.url, place: e.location, start: e.start, end: e.end, points: e.points })),
    ...education.map((e) => ({ kind: "Education", title: e.degree, org: e.school, orgUrl: "", place: e.location, start: e.start, end: e.end, points: e.note ? [e.note] : [] })),
  ];

  return (
    <section id="experience" aria-labelledby="experience-title" className="relative overflow-hidden bg-[#1c1a18] text-[#f5f3ed]">
      <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 id="experience-title" className="text-4xl font-extralight leading-[0.95] tracking-[-0.04em] sm:text-6xl">
              Work <span className="font-extrabold text-accent">&amp;</span> trajectory
            </h2>
          </div>
          <div className="lg:col-span-5">
            <ImageFrame src={image} alt="Building facade with an orange panel" ratio="16/9" dark sizes="(min-width: 1024px) 40vw, 100vw" className="w-full" />
          </div>
        </div>

        <ol className="relative mt-16">
          <div aria-hidden className="absolute bottom-0 left-[0.75rem] top-0 border-l border-dashed border-white/25 md:left-1/2" />
          {entries.map((e, i) => {
            const left = i % 2 === 0;
            const year = e.start.match(/\d{4}/)?.[0] ?? String(i + 1);
            return (
              <li key={`${e.org}-${e.title}-${i}`} className="relative grid grid-cols-[1.5rem_1fr] gap-x-6 pb-14 last:pb-0 md:grid-cols-[1fr_3rem_1fr] md:gap-x-0">
                <span aria-hidden className="col-start-1 row-start-1 mt-2 flex h-6 w-6 items-center justify-center rounded-full border border-accent/40 bg-[#1c1a18] md:col-start-2 md:mx-auto">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                </span>
                <Reveal
                  className={`col-start-2 row-start-1 ${left ? "md:col-start-1 md:pr-12" : "md:col-start-3 md:pl-12"}`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
                    <span className="text-5xl font-bold leading-none tracking-[-0.05em] sm:text-7xl">{year}</span>
                    <span className="label text-accent">
                      {e.start}
                      {e.end && ` — ${e.end}`}
                    </span>
                  </div>
                  <div className="label mt-4 text-white/50">{e.kind}</div>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight">{e.title}</h3>
                  <div className="mt-1 text-white/70">
                    <MaybeLink href={e.orgUrl} className="inline-flex items-center gap-1 hover:text-accent">
                      {e.org}
                      {e.orgUrl && <Arrow />}
                    </MaybeLink>
                    {e.place && <span className="text-white/40"> · {e.place}</span>}
                  </div>
                  {e.points.length > 0 && (
                    <ul className="mt-4 max-w-lg space-y-2 text-sm leading-relaxed text-white/60">
                      {e.points.map((p) => (
                        <li key={p} className="flex gap-3">
                          <span className="text-accent" aria-hidden>›</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
