"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppRequest, UserPageShell, useRequireUser } from "./_shared";

export default function UserHomePage() {
  const { user, loading } = useRequireUser();
  const [requests, setRequests] = useState<AppRequest[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/requests", { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as AppRequest[];
      setRequests(data);
    };

    load();
  }, []);

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((item) => item.status === "PENDING").length,
      approved: requests.filter((item) => item.status === "APPROVED").length,
      rejected: requests.filter((item) => item.status === "REJECTED").length,
    }),
    [requests]
  );

  if (loading || !user) {
    return <main className="loading-screen">Loading workspace...</main>;
  }

  return (
    <UserPageShell
      user={user}
      title="MRRMS User Dashboard"
      subtitle="Choose a dedicated module for each request type or open full request history."
    >
      <section className="stats-grid">
        <article>
          <p>Total Requests</p>
          <h3>{stats.total}</h3>
        </article>
        <article>
          <p>Pending</p>
          <h3>{stats.pending}</h3>
        </article>
        <article>
          <p>Approved</p>
          <h3>{stats.approved}</h3>
        </article>
      </section>

      <section className="card-grid">
        <Link href="/user/toner" className="module-card">
          <h3>Toner CRUD</h3>
          <p>Create, update, delete, and review toner requests.</p>
        </Link>
        <Link href="/user/multimedia" className="module-card">
          <h3>Multimedia CRUD</h3>
          <p>Manage multimedia equipment requests for meetings.</p>
        </Link>
        <Link href="/user/repair" className="module-card">
          <h3>Repair CRUD</h3>
          <p>Track computer repair tickets and priority levels.</p>
        </Link>
        <Link href="/user/requests" className="module-card">
          <h3>All Requests Dashboard</h3>
          <p>Filter and search your complete request history.</p>
        </Link>
      </section>

      <section className="panel">
        <h2>Quick Summary</h2>
        <p>
          Approved: {stats.approved} | Rejected: {stats.rejected}
        </p>
      </section>
    </UserPageShell>
  );
}
