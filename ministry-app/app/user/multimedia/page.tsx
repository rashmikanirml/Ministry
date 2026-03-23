"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppRequest, STATUS_COLOR, UserPageShell, useRequireUser } from "../_shared";

export default function MultimediaCrudPage() {
  const { user, loading } = useRequireUser();
  const [items, setItems] = useState<AppRequest[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [description, setDescription] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [meetingDetails, setMeetingDetails] = useState("");
  const [error, setError] = useState("");

  const loadItems = async () => {
    const response = await fetch("/api/requests?type=MULTIMEDIA", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as AppRequest[];
    setItems(data);
  };

  useEffect(() => {
    const bootstrap = async () => {
      const response = await fetch("/api/requests?type=MULTIMEDIA", { cache: "no-store" });
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
    setEquipmentType("");
    setDateTime("");
    setMeetingDetails("");
    setError("");
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const payload = {
      requestType: "MULTIMEDIA",
      description,
      equipmentType,
      dateTime,
      meetingDetails,
    };

    const response = await fetch(editingId ? `/api/requests/${editingId}` : "/api/requests", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to save multimedia request.");
      return;
    }

    clearForm();
    await loadItems();
  };

  const onEdit = (item: AppRequest) => {
    setEditingId(item.id);
    setDescription(item.description);
    setEquipmentType(item.multimedia?.equipmentType || "");
    setDateTime(item.multimedia?.dateTime ? new Date(item.multimedia.dateTime).toISOString().slice(0, 16) : "");
    setMeetingDetails(item.multimedia?.meetingDetails || "");
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
    return <main className="loading-screen">Loading multimedia module...</main>;
  }

  return (
    <UserPageShell
      user={user}
      title="Multimedia Request"
      subtitle="Create, edit, delete, and track multimedia equipment requests."
    >
      <section className="panel">
        <h2>{editingId ? "Edit Multimedia Request" : "Create Multimedia Request"}</h2>
        <form className="request-form" onSubmit={onSubmit}>
          <label>
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} required />
          </label>
          <div className="two-cols">
            <label>
              Equipment Type
              <input value={equipmentType} onChange={(event) => setEquipmentType(event.target.value)} required />
            </label>
            <label>
              Date & Time Needed
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(event) => setDateTime(event.target.value)}
                required
              />
            </label>
          </div>
          <label>
            Meeting Details
            <textarea value={meetingDetails} onChange={(event) => setMeetingDetails(event.target.value)} required />
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
        <h2>Multimedia Records</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Equipment</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6}>No multimedia requests found.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.description}</td>
                    <td>{item.multimedia?.equipmentType}</td>
                    <td>{item.multimedia?.dateTime ? new Date(item.multimedia.dateTime).toLocaleString() : ""}</td>
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
