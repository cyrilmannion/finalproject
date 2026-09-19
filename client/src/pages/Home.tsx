import { Link } from "react-router-dom";
import { HeroVideo } from "../components/HeroVideo";
import { LocationMap } from "../components/LocationMap";
import { WidgetDock } from "../components/WidgetDock";

// Home page - carries over the welcome/history content from the original site.
// The full "About Us" text now lives on its own page (matching the real site's
// nav), so this just teases it. Weather and Google reviews live behind the
// WidgetDock's icons rather than as full-width cards in the page flow.
//
// The static CourseBanner photo strip was replaced with HeroVideo (see that
// component for the rationale) - CourseBanner.tsx is left in place, unused,
// rather than deleted, in case a lower-motion fallback is wanted later.
export function Home() {
  return (
    <>
      <WidgetDock />
      <HeroVideo />

      <section className="mt-4 text-center">
        <Link to="/about-us" className="btn btn-primary">
          Learn more about us &rarr;
        </Link>
      </section>

      <LocationMap />
    </>
  );
}
