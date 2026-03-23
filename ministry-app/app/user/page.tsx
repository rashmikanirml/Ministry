"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SessionUser = {
  id: number;
  name: string;
  username: string;
  role: "USER" | "ADMIN";
  division: string;
};

type AppRequest = {
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

type ChatEntry = { role: "user" | "bot"; message: string };

const STATUS_COLOR: Record<AppRequest["status"], string> = {
  PENDING: "pill pending",
  APPROVED: "pill approved",
  REJECTED: "pill rejected",
};

const chatbotRules = [
  {
    keywords: ["toner", "printer"],
    answer:
      "To request toner: choose Toner Request, add printer serial and model, explain the need, then submit. The admin will verify the printer before approval.",
  },
  {
    keywords: ["multimedia", "meeting", "projector", "laptop", "sound"],
    answer:
      "To request multimedia equipment: choose Multimedia Request, select equipment type, set date/time needed, and add meeting details.",
  },
  {
    keywords: ["repair", "computer", "issue", "priority"],
    answer:
      "To request computer repair: choose Computer Repair Request, enter computer serial, describe the issue, and select priority.",
  },
  {
    keywords: ["status", "track", "history"],
    answer: "Use the request table to track status. Pending, approved, and rejected requests are all kept in your history.",
  },
];

function answerQuestion(text: string) {
  const lowered = text.toLowerCase();
  const hit = chatbotRules.find((rule) => rule.keywords.some((keyword) => lowered.includes(keyword)));
  if (hit) {
    return hit.answer;
  }

  return "I can help with toner, multimedia, and repair request steps. Ask me what you need to submit.";
}

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatEntry[]>([
    { role: "bot", message: "Hello. I am your MRRMS assistant. Ask how to submit a request." },
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

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [requests, setRequests] = useState<AppRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [requestType, setRequestType] = useState<"TONER" | "MULTIMEDIA" | "REPAIR">("TONER");
  const [description, setDescription] = useState("");
  const [printerSerial, setPrinterSerial] = useState("");
  const [printerModel, setPrinterModel] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [meetingDateTime, setMeetingDateTime] = useState("");
  const [meetingDetails, setMeetingDetails] = useState("");
  const [computerSerial, setComputerSerial] = useState("");
  const [repairIssue, setRepairIssue] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadRequests = async (selectedStatus = statusFilter) => {
    const params = new URLSearchParams();
    if (selectedStatus !== "ALL") {
      params.set("status", selectedStatus);
    }

    const response = await fetch(`/api/requests?${params.toString()}`, { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as AppRequest[];
    setRequests(data);
  };

  useEffect(() => {
    const bootstrap = async () => {
      const sessionResponse = await fetch("/api/auth/me", { cache: "no-store" });
      if (!sessionResponse.ok) {
        router.replace("/login");
        return;
      }

      const sessionData = (await sessionResponse.json()) as { user: SessionUser };
      if (sessionData.user.role !== "USER") {
        router.replace("/admin");
        return;
      }

      setUser(sessionData.user);
      await loadRequests();
      setLoading(false);
    };

    bootstrap();
  }, [router]);

  const onSubmitRequest = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const payload: Record<string, string> = {
      requestType,
      description,
    };

    if (requestType === "TONER") {
      payload.printerSerial = printerSerial;
      payload.printerModel = printerModel;
    }

    if (requestType === "MULTIMEDIA") {
      payload.equipmentType = equipmentType;
      payload.dateTime = meetingDateTime;
      payload.meetingDetails = meetingDetails;
    }

    if (requestType === "REPAIR") {
      payload.computerSerial = computerSerial;
      payload.issue = repairIssue;
      payload.priority = priority;
    }

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to create request.");
      return;
    }

    setMessage("Request submitted successfully.");
    setDescription("");
    setPrinterSerial("");
    setPrinterModel("");
    setEquipmentType("");
    setMeetingDateTime("");
    setMeetingDetails("");
    setComputerSerial("");
    setRepairIssue("");
    setPriority("MEDIUM");
    await loadRequests();
  };

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const stats = useMemo(() => {
    return {
      pending: requests.filter((item) => item.status === "PENDING").length,
      approved: requests.filter((item) => item.status === "APPROVED").length,
      rejected: requests.filter((item) => item.status === "REJECTED").length,
    };
  }, [requests]);

  if (loading || !user) {
    return <main className="loading-screen">Loading dashboard...</main>;
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Staff Dashboard</p>
          <h1>Welcome, {user.name}</h1>
          <p>
            Division: <strong>{user.division}</strong>
          </p>
        </div>
        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <section className="stats-grid">
        <article>
          <p>Pending</p>
          <h3>{stats.pending}</h3>
        </article>
        <article>
          <p>Approved</p>
          <h3>{stats.approved}</h3>
        </article>
        <article>
          <p>Rejected</p>
          <h3>{stats.rejected}</h3>
        </article>
      </section>

      <section className="panel">
        <h2>Create Request</h2>
        <form onSubmit={onSubmitRequest} className="request-form">
          <label>
            Request Type
            <select
              value={requestType}
              onChange={(event) => setRequestType(event.target.value as "TONER" | "MULTIMEDIA" | "REPAIR")}
            >
              <option value="TONER">Toner Request</option>
              <option value="MULTIMEDIA">Multimedia Equipment Request</option>
              <option value="REPAIR">Computer Repair Request</option>
            </select>
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              placeholder="Provide a clear request description"
            />
          </label>

          {requestType === "TONER" ? (
            <div className="two-cols">
              <label>
                Printer Serial Code
                <input
                  value={printerSerial}
                  onChange={(event) => setPrinterSerial(event.target.value)}
                  required
                />
              </label>
              <label>
                Printer Model
                <input
                  value={printerModel}
                  onChange={(event) => setPrinterModel(event.target.value)}
                  required
                />
              </label>
            </div>
          ) : null}

          {requestType === "MULTIMEDIA" ? (
            <div className="two-cols">
              <label>
                Equipment Type
                <input
                  value={equipmentType}
                  onChange={(event) => setEquipmentType(event.target.value)}
                  required
                  placeholder="Projector, Laptop, Sound System"
                />
              </label>
              <label>
                Date and Time Needed
                <input
                  type="datetime-local"
                  value={meetingDateTime}
                  onChange={(event) => setMeetingDateTime(event.target.value)}
                  required
                />
              </label>
              <label className="span-two">
                Meeting Details
                <input
                  value={meetingDetails}
                  onChange={(event) => setMeetingDetails(event.target.value)}
                  required
                />
              </label>
            </div>
          ) : null}

          {requestType === "REPAIR" ? (
            <div className="two-cols">
              <label>
                Computer ID or Serial
                <input
                  value={computerSerial}
                  onChange={(event) => setComputerSerial(event.target.value)}
                  required
                />
              </label>
              <label>
                Priority
                <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </label>
              <label className="span-two">
                Issue Description
                <textarea
                  value={repairIssue}
                  onChange={(event) => setRepairIssue(event.target.value)}
                  required
                />
              </label>
            </div>
          ) : null}

          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}

          <button type="submit">Submit Request</button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>My Request History</h2>
          <select
            value={statusFilter}
            onChange={async (event) => {
              const selected = event.target.value;
              setStatusFilter(selected);
              await loadRequests(selected);
            }}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Admin Comments</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6}>No requests found.</td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.requestType}</td>
                    <td>{item.description}</td>
                    <td>{new Date(item.dateSubmitted).toLocaleString()}</td>
                    <td>
                      <span className={STATUS_COLOR[item.status]}>{item.status}</span>
                    </td>
                    <td>{item.adminComments || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ChatbotWidget />
    </main>
  );
}
