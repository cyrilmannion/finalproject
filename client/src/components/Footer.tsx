import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

// Matches the header nav exactly - same six sections, same order (Home, About
// Us, Our Societies, Green Fees, Location, Contact Us) - per the real site's own
// nav pattern. "Book a Tee Time" stays a dedicated CTA button in the header
// rather than an Info link, and The Course is linked from the About Us page
// instead of listed here, same as the header nav.
const infoLinks = [
  { to: "/", label: "Home" },
  { to: "/about-us", label: "About Us" },
  { to: "/our-societies", label: "Our Societies" },
  { to: "/green-fees", label: "Green Fees" },
  { to: "/location", label: "Location" },
  { to: "/contact-us", label: "Contact Us" },
];

// Real accounts for the actual Stepaside Golf Course / dlr Leisure Services.
const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/stepasidegolf/" },
  { label: "Instagram", href: "https://www.instagram.com/stepasidegolfcentre/" },
];

export function Footer() {
  return (
    <footer className="bg-dark text-light mt-5 pt-5 pb-4">
      <Container fluid className="px-3 px-lg-4">
        <Row className="gy-4">
          <Col xs={12} md={4}>
            <h6 className="text-uppercase border-bottom border-secondary pb-2 mb-3">
              Contact Us
            </h6>
            <p className="small mb-1">
              Enniskerry Road,
              <br />
              Kilternan, Co. Dublin, D18 XN84
            </p>
            <p className="small mb-1">T: +353 (0)1 295 2859</p>
            <p className="small mb-0">E: info@stepasidegolfcourse.com</p>
          </Col>

          <Col xs={12} md={4}>
            <h6 className="text-uppercase border-bottom border-secondary pb-2 mb-3">Info</h6>
            <ul className="list-unstyled small">
              {infoLinks.map((link) => (
                <li key={link.to} className="mb-2">
                  <Link to={link.to} className="text-light text-decoration-none">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          <Col xs={12} md={4}>
            <h6 className="text-uppercase border-bottom border-secondary pb-2 mb-3">
              Follow Us
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-light btn-sm text-nowrap"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </Col>
        </Row>

        <hr className="border-secondary mt-4" />
        <p className="small text-center text-secondary mb-0">
          &copy; {new Date().getFullYear()} Stepaside Golf Course. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
