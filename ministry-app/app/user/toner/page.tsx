"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppRequest, STATUS_COLOR, UserPageShell, useRequireUser } from "../_shared";

export default function TonerCrudPage() {
  const { user, loading } = useRequireUser();
  const [items, setItems] = useState<AppRequest[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [description, setDescription] = useState("");
  const [printerSerial, setPrinterSerial] = useState("");
  const [printerModel, setPrinterModel] = useState("");
  const [error, setError] = useState("");

  const loadItems = async () => {
    const response = await fetch("/api/requests?type=TONER", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as AppRequest[];
    setItems(data);
  };

  useEffect(() => {
    const bootstrap = async () => {
      const response = await fetch("/api/requests?type=TONER", { cache: "no-store" });
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
    setPrinterSerial("");
    setPrinterModel("");
    setError("");
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const payload = {
      requestType: "TONER",
      description,
      printerSerial,
      printerModel,
    };

    const response = await fetch(editingId ? `/api/requests/${editingId}` : "/api/requests", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to save toner request.");
      return;
    }

    clearForm();
    await loadItems();
  };

  const onEdit = (item: AppRequest) => {
    setEditingId(item.id);
    setDescription(item.description);
    setPrinterSerial(item.toner?.printerSerial || "");
    setPrinterModel(item.toner?.printerModel || "");
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
    return <main className="loading-screen">Loading toner module...</main>;
  }

  return (
    <UserPageShell user={user} title="Toner Request" subtitle="Create, edit, delete, and track toner requests.">
      <section className="panel">
        <h2>{editingId ? "Edit Toner Request" : "Create Toner Request"}</h2>
        <form className="request-form" onSubmit={onSubmit}>
          <label>
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} required />
          </label>
          <div className="two-cols">
            <label>
              Printer Serial Code
              <input value={printerSerial} onChange={(event) => setPrinterSerial(event.target.value)} required />
            </label>
            <label>
              Printer Model
              <input value={printerModel} onChange={(event) => setPrinterModel(event.target.value)} required />
            </label>
          </div>
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
        <h2>Toner Records</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Serial</th>
                <th>Model</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6}>No toner requests found.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.description}</td>
                    <td>{item.toner?.printerSerial}</td>
                    <td>{item.toner?.printerModel}</td>
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
