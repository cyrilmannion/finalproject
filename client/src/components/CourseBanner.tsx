import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

// Replicates the reference banner's structure: a plain white utility bar (logo
// mark + stacked wordmark, a link on the right) sitting directly above a photo
// strip. Sized to the same Container width as the rest of the page's content
// (not full-bleed) - a low-resolution source photo stretched to the full monitor
// width looked visibly pixelated, and constraining it to the text column shrinks
// it enough that the softness isn't obvious. "BACK TO CLUB WEBSITE" doesn't apply
// here - this site *is* the club website - so that spot became a "Book a Tee
// Time" CTA instead, matching what the reference's own hero image already
// invites visitors to do.
export function CourseBanner() {
  return (
    <Container as="section" className="course-banner mb-4">
      <div className="d-flex justify-content-between align-items-center py-2 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="course-banner-logo" aria-hidden="true">
            S
          </span>
          <h1 className="course-banner-wordmark mb-0">
            Stepaside
            <br />
            Golf Course
          </h1>
        </div>
        <Link to="/booking" className="course-banner-cta text-uppercase text-decoration-none">
          Book a Tee Time
        </Link>
      </div>

      <img
        src="/images/course-banner.jpg"
        alt="A view across the green at Stepaside Golf Course"
        className="course-banner-photo"
      />
    </Container>
  );
}
