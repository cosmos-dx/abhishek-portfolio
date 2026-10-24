"use client";

import { useEffect, useState } from "react";

// Sticky "ask the agent" button: a blocky Claude-style bot flashing a victory sign. Jumps to #chat.
// Hidden while the hero is mostly on screen (it would sit on the hero's bottom row) and while the chat itself is visible.
export function ChatFab() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hide = { hero: true, chat: false };
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.target.id === "hero") hide.hero = e.intersectionRatio >= 0.5;
          else hide.chat = e.isIntersecting;
        }
        setShow(!hide.hero && !hide.chat);
      },
      { threshold: [0, 0.5] },
    );
    for (const id of ["hero", "chat"]) { const el = document.getElementById(id); if (el) io.observe(el); }
    return () => io.disconnect();
  }, []);

  return (
    <a
      href="#chat"
      aria-label="Chat with Abhishek's AI agent"
      className={`fixed right-4 z-40 flex h-16 w-16 items-center justify-center border border-ink bg-ink transition duration-300 hover:-translate-y-0.5 sm:right-6 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      tabIndex={show ? 0 : -1}
    >
      <svg viewBox="6 10 58 44" className="h-12 w-12" aria-hidden="true" shapeRendering="crispEdges">
        <g fill="#F06428">
          <rect x="14" y="24" width="36" height="22" />
          <rect x="8" y="34" width="6" height="8" />
          <rect x="50" y="30" width="6" height="6" />
          <rect x="20" y="46" width="5" height="6" />
          <rect x="39" y="46" width="5" height="6" />
        </g>
        <g stroke="#F06428" strokeWidth="4" strokeLinecap="square">
          <path d="M55 30 L52 14" />
          <path d="M59 30 L64 15" />
        </g>
        <g fill="#151515">
          <rect x="22" y="31" width="4" height="8" />
          <rect x="38" y="31" width="4" height="8" />
        </g>
      </svg>
    </a>
  );
}
