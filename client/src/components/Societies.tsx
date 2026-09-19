import { Card, Col, Container, Row } from "react-bootstrap";

// Content from the club's own site. The per-society blurb differs only by day/name,
// and the "call to join" line that followed every one of them in the source content
// was dropped here in favour of a single shared contact block below the grid -
// repeating the same phone number five times added nothing.
interface Society {
  day: string;
  name: string;
  description: string;
}

const SOCIETIES: Society[] = [
  {
    day: "Monday",
    name: "Monday Movers Golf Society",
    description:
      "The Monday Movers Ladies Golf Society plays in Stepaside Golf Course on Monday's " +
      "throughout the majority of the year. The society allows members the opportunity to " +
      "play competitively each week in a friendly & social environment.",
  },
  {
    day: "Tuesday",
    name: "Tuesday Ladybirds Golf Society",
    description:
      "The Tuesday Ladybirds Ladies Golf Society plays in Stepaside Golf Course on Tuesday's " +
      "throughout the majority of the year. The society allows members the opportunity to " +
      "play competitively each week in a friendly & social environment.",
  },
  {
    day: "Wednesday",
    name: "Wednesday Falcons Golf Society",
    description:
      "The Wednesday Falcons Ladies Golf Society plays in Stepaside Golf Course on Wednesday's " +
      "throughout the majority of the year. The society allows members the opportunity to " +
      "play competitively each week in a friendly & social environment.",
  },
  {
    day: "Thursday",
    name: "Thursday Squirrels Golf Society",
    description:
      "The Thursday Squirrels Ladies Golf Society plays in Stepaside Golf Course on Thursday's " +
      "throughout the majority of the year. The society allows members the opportunity to " +
      "play competitively each week in a friendly & social environment.",
  },
  {
    day: "Friday",
    name: "Friday Bunnies Golf Society",
    description:
      "The Friday Bunnies Ladies Golf Society plays in Stepaside Golf Course on Friday's " +
      "throughout the majority of the year. The society allows members the opportunity to " +
      "play competitively each week in a friendly & social environment.",
  },
];

// Same phone number as the site footer, in the same format, as a clickable tel: link.
const PHONE_DISPLAY = "+353 (0)1 295 2859";
const PHONE_HREF = "tel:+35312952859";

export function Societies() {
  return (
    <>
      <section className="mt-5">
        <Container>
          <div className="text-center mb-4">
            <p className="text-uppercase text-muted small border-bottom d-inline-block pb-1 mb-3">
              Our Societies
            </p>
            <h2 className="mb-0">Weekly Ladies Golf Societies</h2>
          </div>

          <Row className="g-4">
            {SOCIETIES.map((society) => (
              <Col key={society.day} md={6} lg={4}>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <div className="text-uppercase text-muted small mb-1">{society.day}</div>
                    <Card.Title as="h3" className="h5">
                      {society.name}
                    </Card.Title>
                    <Card.Text className="flex-grow-1">{society.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="mt-5">
        <Container>
          <Card className="text-center bg-light border-0">
            <Card.Body>
              <Card.Title as="h3" className="h5">
                Interested in Joining?
              </Card.Title>
              <Card.Text className="text-muted">
                For details on how to join any of our societies, contact one of our committee
                members.
              </Card.Text>
              <a href={PHONE_HREF} className="btn btn-outline-primary btn-sm">
                Call {PHONE_DISPLAY}
              </a>
            </Card.Body>
          </Card>
        </Container>
      </section>
    </>
  );
}
