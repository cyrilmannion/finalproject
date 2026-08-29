import { useEffect, useState } from "react";
import type { TeeTimeSlot } from "../../../shared/src/types";
import { api } from "../api/client";

// Booking page - replaces the original site's third-party booking links with an
// in-house tee-time booking flow (visitor / society), backed by the Node/Express API.
export function Booking() {
  const [slots, setSlots] = useState<TeeTimeSlot[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    api.getTeeTimes().then(setSlots).catch((err) => setStatus(err.message));
  }, []);

  return (
    <section>
      <h1>Book a Tee Time</h1>
      {status && <p role="alert">{status}</p>}
      <ul>
        {slots.map((slot) => (
          <li key={slot.id}>
            {slot.date} {slot.time} - {slot.available}/{slot.capacity} available
          </li>
        ))}
      </ul>
      {/* TODO: booking form (visitor/society) posting to api.createBooking */}
    </section>
  );
}
