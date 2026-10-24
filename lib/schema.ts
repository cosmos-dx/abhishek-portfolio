import { z } from "zod";

/** Links must be http(s) or site-relative. Blocks `javascript:` / `data:` hrefs. Empty = "not set". */
export const safeUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v) || /^\/(?!\/)/.test(v), "Must be http(s):// or start with /");

const str = (max = 300) => z.string().trim().max(max);
const long = z.string().trim().max(2000);
const list = (max = 300) => z.array(str(max)).max(30);

const image = safeUrl;

export const contentSchema = z.object({
  profile: z.object({
    first: str(40),
    last: str(40),
    roles: list(40).max(5),
    labels: list(40).max(8),
    location: str(60),
    coords: str(40),
    tagline: str(80),
    bio: long,
    currently: z.object({ title: str(40), items: list(80).max(5) }),
    email: z.union([z.literal(""), z.string().trim().email().max(200)]),
    github: safeUrl,
    linkedin: safeUrl,
    resumeUrl: safeUrl,
    images: z.object({ hero: image, mountain: image, signal: image, experience: image }),
  }),
  projects: z.object({
    featured: z.object({
      slug: z.string().trim().regex(/^[a-z0-9-]{1,40}$/),
      name: str(60),
      url: safeUrl,
      tagline: str(160),
      description: long,
      role: str(120),
      image: image,
      screenshot: image,
      tech: list(40),
      problem: long,
      solution: long,
      architecture: z.array(z.object({ name: str(60), role: str(240) })).max(12),
      decisions: z.array(z.object({ title: str(100), body: long })).max(12),
      tradeoffs: list(400),
      outcomes: list(400),
      subProducts: z
        .array(z.object({ name: str(60), url: safeUrl, description: str(400), image: image, points: list(160).max(4) }))
        .max(4),
    }),
    other: z
      .array(z.object({ name: str(60), year: str(10), description: str(300), url: safeUrl, tech: list(30).max(6) }))
      .max(12),
  }),
  experience: z
    .array(
      z.object({
        company: str(80),
        url: safeUrl,
        role: str(80),
        location: str(60),
        start: str(30),
        end: str(30),
        points: list(300),
      }),
    )
    .max(12),
  education: z
    .array(z.object({ school: str(120), degree: str(120), location: str(60), start: str(30), end: str(30), note: str(300) }))
    .max(8),
  stack: z.array(z.object({ category: str(40), items: list(40).max(16) })).max(10),
  writing: z
    .array(
      z.object({
        title: str(120),
        summary: str(300),
        readTime: str(20),
        status: z.enum(["draft", "published"]),
        url: safeUrl,
        image: image,
      }),
    )
    .max(12),
  faq: z
    .array(z.object({ q: str(200), a: long, keywords: list(40).max(12) }))
    .max(30),
});

export type Content = z.infer<typeof contentSchema>;
