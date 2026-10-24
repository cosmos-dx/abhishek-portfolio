import Image from "next/image";
import { assetExists } from "@/lib/uploads";

/**
 * Image with a fixed aspect ratio. When the file isn't there yet it renders a deliberate placeholder
 * (fine grid + asset name + ratio) instead of a broken image, so layout is final before assets exist.
 */
export function ImageFrame({
  src,
  alt,
  ratio,
  sizes = "(min-width: 1024px) 40vw, 100vw",
  priority = false,
  className = "",
  fit = "cover",
  dark = false,
}: {
  src: string;
  alt: string;
  ratio: string; // "4/5"
  sizes?: string;
  priority?: boolean;
  className?: string;
  fit?: "cover" | "contain" | "scroll";
  dark?: boolean;
}) {
  const exists = assetExists(src);
  const style = ratio === "fill" ? undefined : { aspectRatio: ratio }; // "fill": parent controls the size
  const remote = /^https?:\/\//i.test(src);
  return (
    <div className={`${ratio === "fill" ? "absolute inset-0" : "relative"} overflow-hidden ${fit === "scroll" ? "[container-type:size]" : ""} ${className}`} style={style}>
      {exists && fit === "scroll" && (
        // Tall page capture panned by compositor-only CSS (see .tour): 60fps, tiny, and crisper than a GIF.
        // eslint-disable-next-line @next/next/no-img-element -- must keep natural height; next/image `fill` would crop it
        <img src={src} alt={alt} className="tour absolute left-0 top-0 h-auto w-full max-w-none" loading="lazy" decoding="async" />
      )}
      {exists && fit !== "scroll" && remote && (
        // eslint-disable-next-line @next/next/no-img-element -- admin-provided remote URL, host unknown at build time
        <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`} loading={priority ? "eager" : "lazy"} />
      )}
      {exists && fit !== "scroll" && !remote && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={/\.(svg|gif)$/i.test(src)} // animated GIFs would lose their animation through the optimiser
          className={`${fit === "contain" ? "object-contain" : "object-cover"} transition-transform duration-700 ease-out group-hover:scale-[1.03]`}
        />
      )}
      {!exists && (
        <div
          role="img"
          aria-label={`${alt} (image not added yet)`}
          className={`absolute inset-0 flex flex-col justify-between p-3 ${dark ? "grid-fine-dark bg-[#1a1a1a] text-white/60" : "grid-fine bg-[#e8e5dc] text-muted"}`}
        >
          <span className="label">Image pending</span>
          <span className="label break-all">
            {src ? src.split("/").pop() : "unset"} · {ratio.replace("/", ":")}
          </span>
        </div>
      )}
    </div>
  );
}

