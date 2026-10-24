import type { Content } from "@/lib/schema";
import {
  siClaude, siCursor, siDjango, siDocker, siFastapi, siFirebase, siFlutter, siGin, siGo, siJavascript, siKubernetes,
  siMongodb, siNextdotjs, siNodedotjs, siPostgresql, siPython, siReact, siRedis, siTailwindcss, siTypescript,
} from "simple-icons";
import { Reveal } from "@/components/Reveal";

// Official marks only. Anything not listed (OpenAI, AWS, gRPC and GORM marks are not in simple-icons, plus concepts like Evals)
// renders as a plain text tile instead of an invented logo.
const ICONS: Record<string, { path: string; title: string }> = {
  Go: siGo, Python: siPython, TypeScript: siTypescript, JavaScript: siJavascript, Django: siDjango, FastAPI: siFastapi,
  "Node.js": siNodedotjs, PostgreSQL: siPostgresql, MongoDB: siMongodb, Redis: siRedis, Firestore: siFirebase, Gin: siGin,
  Claude: siClaude, Cursor: siCursor, Docker: siDocker, Kubernetes: siKubernetes, React: siReact, "Next.js": siNextdotjs,
  "Tailwind CSS": siTailwindcss, Flutter: siFlutter,
};

function Tile({ name }: { name: string }) {
  const icon = ICONS[name];
  return (
    <li className="flex h-24 min-w-[6.5rem] grow basis-[30%] flex-col items-center sm:aspect-[4/3] sm:h-auto justify-center gap-3 bg-dark p-3 text-[#f5f3ed] transition-colors hover:bg-[#1d1d1d]">
      {icon ? (
        <>
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" role="img" aria-label={icon.title}>
            <path d={icon.path} />
          </svg>
          <span className="label text-center text-[0.625rem] text-white/60">{name}</span>
        </>
      ) : (
        <span className="break-words text-center font-mono text-sm font-medium">{name}</span>
      )}
    </li>
  );
}

export function Stack({ stack }: { stack: Content["stack"] }) {
  return (
    <section id="stack" aria-labelledby="stack-title" className="border-b border-line">
      <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <h2 id="stack-title" className="text-3xl font-medium tracking-tight sm:text-4xl">
          Tools and technologies I work with.
        </h2>
        <div className="mt-10 border-t border-ink">
          {stack.map((g) => (
            <Reveal key={g.category}>
              <div className="grid gap-4 border-b border-line py-6 lg:grid-cols-12">
                <div className="label text-muted lg:col-span-2">{g.category}</div>
                <ul className="flex flex-wrap gap-px sm:grid sm:grid-cols-4 md:grid-cols-6 lg:col-span-10 lg:grid-cols-8">
                  {g.items.map((n) => (
                    <Tile key={n} name={n} />
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="label mt-6 text-muted">And more. Always exploring.</p>
      </div>
    </section>
  );
}
