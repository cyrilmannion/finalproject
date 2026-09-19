import { useEffect, useState } from "react";
import { Alert, Button, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import type { BookingWithSlot } from "../../../shared/src/types";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

// Member's own bookings - only ones made while logged in (see optionalAuth on the
// server's POST /api/bookings) show up here, via GET /api/bookings/mine.
export function Account() {
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load(currentToken: string) {
    setLoading(true);
    setError(null);
    api
      .getMyBookings(currentToken)
      .then(setBookings)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load bookings"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (token) {
      load(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <Alert variant="secondary">
        <Link to="/login">Log in</Link> to see your bookings.
      </Alert>
    );
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">My Bookings</h1>
        <Button variant="outline-secondary" size="sm" onClick={() => load(token)}>
          Refresh
        </Button>
      </div>
      <p className="text-muted">Logged in as {user?.email}</p>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <Spinner animation="border" size="sm" role="status" />
      ) : bookings.length === 0 ? (
        <Alert variant="secondary">
          You have no bookings yet - <Link to="/booking">book a tee time</Link> to see it here.
        </Alert>
      ) : (
        <Table striped bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Party</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.date}</td>
                <td>{booking.time}</td>
                <td>{booking.type}</td>
                <td>{booking.partySize}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </section>
  );
}
