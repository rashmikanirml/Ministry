"use client";

import { useEffect, useState } from "react";
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
  user: { id: number; name: string; username: string; division: string };
  toner?: { printerSerial: string; printerModel: string } | null;
  multimedia?: { equipmentType: string; dateTime: string; meetingDetails: string } | null;
  repair?: { computerSerial: string; issue: string; priority: string } | null;
};

const STATUS_COLOR: Record<AppRequest["status"], string> = {
  PENDING: "pill pending",
  APPROVED: "pill approved",
  REJECTED: "pill rejected",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requests, setRequests] = useState<AppRequest[]>([]);
  const [error, setError] = useState("");

  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [division, setDivision] = useState("");
  const [search, setSearch] = useState("");
  const [commentByRequest, setCommentByRequest] = useState<Record<number, string>>({});

  const bootstrapAdmin = async () => {
    try {
      const sessionResponse = await fetch("/api/auth/me", { cache: "no-store" });
      if (!sessionResponse.ok) {
        setError("Your session expired. Please login again.");
        setAdmin(null);
        return;
      }

      const sessionData = (await sessionResponse.json()) as { user: SessionUser };
      if (sessionData.user.role !== "ADMIN") {
        setError("Only admin accounts can access this dashboard.");
        setAdmin(null);
        return;
      }

      setAdmin(sessionData.user);
      setLoading(false);
      loadRequests();
    } catch {
      setError("Admin dashboard failed to load. Please refresh.");
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    setRequestsLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (type !== "ALL") {
      params.set("type", type);
    }
    if (status !== "ALL") {
      params.set("status", status);
    }
    if (division.trim()) {
      params.set("division", division.trim());
    }
    if (search.trim()) {
      params.set("search", search.trim());
    }

    const response = await fetch(`/api/requests?${params.toString()}`, { cache: "no-store" });
    if (!response.ok) {
      setError("Failed to load requests.");
      setRequestsLoading(false);
      return;
    }
    const data = (await response.json()) as AppRequest[];
    setRequests(data);
    setRequestsLoading(false);
  };

  useEffect(() => {
    bootstrapAdmin();
  }, []);

  const updateStatus = async (id: number, action: "APPROVE" | "REJECT") => {
    const response = await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        adminComments: commentByRequest[id] || "",
      }),
    });

    if (!response.ok) {
      setError("Failed to update request status.");
      return;
    }

    await loadRequests();
  };

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  if (loading) {
    return <main className="loading-screen">Loading admin dashboard...</main>;
  }

  if (!admin) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <p className="auth-eyebrow">Admin Access</p>
          <h1>Unable to open dashboard</h1>
          <p className="auth-subtitle">{error || "Please retry or login again."}</p>
          <div className="action-row" style={{ marginTop: "1rem" }}>
            <button type="button" onClick={bootstrapAdmin}>
              Retry
            </button>
            <button type="button" className="muted-btn" onClick={() => router.replace("/login")}>
              Go to Login
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-shell admin">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Request Approval Dashboard</h1>
          <p>Signed in as {admin.name}</p>
        </div>
        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <section className="panel">
        <h2>Filters</h2>
        <div className="four-cols">
          <label>
            Type
            <select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="ALL">All</option>
              <option value="TONER">Toner</option>
              <option value="MULTIMEDIA">Multimedia</option>
              <option value="REPAIR">Repair</option>
            </select>
          </label>

          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </label>

          <label>
            Division
            <input value={division} onChange={(event) => setDivision(event.target.value)} />
          </label>

          <label>
            Search
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Description, user"
            />
          </label>
        </div>
        <button type="button" onClick={loadRequests}>
          Apply Filters
        </button>
      </section>

      <section className="panel">
        <h2>All Requests and History</h2>
        {error ? <p className="error-text">{error}</p> : null}
        {requestsLoading ? <p className="auth-subtitle">Loading requests...</p> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Division</th>
                <th>Type</th>
                <th>Details</th>
                <th>Status</th>
                <th>Admin Comment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={8}>No requests found.</td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      {item.user.name}
                      <br />
                      <small>{item.user.username}</small>
                    </td>
                    <td>{item.division}</td>
                    <td>{item.requestType}</td>
                    <td>
                      <p>{item.description}</p>
                      {item.toner ? (
                        <small>
                          Serial: {item.toner.printerSerial}, Model: {item.toner.printerModel}
                        </small>
                      ) : null}
                      {item.multimedia ? (
                        <small>
                          {item.multimedia.equipmentType}, {new Date(item.multimedia.dateTime).toLocaleString()}
                        </small>
                      ) : null}
                      {item.repair ? (
                        <small>
                          {item.repair.computerSerial}, {item.repair.priority}
                        </small>
                      ) : null}
                    </td>
                    <td>
                      <span className={STATUS_COLOR[item.status]}>{item.status}</span>
                    </td>
                    <td>
                      <textarea
                        value={commentByRequest[item.id] ?? item.adminComments ?? ""}
                        onChange={(event) =>
                          setCommentByRequest((current) => ({ ...current, [item.id]: event.target.value }))
                        }
                        placeholder="Optional admin comments"
                      />
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          disabled={item.status !== "PENDING"}
                          onClick={() => updateStatus(item.id, "APPROVE")}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={item.status !== "PENDING"}
                          onClick={() => updateStatus(item.id, "REJECT")}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
