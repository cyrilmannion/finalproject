import { Link } from "react-router-dom";
import { AboutUs } from "../components/AboutUs";

export function AboutUsPage() {
  return (
    <>
      <section>
        <h1>About Us</h1>
      </section>

      <AboutUs />

      <section className="mt-4 text-center">
        <Link to="/the-course" className="btn btn-primary">
          View our full course scorecard &rarr;
        </Link>
      </section>
    </>
  );
}
