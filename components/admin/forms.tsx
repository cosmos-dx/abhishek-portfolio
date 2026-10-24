"use client";
import { useState, useTransition } from "react";
import { saveSection } from "@/app/admin/actions";
import type { Content } from "@/lib/schema";
import { Area, Group, Repeater, Select, Strings, Text, Upload } from "./fields";

type P = Content["profile"];
type F = Content["projects"]["featured"];

const TABS = [
  ["profile", "Profile & hero", "profile"],
  ["resume", "Resume", "profile"],
  ["projects", "Projects", "projects"],
  ["experience", "Experience", "experience"],
  ["education", "Education", "education"],
  ["stack", "Tech stack", "stack"],
  ["writing", "Writing", "writing"],
  ["faq", "Chat FAQ", "faq"],
] as const;
type Tab = (typeof TABS)[number][0];

export function AdminApp({ initial }: { initial: Content }) {
  const [c, setC] = useState(initial);
  const [tab, setTab] = useState<Tab>("profile");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const set = <K extends keyof Content>(k: K) => (v: Content[K]) => setC((p) => ({ ...p, [k]: v }));
  const key = TABS.find((t) => t[0] === tab)![2];

  function save() {
    setMsg(null);
    start(async () => {
      const r = await saveSection(key, c[key]);
      setMsg(r.ok ? { ok: true, text: "Saved. The site is updated." } : { ok: false, text: r.error });
    });
  }

  return (
    <div>
      <div role="tablist" aria-label="Sections" className="label mb-6 flex flex-wrap gap-2">
        {TABS.map(([id, name]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id);
              setMsg(null);
            }}
            className={`border px-3 py-2 ${tab === id ? "border-ink bg-ink text-bg" : "border-line hover:border-accent"}`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="space-y-6" role="tabpanel">
        {tab === "profile" && <ProfileForm v={c.profile} set={set("profile")} />}
        {tab === "resume" && (
          <Group title="Resume (PDF)">
            <Upload label="Resume URL" kind="pdf" value={c.profile.resumeUrl} onChange={(resumeUrl) => set("profile")({ ...c.profile, resumeUrl })} hint="Upload a PDF (max 5MB). A Resume link appears on the hero and footer once this is set. Clear it to hide the link." />
          </Group>
        )}
        {tab === "projects" && <ProjectsForm v={c.projects} set={set("projects")} />}
        {tab === "experience" && (
          <Repeater
            label="Experience"
            items={c.experience}
            onChange={set("experience")}
            make={() => ({ company: "", url: "", role: "", location: "", start: "", end: "", points: [] })}
            title={(e) => `${e.role} · ${e.company}`}
            render={(e, u) => (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Text label="Company" value={e.company} onChange={(company) => u({ company })} />
                  <Text label="Company URL" value={e.url} onChange={(url) => u({ url })} />
                  <Text label="Role" value={e.role} onChange={(role) => u({ role })} />
                  <Text label="Location" value={e.location} onChange={(location) => u({ location })} />
                  <Text label="Start" value={e.start} onChange={(start) => u({ start })} hint="e.g. Aug 2025" />
                  <Text label="End" value={e.end} onChange={(end) => u({ end })} hint="e.g. Present" />
                </div>
                <Strings label="Responsibilities" value={e.points} onChange={(points) => u({ points })} />
              </>
            )}
          />
        )}
        {tab === "education" && (
          <Repeater
            label="Education"
            items={c.education}
            onChange={set("education")}
            make={() => ({ school: "", degree: "", location: "", start: "", end: "", note: "" })}
            title={(e) => `${e.degree} · ${e.school}`}
            render={(e, u) => (
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="School" value={e.school} onChange={(school) => u({ school })} />
                <Text label="Degree" value={e.degree} onChange={(degree) => u({ degree })} />
                <Text label="Location" value={e.location} onChange={(location) => u({ location })} />
                <Text label="Note" value={e.note} onChange={(note) => u({ note })} />
                <Text label="Start" value={e.start} onChange={(start) => u({ start })} />
                <Text label="End" value={e.end} onChange={(end) => u({ end })} />
              </div>
            )}
          />
        )}
        {tab === "stack" && (
          <Repeater
            label="Category"
            items={c.stack}
            onChange={set("stack")}
            make={() => ({ category: "", items: [] })}
            title={(g) => g.category}
            render={(g, u) => (
              <>
                <Text label="Category" value={g.category} onChange={(category) => u({ category })} />
                <Strings label="Technologies" value={g.items} onChange={(items) => u({ items })} />
              </>
            )}
          />
        )}
        {tab === "writing" && (
          <Repeater
            label="Article"
            items={c.writing}
            onChange={set("writing")}
            make={() => ({ title: "", summary: "", readTime: "", status: "draft" as const, url: "", image: "" })}
            title={(w) => w.title}
            render={(w, u) => (
              <>
                <Text label="Title" value={w.title} onChange={(title) => u({ title })} />
                <Text label="Summary" value={w.summary} onChange={(summary) => u({ summary })} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Select label="Status" value={w.status} options={["draft", "published"]} onChange={(status) => u({ status })} />
                  <Text label="Meta" value={w.readTime} onChange={(readTime) => u({ readTime })} hint="e.g. LinkedIn · Feb 2025" />
                  <Text label="URL" value={w.url} onChange={(url) => u({ url })} hint="Only link once it is really published." />
                </div>
                <Upload label="Image" value={w.image} onChange={(image) => u({ image })} />
              </>
            )}
          />
        )}
        {tab === "faq" && (
          <>
            <p className="text-sm text-muted">Used by the chatbot as extra knowledge, and as the curated answers in demo mode. Demo mode picks the answer whose keywords best match the question.</p>
            <Repeater
              label="Q&A"
              items={c.faq}
              onChange={set("faq")}
              make={() => ({ q: "", a: "", keywords: [] })}
              title={(f) => f.q}
              render={(f, u) => (
                <>
                  <Text label="Question" value={f.q} onChange={(q) => u({ q })} />
                  <Area label="Answer" value={f.a} onChange={(a) => u({ a })} />
                  <Strings label="Keywords (lowercase single words)" value={f.keywords} onChange={(keywords) => u({ keywords })} />
                </>
              )}
            />
          </>
        )}
      </div>

      <div className="sticky bottom-0 mt-8 flex flex-wrap items-center gap-4 border-t border-ink bg-bg py-4">
        <button onClick={save} disabled={pending} className="label bg-accent px-6 py-3 text-white hover:opacity-90 disabled:opacity-50">
          {pending ? "Saving…" : "Save"}
        </button>
        {msg && (
          <pre role={msg.ok ? "status" : "alert"} className={`whitespace-pre-wrap text-xs ${msg.ok ? "text-ink" : "text-accent"}`}>
            {msg.text}
          </pre>
        )}
      </div>
    </div>
  );
}

function ProfileForm({ v, set }: { v: P; set: (v: P) => void }) {
  const u = (patch: Partial<P>) => set({ ...v, ...patch });
  const img = (k: keyof P["images"], label: string, hint: string) => (
    <Upload label={label} value={v.images[k]} onChange={(s) => u({ images: { ...v.images, [k]: s } })} hint={hint} />
  );
  return (
    <>
      <Group title="Identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="First name" value={v.first} onChange={(first) => u({ first })} />
          <Text label="Last name" value={v.last} onChange={(last) => u({ last })} />
          <Text label="Location" value={v.location} onChange={(location) => u({ location })} />
          <Text label="Coordinates" value={v.coords} onChange={(coords) => u({ coords })} />
          <Text label="Tagline" value={v.tagline} onChange={(tagline) => u({ tagline })} />
          <Text label="Email" value={v.email} onChange={(email) => u({ email })} hint="Leave empty to hide." />
          <Text label="GitHub URL" value={v.github} onChange={(github) => u({ github })} hint="Leave empty to hide." />
          <Text label="LinkedIn URL" value={v.linkedin} onChange={(linkedin) => u({ linkedin })} hint="Leave empty to hide." />
        </div>
        <Area label="Bio (also used by the chatbot)" value={v.bio} onChange={(bio) => u({ bio })} />
      </Group>
      <Group title="Hero text">
        <Strings label="Roles" value={v.roles} onChange={(roles) => u({ roles })} />
        <Strings label="“Building” labels" value={v.labels} onChange={(labels) => u({ labels })} />
        <Text label="Status box title" value={v.currently.title} onChange={(title) => u({ currently: { ...v.currently, title } })} />
        <Strings label="Status box items" value={v.currently.items} onChange={(items) => u({ currently: { ...v.currently, items } })} />
      </Group>
      <Group title="Images">
        {img("hero", "Hero architecture (4:5)", "Large photo on the right of the hero.")}
        {img("mountain", "Hero mountain (3:4)", "Small crop at the left edge.")}
        {img("signal", "Hero signal panel (4:3)", "Dark visual overlapping the hero image.")}
        {img("experience", "Experience image (16:9)", "Shown beside the experience heading.")}
      </Group>
    </>
  );
}

function ProjectsForm({ v, set }: { v: Content["projects"]; set: (v: Content["projects"]) => void }) {
  const f = v.featured;
  const u = (patch: Partial<F>) => set({ ...v, featured: { ...f, ...patch } });
  return (
    <>
      <Group title="Featured project">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Name" value={f.name} onChange={(name) => u({ name })} />
          <Text label="Slug" value={f.slug} onChange={(slug) => u({ slug })} hint="URL path: /projects/<slug>. Lowercase letters, digits, dashes." />
          <Text label="Live URL" value={f.url} onChange={(url) => u({ url })} />
          <Text label="Your role" value={f.role} onChange={(role) => u({ role })} />
        </div>
        <Text label="Tagline" value={f.tagline} onChange={(tagline) => u({ tagline })} />
        <Area label="Description" value={f.description} onChange={(description) => u({ description })} />
        <Strings label="Technology" value={f.tech} onChange={(tech) => u({ tech })} />
        <Upload label="Backdrop image (16:10)" value={f.image} onChange={(image) => u({ image })} />
        <Upload label="Product screenshot" value={f.screenshot} onChange={(screenshot) => u({ screenshot })} />
      </Group>
      <Group title="Case study">
        <Area label="Problem" value={f.problem} onChange={(problem) => u({ problem })} />
        <Area label="Solution" value={f.solution} onChange={(solution) => u({ solution })} />
        <Repeater
          label="Architecture component"
          items={f.architecture}
          onChange={(architecture) => u({ architecture })}
          make={() => ({ name: "", role: "" })}
          title={(a) => a.name}
          render={(a, up) => (
            <>
              <Text label="Name" value={a.name} onChange={(name) => up({ name })} />
              <Text label="Role" value={a.role} onChange={(role) => up({ role })} />
            </>
          )}
        />
        <Repeater
          label="Engineering decision"
          items={f.decisions}
          onChange={(decisions) => u({ decisions })}
          make={() => ({ title: "", body: "" })}
          title={(d) => d.title}
          render={(d, up) => (
            <>
              <Text label="Title" value={d.title} onChange={(title) => up({ title })} />
              <Area label="Body" value={d.body} onChange={(body) => up({ body })} rows={3} />
            </>
          )}
        />
        <Strings label="Trade-offs" value={f.tradeoffs} onChange={(tradeoffs) => u({ tradeoffs })} />
        <Strings label="Outcomes (verified only)" value={f.outcomes} onChange={(outcomes) => u({ outcomes })} />
      </Group>
      <Repeater
        label="Sub-product"
        items={f.subProducts}
        onChange={(subProducts) => u({ subProducts })}
        make={() => ({ name: "", url: "", description: "", image: "", points: [] })}
        title={(s) => s.name}
        render={(s, up) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Text label="Name" value={s.name} onChange={(name) => up({ name })} />
              <Text label="URL" value={s.url} onChange={(url) => up({ url })} />
            </div>
            <Area label="Description" value={s.description} onChange={(description) => up({ description })} rows={3} />
            <Upload label="Image (16:9)" value={s.image} onChange={(image) => up({ image })} />
            <Strings label="Points" value={s.points} onChange={(points) => up({ points })} />
          </>
        )}
      />
      <Repeater
        label="Other work"
        items={v.other}
        onChange={(other) => set({ ...v, other })}
        make={() => ({ name: "", year: "", description: "", url: "", tech: [] })}
        title={(o) => o.name}
        render={(o, up) => (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Text label="Name" value={o.name} onChange={(name) => up({ name })} />
              <Text label="Year" value={o.year} onChange={(year) => up({ year })} />
              <Text label="URL" value={o.url} onChange={(url) => up({ url })} hint="Empty = no link." />
            </div>
            <Text label="Description" value={o.description} onChange={(description) => up({ description })} />
            <Strings label="Tech" value={o.tech} onChange={(tech) => up({ tech })} />
          </>
        )}
      />
    </>
  );
}
