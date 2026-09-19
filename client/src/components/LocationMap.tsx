import { Container } from "react-bootstrap";

// Query-based embed - no Google Maps API key/billing needed, which keeps this
// deployable as-is. Defaults the pin straight to the club's real address.
const ADDRESS = "Stepaside Golf Course, Enniskerry Road, Kilternan, Co. Dublin, Ireland";
const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`;

export function LocationMap() {
  return (
    <section className="mt-5">
      <Container className="text-center mb-4">
        <p className="text-uppercase text-muted small border-bottom d-inline-block pb-1 mb-3">
          Where We Are
        </p>
        <h2 className="mb-3">How to Find Stepaside Golf Course</h2>
        <p className="text-muted mx-auto" style={{ maxWidth: "640px" }}>
          Stepaside Golf Course sits in the Dublin foothills at Kilternan, just off the M50,
          making it an easy trip from Dublin city centre and the surrounding suburbs.
        </p>
      </Container>

      <div className="ratio ratio-21x9 full-bleed">
        <iframe
          title="Map showing the location of Stepaside Golf Course"
          src={MAP_SRC}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0 }}
          allowFullScreen
        />
      </div>
    </section>
  );
}
