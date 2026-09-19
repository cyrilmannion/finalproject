import { Link } from "react-router-dom";

// Full-bleed video hero, replacing the static photo strip in CourseBanner.
// Inspired by luttrellstowncastle.com/golf's autoplay hero video - but built to
// avoid the reason that page scores poorly (Section 3.3 of the interim report):
// this is a single self-hosted, heavily compressed clip (~900KB, 1280x720,
// 24fps, no audio, 8s loop) rather than a third-party embed, so it doesn't
// carry the weather-widget/social-feed/ad-pixel weight that drags Luttrellstown's
// Performance score down. `poster` gives the browser something to paint
// immediately, before the video has even started downloading, and
// prefers-reduced-motion swaps the video out for a plain background image via
// CSS (see .hero-video-section in styles.css) for anyone who has that
// accessibility setting on - motion isn't forced on them.
export function HeroVideo() {
  return (
    <section className="hero-video-section full-bleed mb-4">
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      <div className="hero-video-overlay" />

      <div className="hero-video-content">
        <span className="hero-video-logo" aria-hidden="true">
          S
        </span>
        <h1 className="hero-video-title">Stepaside Golf Course</h1>
        <p className="hero-video-tagline">
          A nine-hole public golf course in Kilternan, County Dublin, open since the early 1980s.
        </p>
        <Link to="/booking" className="btn btn-light hero-video-cta text-uppercase">
          Book a Tee Time
        </Link>
      </div>
    </section>
  );
}
