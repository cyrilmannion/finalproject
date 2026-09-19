import { Card, Col, Row, Table } from "react-bootstrap";
import { BookOnlineLinks } from "./BookOnlineLinks";

interface RateRow {
  label: string;
  price: string;
}

// Figures as given: 9-hole rates (this is a 9-hole course, per the club's own
// scorecard used elsewhere on the site).
const MIDWEEK_RATES: RateRow[] = [
  { label: "9 Hole Standard", price: "€15" },
  { label: "Senior/Junior", price: "€12" },
];

const WEEKEND_RATES: RateRow[] = [
  { label: "9 Hole Standard", price: "€18" },
  { label: "Bank/Public Holidays", price: "As Above" },
];

function RateTable({ rows }: { rows: RateRow[] }) {
  return (
    <Table borderless size="sm" className="mb-2">
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td>{row.label}</td>
            <td className="text-end fw-semibold">{row.price}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export function GreenFeesRates() {
  return (
    <>
      <section className="mt-4">
        <BookOnlineLinks />
      </section>

      <section className="mt-4">
        <Row className="g-4">
          <Col md={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title as="h3" className="h5">
                  Midweek
                </Card.Title>
                <RateTable rows={MIDWEEK_RATES} />
                <p className="text-muted small mb-0">Concession rates applicable before 6pm only.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title as="h3" className="h5">
                  Weekend
                </Card.Title>
                <RateTable rows={WEEKEND_RATES} />
                <p className="text-muted small mb-0">
                  No concession rates at the weekend or on bank holidays.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
    </>
  );
}
