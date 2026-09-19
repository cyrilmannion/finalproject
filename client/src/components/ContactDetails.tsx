import { Card, Col, Row } from "react-bootstrap";
import { BookOnlineLinks } from "./BookOnlineLinks";

// tel: link needs the full international format to dial correctly - the
// displayed label keeps the local "(01) ..." format as given.
const PHONE_DISPLAY = "(01) 295 2859";
const PHONE_HREF = "tel:+35312952859";
const EMAIL = "info@stepasidegolfcourse.com";

export function ContactDetails() {
  return (
    <>
      <section className="mt-4">
        <BookOnlineLinks />
      </section>

      <section className="mt-4">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title as="h2" className="h5 text-uppercase mb-3">
                  Get in Touch
                </Card.Title>
                <dl className="row mb-0">
                  <dt className="col-sm-3">Address</dt>
                  <dd className="col-sm-9">
                    Stepaside Golf Course
                    <br />
                    Enniskerry Road
                    <br />
                    Kilternan
                    <br />
                    Co. Dublin, D18 XN84
                  </dd>

                  <dt className="col-sm-3">Phone</dt>
                  <dd className="col-sm-9">
                    <a href={PHONE_HREF} className="text-decoration-none">
                      {PHONE_DISPLAY}
                    </a>
                  </dd>

                  <dt className="col-sm-3">Fax</dt>
                  <dd className="col-sm-9">(01) 295 2639</dd>

                  <dt className="col-sm-3">Email</dt>
                  <dd className="col-sm-9 mb-0">
                    <a href={`mailto:${EMAIL}`} className="text-decoration-none">
                      {EMAIL}
                    </a>
                  </dd>
                </dl>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
    </>
  );
}
