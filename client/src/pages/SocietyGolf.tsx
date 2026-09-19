import { Societies } from "../components/Societies";

// Distinct from the "Society" booking type on the Booking page itself, which is
// for a single tee-time booking rather than these recurring weekly societies.
export function SocietyGolf() {
  return (
    <>
      <section>
        <h1>Society Golf</h1>
        <p className="lead">
          Stepaside is home to five weekly ladies golf societies, each playing a friendly,
          competitive round on their own day of the week.
        </p>
      </section>

      <Societies />
    </>
  );
}
