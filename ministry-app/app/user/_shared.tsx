"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useState } from "react";

export type SessionUser = {
  id: number;
  name: string;
  username: string;
  role: "USER" | "ADMIN";
  division: string;
};

export type AppRequest = {
  id: number;
  division: string;
  requestType: "TONER" | "MULTIMEDIA" | "REPAIR";
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  dateSubmitted: string;
  adminComments?: string | null;
  toner?: { printerSerial: string; printerModel: string } | null;
  multimedia?: { equipmentType: string; dateTime: string; meetingDetails: string } | null;
  repair?: { computerSerial: string; issue: string; priority: string } | null;
};

export const STATUS_COLOR: Record<AppRequest["status"], string> = {
  PENDING: "pill pending",
  APPROVED: "pill approved",
  REJECTED: "pill rejected",
};

type ChatEntry = { role: "user" | "bot"; message: string };

const chatbotRules = [
  {
    keywords: ["toner", "printer"],
    answer:
      "To request toner: open Toner CRUD, add serial and model, and submit. You can edit or delete while status is pending.",
  },
  {
    keywords: ["multimedia", "meeting", "projector", "laptop", "sound"],
    answer:
      "To request multimedia: open Multimedia CRUD, set equipment type, date/time needed, meeting details, and submit.",
  },
  {
    keywords: ["repair", "computer", "issue", "priority"],
    answer:
      "To request repair: open Repair CRUD, add computer serial, issue description, choose priority, and submit.",
  },
  {
    keywords: ["status", "track", "history", "dashboard"],
    answer: "Use All Requests Dashboard to filter and view complete request history and statuses.",
  },
];

function answerQuestion(text: string) {
  const lowered = text.toLowerCase();
  const hit = chatbotRules.find((rule) => rule.keywords.some((keyword) => lowered.includes(keyword)));
  if (hit) {
    return hit.answer;
  }

  return "I can help with toner, multimedia, repair, and request tracking guidance.";
}

export function useRequireUser() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        router.replace("/login");
        return;
      }

      const sessionData = (await response.json()) as { user: SessionUser };
      if (sessionData.user.role !== "USER") {
        router.replace("/admin");
        return;
      }

      setUser(sessionData.user);
      setLoading(false);
    };

    bootstrap();
  }, [router]);

  return { user, loading };
}

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatEntry[]>([
    { role: "bot", message: "Hello. I am your MRRMS assistant. Ask me anything about requests." },
  ]);
  const [draft, setDraft] = useState("");
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const submitQuestion = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", message: trimmed },
      { role: "bot", message: answerQuestion(trimmed) },
    ]);
    setDraft("");
  };

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDragging(true);
    setOffset({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) {
      return;
    }

    const nextX = Math.max(10, Math.min(window.innerWidth - 74, event.clientX - offset.x));
    const nextY = Math.max(10, Math.min(window.innerHeight - 74, event.clientY - offset.y));
    setPosition({ x: nextX, y: nextY });
  };

  const onPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <>
      <button
        type="button"
        className="chat-button"
        style={{ left: position.x, top: position.y }}
        onClick={() => setOpen((current) => !current)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        title="AI Assistant"
      >
        <span className="tree-icon">Tree</span>
      </button>

      {open ? (
        <section className="chat-window" style={{ right: 16, bottom: 16 }}>
          <header>
            <h3>MRRMS Assistant</h3>
            <button type="button" onClick={() => setOpen(false)}>
              Close
            </button>
          </header>
          <div className="chat-log">
            {messages.map((item, index) => (
              <p key={`${item.role}-${index}`} className={item.role === "bot" ? "bot" : "user"}>
                {item.message}
              </p>
            ))}
          </div>
          <form onSubmit={submitQuestion}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about request steps"
            />
            <button type="submit">Send</button>
          </form>
        </section>
      ) : null}
    </>
  );
}

const links = [
  { href: "/user", label: "Home" },
  { href: "/user/toner", label: "Toner Request" },
  { href: "/user/multimedia", label: "Multimedia Request" },
  { href: "/user/repair", label: "Repair Machines" },
  { href: "/user/requests", label: "All Requests Dashboard" },
];

export function UserPageShell({
  user,
  title,
  subtitle,
  children,
}: {
  user: SessionUser;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const router = useRouter();

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Staff Workspace</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <p>
            Signed in as <strong>{user.name}</strong> ({user.division})
          </p>
        </div>
        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <nav className="quick-nav">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="quick-nav-item">
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
      <ChatbotWidget />
    </main>
  );
}
