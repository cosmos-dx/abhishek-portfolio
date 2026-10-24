import type { Content } from "@/lib/schema";
import { BrandIcon, MaybeLink } from "@/components/ui";
import { ImageFrame } from "@/components/ImageFrame";
import { Shatter } from "@/components/Shatter";
import { ArrowDown } from "lucide-react";

// Layout: below lg the hero image is a full-bleed background behind the name, in its real colours so the
// whole site stays in the light theme and the first screen is just the name. From lg up it is the split layout: the name uses mix-blend-difference with white text, so it reads
// dark on ivory and flips to light wherever it crosses a dark area. For that to work the text must share a stacking
// context with what it overlaps, so the left column deliberately has no z-index and the image column sits behind
// it with -z-10.
const blend = "text-ink lg:text-white lg:mix-blend-difference";
const ink = "text-muted";

function Currently({ profile, className = "", light = false }: { profile: Content["profile"]; className?: string; light?: boolean }) {
  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-x-6 lg:block">
        <div>
          <div className="label flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-accent" aria-hidden />
            {profile.currently.title}
          </div>
          <ul className={`label mt-2 space-y-1 ${light ? "text-muted" : "text-white/70"}`}>
            {profile.currently.items.map((i) => (
              <li key={i}>› {i}</li>
            ))}
          </ul>
        </div>
        <div className="lg:mt-3 lg:border-t lg:border-white/15 lg:pt-3">
          <div className={`label ${light ? "text-muted" : "text-white/50"}`}>{"// Building"}</div>
          <ul className="label mt-2 space-y-1">
            {profile.labels.map((l) => (
              <li key={l}>
                <span className="text-accent" aria-hidden>
                  ›
                </span>{" "}
                {l}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function Hero({ profile }: { profile: Content["profile"] }) {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative border-b border-line">
      <div className="relative mx-auto grid min-h-[100svh] max-w-[1600px] lg:grid-cols-12">
        {/* Left: typography */}
        <div className="relative flex flex-col px-5 pb-6 pt-6 sm:px-8 lg:col-span-7 lg:px-10 lg:pb-10">
          <div className={`label ml-auto text-right ${ink}`}>
            <div>{profile.coords}</div>
            <div>{profile.location}</div>
          </div>

          <div data-orb-shift className="relative my-auto py-10 lg:py-16">
            <p className={`label mb-6 max-w-xs ${ink}`}>{`// ${profile.tagline.toLowerCase()}`}</p>
            <div className="relative">
              {/* Mountain crop sits at the page edge, behind the name (desktop only) */}
              <div className="absolute -left-10 top-[30%] hidden w-[9vw] max-w-36 lg:block">
                <ImageFrame src={profile.images.mountain} alt="" ratio="3/4" sizes="150px" dark />
              </div>
              <h1
                id="hero-title"
                className="relative whitespace-nowrap text-[21vw] leading-[0.84] tracking-[-0.04em] sm:text-[17vw] lg:text-[clamp(3.25rem,13.5vw,12rem)]"
              >
                <span className={`block font-extrabold ${blend}`}>{profile.first}</span>
                <span className="block font-extralight">
                  <span className={blend}>{profile.last}</span>
                  <span aria-hidden className="ml-[0.1em] inline-block h-[0.045em] w-[0.42em] bg-accent" />
                </span>
              </h1>
            </div>
            <p className="label mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink">
              {profile.roles.map((r, i) => (
                <span key={r} className="flex items-center gap-3">
                  {i > 0 && (
                    <span className="text-accent" aria-hidden>
                      ×
                    </span>
                  )}
                  {r}
                </span>
              ))}
            </p>
          </div>

          <div data-orb-icons className="label flex items-center gap-3 text-ink">
            {([["github", "GitHub", profile.github], ["linkedin", "LinkedIn", profile.linkedin]] as const).map(
              ([icon, name, href]) =>
                href && (
                  <MaybeLink
                    key={icon}
                    href={href}
                    className="flex h-9 w-9 items-center justify-center border border-ink/30 transition-colors hover:border-accent hover:text-accent"
                  >
                    <BrandIcon name={icon} />
                    <span className="sr-only">{name}</span>
                  </MaybeLink>
                ),
            )}
            {profile.resumeUrl && (
              <MaybeLink
                href={profile.resumeUrl}
                download="Abhishek-Gupta-Resume.pdf"
                className="ml-3 inline-flex items-center gap-2 border-b border-ink pb-1 hover:border-accent hover:text-accent"
              >
                Resume <ArrowDown className="h-3 w-3" aria-hidden />
              </MaybeLink>
            )}
            <span className="ml-auto flex items-center gap-2 text-muted lg:hidden" aria-hidden>
              <span className="h-1.5 w-1.5 animate-pulse bg-accent" />
              Tap to play
            </span>
          </div>
        </div>

        {/* Image: full-bleed background below lg, right column from lg (behind the left column's text) */}
        <div className="absolute inset-0 -z-10 lg:relative lg:col-span-5">
          <Shatter className="absolute inset-0">
            <ImageFrame
              src={profile.images.hero}
              alt="Concrete architecture with a single orange doorway"
              ratio="fill"
              className="absolute inset-0"
              sizes="(min-width: 1024px) 42vw, 100vw"
              priority
            />
          </Shatter>

          <div className="absolute -left-20 bottom-28 z-20 hidden w-72 bg-dark p-1 shadow-2xl lg:block">
            <div className="relative">
              <ImageFrame src={profile.images.signal} alt="Dark wireframe terrain visualisation" ratio="4/3" sizes="300px" dark />
              <ul className="label absolute left-3 top-3 space-y-0.5 text-[0.625rem] text-white/80">
                {["Harness ↗", "Backend", "Architecture", "Real-world"].map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>

          <Currently
            profile={profile}
            className="absolute bottom-8 right-8 z-20 hidden bg-dark/90 px-4 py-3 text-white backdrop-blur-sm lg:block"
          />
        </div>
      </div>

      {/* Mobile / tablet: the Currently panel sits below the first screen, so the hero is just the name and the orb */}
      <Currently light profile={profile} className="border-b border-line bg-[#faf9f5] px-5 py-6 text-ink sm:px-8 lg:hidden" />

      {/* Bottom strip */}
      <div className="label mx-auto flex max-w-[1600px] items-center justify-between gap-4 border-t border-line px-5 py-4 text-muted sm:px-8 lg:px-10">
        <span className="hidden sm:inline">Same curiosity, bigger systems.</span>
        <a href="#projects" className="ml-auto flex items-center gap-2 hover:text-ink">
          Scroll <ArrowDown className="h-3 w-3" aria-hidden />
        </a>
      </div>
    </section>
  );
}
