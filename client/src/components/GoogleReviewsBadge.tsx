import { Card } from "react-bootstrap";

// Google's documented "search" URL scheme - no API key needed, just opens the
// club's real Google Maps listing in a new tab.
const GOOGLE_MAPS_SEARCH_URL =
  "https://www.google.com/maps/search/?api=1&query=Stepaside+Golf+Course+Kilternan+Co.+Dublin";

// Snapshot from the club's Google Business listing (as of the screenshot Cyril
// shared) - not a live feed. Pulling live ratings/review text needs the Google
// Places API, which needs a Google Cloud project + API key (and billing) that
// only the account owner can set up. Update these two numbers by hand every so
// often, or swap this component for a real fetch later without touching the rest
// of the page - it's a self-contained drop-in.
const RATING = 4.0;
const REVIEW_COUNT = 273;

function Stars({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= Math.round(rating) ? "#fbbc04" : "#d9d9d9" }}>
        &#9733;
      </span>
    );
  }
  return <span style={{ fontSize: "1.25rem", letterSpacing: "1px" }}>{stars}</span>;
}

export function GoogleReviewsBadge() {
  return (
    <Card className="text-center shadow">
      <Card.Body>
                <div className="text-muted small text-uppercase mb-2">Reviews</div>
                <div className="d-flex justify-content-center align-items-center gap-2 mb-1">
                  <span className="fs-3 fw-semibold">{RATING.toFixed(1)}</span>
                  <Stars rating={RATING} />
                </div>
                <p className="text-muted small mb-3">{REVIEW_COUNT} Google reviews</p>
                <a
                  href={GOOGLE_MAPS_SEARCH_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  Read reviews on Google
                </a>
      </Card.Body>
    </Card>
  );
}
