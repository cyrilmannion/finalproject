import { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

interface LoginRedirectState {
  from?: string;
  message?: string;
}

// Shared login for both Admin and Member accounts - which one you get back determines
// where you land and what you can see (see App.tsx's role-based redirect/nav). Can also
// be reached via RequireAuth (e.g. an anonymous visitor clicking "Book a Tee Time"), which
// passes along the page they were headed to plus a reason - shown above the form and used
// to send them straight back after a successful login instead of the usual role default.
export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectState = (location.state ?? {}) as LoginRedirectState;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token, user } = await api.login({ email, password });
      login(token, user);
      navigate(redirectState.from || (user.role === "Admin" ? "/admin" : "/account"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h1 className="mb-4">Log In</h1>
      {redirectState.message && (
        <Alert variant="info" style={{ maxWidth: 360 }}>
          {redirectState.message}
        </Alert>
      )}
      <Card body style={{ maxWidth: 360 }}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </Form.Group>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </Button>
          {error && (
            <Alert variant="danger" className="mt-3 mb-0">
              {error}
            </Alert>
          )}
        </Form>
      </Card>
      <p className="mt-3">
        Not a member yet? <Link to="/register">Create an account</Link>
      </p>
    </section>
  );
}
