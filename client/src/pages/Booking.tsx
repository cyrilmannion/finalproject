import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import type { BookingType, TeeTimeSlot } from "../../../shared/src/types";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

// Booking page - replaces the original site's third-party booking links with an
// in-house tee-time booking flow: pick a date, pick a time slot from that day's
// grid (mirroring the Roscommon GC reference layout), then fill in details.
export function Booking() {
  const { token, user } = useAuth();
  const [slots, setSlots] = useState<TeeTimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [type, setType] = useState<BookingType>("Visitor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(1);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  function loadSlots() {
    setLoading(true);
    api
      .getTeeTimes()
      .then((data) => {
        setSlots(data);
        setLoadError(null);
        // Default to the earliest available date the first time slots load.
        setSelectedDate((current) => current || data[0]?.date || "");
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load tee times"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If a member is logged in, prefill their name/email and default the booking type to
  // "Member" - all still editable in case they're booking on behalf of someone else (e.g. a
  // visitor or a society). An Admin isn't assumed to be booking for themselves, so their
  // default stays "Visitor".
  useEffect(() => {
    if (user?.name) {
      setName((current) => current || user.name);
    }
    if (user?.email) {
      setEmail((current) => current || user.email);
    }
    if (user?.role === "Member") {
      setType((current) => (current === "Visitor" ? "Member" : current));
    }
  }, [user]);

  const availableDates = useMemo(
    () => Array.from(new Set(slots.map((slot) => slot.date))).sort(),
    [slots]
  );
  const minDate = availableDates[0];
  const maxDate = availableDates[availableDates.length - 1];

  const slotsForDate = useMemo(
    () => slots.filter((slot) => slot.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time)),
    [slots, selectedDate]
  );

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);

  function handlePickTime(slotId: string) {
    setSelectedSlotId(slotId);
    setConfirmation(null);
    setSubmitError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setConfirmation(null);

    if (!selectedSlotId) {
      setSubmitError("Please choose a tee time.");
      return;
    }
    if (selectedSlot && partySize > selectedSlot.capacity) {
      setSubmitError(`This tee time allows a maximum of ${selectedSlot.capacity} players.`);
      return;
    }

    setSubmitting(true);
    try {
      const booking = await api.createBooking(
        {
          teeTimeSlotId: selectedSlotId,
          type,
          name,
          email,
          phone: phone || undefined,
          partySize,
        },
        token
      );
      setConfirmation(
        `Booked! ${booking.partySize} ${booking.partySize === 1 ? "player" : "players"} confirmed for ` +
          `${selectedSlot?.date} at ${selectedSlot?.time}.`
      );
      setName("");
      setEmail("");
      setPhone("");
      setPartySize(1);
      setSelectedSlotId("");
      loadSlots(); // refresh availability now that a slot has been taken
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h1 className="mb-4">Book a Tee Time</h1>

      {loadError && <Alert variant="danger">{loadError}</Alert>}

      <Form.Group className="mb-4" controlId="booking-date" style={{ maxWidth: 260 }}>
        <Form.Label>Date</Form.Label>
        <Form.Control
          type="date"
          value={selectedDate}
          min={minDate}
          max={maxDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedSlotId("");
          }}
          disabled={loading || availableDates.length === 0}
        />
      </Form.Group>

      {loading ? (
        <Spinner animation="border" size="sm" role="status" />
      ) : slotsForDate.length === 0 ? (
        <Alert variant="secondary">No tee times available on this date - try another day.</Alert>
      ) : (
        <Row xs={3} sm={4} md={5} className="g-2 mb-4">
          {slotsForDate.map((slot) => (
            <Col key={slot.id}>
              <Button
                variant={slot.id === selectedSlotId ? "primary" : "outline-primary"}
                className="w-100"
                disabled={slot.available <= 0}
                onClick={() => handlePickTime(slot.id)}
              >
                {slot.time}
              </Button>
            </Col>
          ))}
        </Row>
      )}

      {selectedSlot && (
        <Card body className="mb-4" style={{ maxWidth: 480 }}>
          <Form onSubmit={handleSubmit}>
            <p className="fw-semibold">
              {selectedSlot.date} at {selectedSlot.time} - up to {selectedSlot.capacity} players
            </p>

            <Form.Group className="mb-3">
              <Form.Label>Booking type</Form.Label>
              <div>
                {user?.role === "Member" && (
                  <Form.Check
                    inline
                    type="radio"
                    name="type"
                    id="type-member"
                    label="Member"
                    checked={type === "Member"}
                    onChange={() => setType("Member")}
                  />
                )}
                <Form.Check
                  inline
                  type="radio"
                  name="type"
                  id="type-visitor"
                  label="Visitor"
                  checked={type === "Visitor"}
                  onChange={() => setType("Visitor")}
                />
                <Form.Check
                  inline
                  type="radio"
                  name="type"
                  id="type-society"
                  label="Society"
                  checked={type === "Society"}
                  onChange={() => setType("Society")}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone (optional)</Form.Label>
              <Form.Control type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3" style={{ maxWidth: 160 }}>
              <Form.Label>Party size</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={selectedSlot.capacity}
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                required
              />
            </Form.Group>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Booking..." : "Book tee time"}
            </Button>

            {submitError && (
              <Alert variant="danger" className="mt-3 mb-0">
                {submitError}
              </Alert>
            )}
            {confirmation && (
              <Alert variant="success" className="mt-3 mb-0">
                {confirmation}
              </Alert>
            )}
          </Form>
        </Card>
      )}
    </section>
  );
}
