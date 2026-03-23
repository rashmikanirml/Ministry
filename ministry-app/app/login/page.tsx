"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SessionUser = {
  id: number;
  name: string;
  username: string;
  role: "USER" | "ADMIN";
  division: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setSessionUser(null);
        return;
      }
      const data = (await response.json()) as { authenticated: boolean; user: SessionUser };
      if (data.authenticated) {
        setSessionUser(data.user);
      }
    };

    bootstrap();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Login failed.");
      return;
    }

    const user = data.user as SessionUser;
    router.replace(user.role === "ADMIN" ? "/admin" : "/user");
  };

  const switchAccount = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSessionUser(null);
    setUsername("");
    setPassword("");
    setError("");
  };

  if (sessionUser) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <p className="auth-eyebrow">Current Session</p>
          <h1>You are already signed in</h1>
          <p className="auth-subtitle">
            User: <strong>{sessionUser.username}</strong> | Role: <strong>{sessionUser.role}</strong>
          </p>
          <div className="action-row" style={{ marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() => router.replace(sessionUser.role === "ADMIN" ? "/admin" : "/user")}
            >
              Continue to Dashboard
            </button>
            <button type="button" className="muted-btn" onClick={switchAccount}>
              Switch Account
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="auth-eyebrow">Ministry Resource Request Management System</p>
        <h1>MRRMS Portal Login</h1>
        <p className="auth-subtitle">
          Sign in with your staff credentials to submit and track resource requests.
        </p>

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin or staff"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="admin123 or user123"
              required
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="auth-help">
          <p>Seed accounts:</p>
          <p>Admin: admin / admin123</p>
          <p>User: staff / user123</p>
        </div>
      </section>
    </main>
  );
}
