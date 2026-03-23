"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [division, setDivision] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password, division }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Registration failed.");
      return;
    }

    router.replace("/login");
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="auth-eyebrow">MRRMS Registration</p>
        <h1>Create Staff Account</h1>
        <p className="auth-subtitle">Register a new staff user account to request ministry resources.</p>

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Full Name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} required />
          </label>
          <label>
            Division
            <input value={division} onChange={(event) => setDivision(event.target.value)} required />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="auth-help">
          <p>
            Already registered? <Link href="/login">Go to Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
