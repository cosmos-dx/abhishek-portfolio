import { getContent } from "@/lib/content";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Systems } from "@/components/sections/Systems";
import { Experience } from "@/components/sections/Experience";
import { Stack } from "@/components/sections/Stack";
import { Writing } from "@/components/sections/Writing";
import { AbhishekAIChat } from "@/components/sections/Chat";
import { ChatFab } from "@/components/ChatFab";
import { Footer } from "@/components/sections/Footer";

// Content is edited at runtime from /admin and stored on a volume, so render per request.
export const dynamic = "force-dynamic";

export default async function Home() {
  const c = await getContent();
  return (
    <>
      <main>
        <Hero profile={c.profile} />
        <Projects projects={c.projects} />
        <Systems />
        <Experience experience={c.experience} education={c.education} image={c.profile.images.experience} />
        <Stack stack={c.stack} />
        <Writing writing={c.writing} linkedin={c.profile.linkedin} />
        <AbhishekAIChat mode={process.env.LLM_API_KEY ? "live" : "demo"} />
      </main>
      <Footer profile={c.profile} />
      <ChatFab />
    </>
  );
}
