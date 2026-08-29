import { useState } from "react";
import { api } from "../api/client";

// Admin page - login issues a JWT (Admin role) used to manage tee-time slots,
// mirroring the JWT auth pattern from the Research folder's Books API assignment.
export function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { token } = await api.login({ email, password });
      setToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  if (token) {
    return <p>Logged in. TODO: tee-time management UI (create/edit/delete slots).</p>;
  }

  return (
    <section>
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit">Log in</button>
      </form>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
