import { useEffect, useRef, useState } from "react";
import { GoogleReviewsBadge } from "./GoogleReviewsBadge";
import { WeatherWidget } from "./WeatherWidget";

// Small fixed icon dock on the left edge of the viewport - click an icon to pop
// its widget out beside it, click again (or elsewhere) to close it. Replaces the
// weather/reviews cards that used to sit full-width in the homepage flow; this
// mirrors the collapsed search/cloud/blog icon stack on luttrellstowncastle.com's
// golf site, which keeps the same info available without taking up page space.
type WidgetKey = "weather" | "reviews";

const ITEMS: { key: WidgetKey; icon: string; label: string }[] = [
  { key: "weather", icon: "☁️", label: "Weather" },
  { key: "reviews", icon: "⭐", label: "Reviews" },
];

export function WidgetDock() {
  const [active, setActive] = useState<WidgetKey | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  // Close the open popout on an outside click, same as any other popover.
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setActive(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(key: WidgetKey) {
    setActive((current) => (current === key ? null : key));
  }

  return (
    <div className="widget-dock" ref={dockRef}>
      {ITEMS.map((item) => (
        <div key={item.key} className="widget-dock-item">
          <button
            type="button"
            className="widget-dock-icon"
            aria-label={item.label}
            aria-expanded={active === item.key}
            onClick={() => toggle(item.key)}
          >
            {item.icon}
          </button>

          {active === item.key && (
            <div className="widget-dock-popout">
              <button
                type="button"
                className="widget-dock-close"
                aria-label={`Close ${item.label}`}
                onClick={() => setActive(null)}
              >
                &times;
              </button>
              {item.key === "weather" ? <WeatherWidget /> : <GoogleReviewsBadge />}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
