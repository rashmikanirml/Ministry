"use client";

import { useEffect, useState } from "react";
import { AppRequest, STATUS_COLOR, UserPageShell, useRequireUser } from "../_shared";

export default function UserAllRequestsPage() {
  const { user, loading } = useRequireUser();
  const [requests, setRequests] = useState<AppRequest[]>([]);
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const loadRequests = async (nextType = type, nextStatus = status, nextSearch = search) => {
    const params = new URLSearchParams();
    if (nextType !== "ALL") {
      params.set("type", nextType);
    }
    if (nextStatus !== "ALL") {
      params.set("status", nextStatus);
    }
    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
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
      const response = await fetch("/api/requests", { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as AppRequest[];
      setRequests(data);
    };

    bootstrap();
  }, []);

  if (loading || !user) {
    return <main className="loading-screen">Loading dashboard...</main>;
  }

  return (
    <UserPageShell user={user} title="All Requests Dashboard" subtitle="View, filter, and track every request you have submitted.">
      <section className="panel">
        <h2>Filters</h2>
        <div className="three-cols">
          <label>
            Request Type
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
            Search
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Description"
            />
          </label>
        </div>
        <button type="button" onClick={() => loadRequests()}>
          Apply Filters
        </button>
      </section>

      <section className="panel">
        <h2>Request Records</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Details</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Admin Comments</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7}>No requests found.</td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.requestType}</td>
                    <td>{item.description}</td>
                    <td>
                      {item.toner ? `Serial: ${item.toner.printerSerial} | Model: ${item.toner.printerModel}` : ""}
                      {item.multimedia
                        ? `${item.multimedia.equipmentType} | ${new Date(item.multimedia.dateTime).toLocaleString()}`
                        : ""}
                      {item.repair
                        ? `${item.repair.computerSerial} | ${item.repair.priority}`
                        : ""}
                    </td>
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
    </UserPageShell>
  );
}
