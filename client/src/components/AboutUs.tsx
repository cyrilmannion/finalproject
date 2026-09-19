import { Container } from "react-bootstrap";

// Same heading pattern as LocationMap's "Where We Are" section (uppercase label +
// underline, centered h2) so the page reads as one consistent set of sections.
export function AboutUs() {
  return (
    <section className="mt-5">
      <Container className="text-center">
        <p className="text-uppercase text-muted small border-bottom d-inline-block pb-1 mb-3">
          About Us
        </p>
        <h2 className="mb-3">About Stepaside Golf Course</h2>
        <p className="text-start mx-auto" style={{ maxWidth: "720px" }}>
          Stepaside Golf Course is a nine hole public golf course located on the Enniskerry Road in
          Kilternan, Co. Dublin. The course was designed by legendary course designer Eddie Hackett
          and was built and opened for business in the early 1980's. The course is owned by Dun
          Laoghaire/Rathdown County Council and the Green-keeping Staff at Stepaside is from the
          Parks & Landscape Services Department of the Council. They are responsible for the
          maintenance and upkeep of the golf course.
        </p>
      </Container>
    </section>
  );
}
