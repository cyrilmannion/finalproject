import { Card, Col, Row } from "react-bootstrap";

const NORTHBOUND_STEPS = [
  "Take Exit 15 (Kilternan)",
  "Take 1st Exit at Roundabout",
  "Take 2nd Exit on Next Roundabout",
  "Drive for 1.5km until you reach a T-Junction",
  "Turn right at T-Junction",
  "Drive for 1km",
  "Golf Course Entrance is on your Right",
];

const SOUTHBOUND_STEPS = [
  "Take Exit 15 (Kilternan)",
  "Take 3rd Exit at Roundabout",
  "Take 1st Exit at Next Roundabout",
  "Take 2nd Exit on Next Roundabout",
  "Drive for 1.5km until you reach a T-Junction",
  "Turn Right at T-Junction",
  "Drive for 1km",
  "Golf Course Entrance is on your Right",
];

// The club's own "View Larger Map" link uses an old (~2011-era) Google Maps URL
// format (f=q&sll=&cid=...&source=embed). Tested it in a real browser before
// using it: today it redirects into modern Google Maps but drops the actual
// place - no "Stepaside Golf Course" pin or place card, just a generic, roughly
// nearby area map. Using the same modern, working Google Maps link format the
// rest of the site already relies on instead (see LocationMap.tsx and
// GoogleReviewsBadge.tsx).
const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Stepaside+Golf+Course+Enniskerry+Road+Kilternan+Co.+Dublin";

function DirectionsList({ title, steps }: { title: string; steps: string[] }) {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <Card.Title as="h3" className="h5">
          {title}
        </Card.Title>
        <ol className="mb-0 ps-3">
          {steps.map((step, index) => (
            <li key={index} className="mb-1">
              {step}
            </li>
          ))}
        </ol>
      </Card.Body>
    </Card>
  );
}

export function LocationDirections() {
  return (
    <section className="mt-4">
      <Row className="g-4">
        <Col md={6}>
          <DirectionsList title="From M50 Northbound" steps={NORTHBOUND_STEPS} />
        </Col>
        <Col md={6}>
          <DirectionsList title="From M50 Southbound" steps={SOUTHBOUND_STEPS} />
        </Col>
      </Row>

      <div className="text-center mt-4">
        <a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer" className="btn btn-outline-primary">
          View Larger Map
        </a>
      </div>
    </section>
  );
}
