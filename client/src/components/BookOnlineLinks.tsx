import { Card } from "react-bootstrap";

// Shared by the Green Fees and Contact Us pages - same two real BRS Golf booking
// links (confirmed reachable before use), so this only needs to live in one place.
const BOOKING_LINKS = [
  { label: "Visitors", href: "http://www.brsgolf.com/stepaside/visitor_home.php" },
  { label: "Societies", href: "http://www.brsgolf.com/stepaside/golf_event.php" },
];

export function BookOnlineLinks() {
  return (
    <Card className="bg-light border-0">
      <Card.Body className="text-center">
        <Card.Title as="h2" className="h5 text-uppercase mb-3">
          Book Online
        </Card.Title>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          {BOOKING_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              {link.label}
            </a>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
