"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppRequest, STATUS_COLOR, UserPageShell, useRequireUser } from "../_shared";

export default function RepairCrudPage() {
  const { user, loading } = useRequireUser();
  const [items, setItems] = useState<AppRequest[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [description, setDescription] = useState("");
  const [computerSerial, setComputerSerial] = useState("");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [error, setError] = useState("");

  const loadItems = async () => {
    const response = await fetch("/api/requests?type=REPAIR", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as AppRequest[];
    setItems(data);
  };

  useEffect(() => {
    const bootstrap = async () => {
      const response = await fetch("/api/requests?type=REPAIR", { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as AppRequest[];
      setItems(data);
    };

    bootstrap();
  }, []);

  const clearForm = () => {
    setEditingId(null);
    setDescription("");
    setComputerSerial("");
    setIssue("");
    setPriority("MEDIUM");
    setError("");
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const payload = {
      requestType: "REPAIR",
      description,
      computerSerial,
      issue,
      priority,
    };

    const response = await fetch(editingId ? `/api/requests/${editingId}` : "/api/requests", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to save repair request.");
      return;
    }

    clearForm();
    await loadItems();
  };

  const onEdit = (item: AppRequest) => {
    setEditingId(item.id);
    setDescription(item.description);
    setComputerSerial(item.repair?.computerSerial || "");
    setIssue(item.repair?.issue || "");
    setPriority(item.repair?.priority || "MEDIUM");
  };

  const onDelete = async (id: number) => {
    const response = await fetch(`/api/requests/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Delete failed.");
      return;
    }
    await loadItems();
  };

  if (loading || !user) {
    return <main className="loading-screen">Loading repair module...</main>;
  }

  return (
    <UserPageShell user={user} title="Repair Request CRUD" subtitle="Create, edit, delete, and track repair requests.">
      <section className="panel">
        <h2>{editingId ? "Edit Repair Request" : "Create Repair Request"}</h2>
        <form className="request-form" onSubmit={onSubmit}>
          <label>
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} required />
          </label>
          <div className="two-cols">
            <label>
              Computer ID / Serial
              <input value={computerSerial} onChange={(event) => setComputerSerial(event.target.value)} required />
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
          </div>
          <label>
            Issue Description
            <textarea value={issue} onChange={(event) => setIssue(event.target.value)} required />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <div className="action-row">
            <button type="submit">{editingId ? "Update" : "Create"}</button>
            {editingId ? (
              <button type="button" className="muted-btn" onClick={clearForm}>
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Repair Records</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Computer</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6}>No repair requests found.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.description}</td>
                    <td>{item.repair?.computerSerial}</td>
                    <td>{item.repair?.priority}</td>
                    <td>
                      <span className={STATUS_COLOR[item.status]}>{item.status}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button type="button" disabled={item.status !== "PENDING"} onClick={() => onEdit(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={item.status !== "PENDING"}
                          onClick={() => onDelete(item.id)}
                        >
                          Delete
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
    </UserPageShell>
  );
}
