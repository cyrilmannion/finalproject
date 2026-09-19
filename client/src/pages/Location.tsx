import { LocationDirections } from "../components/LocationDirections";

export function Location() {
  return (
    <>
      <section>
        <h1>Location</h1>
        <p className="lead">Driving directions to Stepaside Golf Course from the M50.</p>
      </section>

      <LocationDirections />
    </>
  );
}
