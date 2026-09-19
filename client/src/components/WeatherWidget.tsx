import { useEffect, useState } from "react";
import { Card, Col, Row, Spinner } from "react-bootstrap";
import { api } from "../api/client";
import type { WeatherResponse } from "../../../shared/src/types";

// Client-side mirror of the server's WMO-code table, just for picking an emoji -
// the actual description text comes from the server response.
const WEATHER_ICONS: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌦️",
  56: "🌦️",
  57: "🌦️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  66: "🌧️",
  67: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "🌨️",
  77: "🌨️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  85: "🌨️",
  86: "🌨️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

function iconFor(code: number): string {
  return WEATHER_ICONS[code] ?? "🌡️";
}

function dayLabel(dateStr: string, index: number): string {
  if (index === 0) return "Today";
  // Append T00:00:00 so this parses as local time, not UTC midnight (which can
  // roll back a day depending on the browser's timezone offset).
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-IE", { weekday: "short" }).toUpperCase();
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    api
      .getWeather()
      .then(setWeather)
      .catch(() => setError("Weather is unavailable right now."));
  }, []);

  // Local time ticks over every minute - no need for second-level precision here.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const localTime = now.toLocaleTimeString("en-IE", { hour: "numeric", minute: "2-digit" });

  return (
    <Card className="weather-widget text-white border-0 shadow">
      <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-uppercase small">Local Time</span>
                  <span className="fw-semibold">{localTime}</span>
                </div>

                {error && <p className="mb-0 small">{error}</p>}

                {!error && !weather && (
                  <div className="d-flex align-items-center gap-2">
                    <Spinner animation="border" size="sm" />
                    <span className="small">Loading weather for Stepaside...</span>
                  </div>
                )}

                {weather && (
                  <>
                    <Row className="align-items-center mb-3 gy-2">
                      <Col xs="auto">
                        <span style={{ fontSize: "2rem" }}>{iconFor(weather.current.code)}</span>
                      </Col>
                      <Col xs="auto">
                        <div style={{ fontSize: "2rem", lineHeight: 1 }}>
                          {Math.round(weather.current.temperatureC)}&deg;
                        </div>
                      </Col>
                      <Col>
                        <div className="text-uppercase small">{weather.current.description}</div>
                        <div className="small">Humidity: {weather.current.humidity}%</div>
                        <div className="small">
                          Wind: {Math.round(weather.current.windSpeedMph)}mph{" "}
                          {weather.current.windDirection}
                        </div>
                      </Col>
                    </Row>

                    <Row className="g-2 text-center">
                      {weather.daily.slice(0, 4).map((day, index) => (
                        <Col key={day.date} xs={3}>
                          <div className="small text-uppercase mb-1">{dayLabel(day.date, index)}</div>
                          <div>{iconFor(day.code)}</div>
                          <div className="small">
                            {Math.round(day.maxC)}&deg; / {Math.round(day.minC)}&deg;
                          </div>
                        </Col>
                      ))}
                    </Row>

                    <p className="small text-white-50 mt-3 mb-0">{weather.location}</p>
                  </>
                )}
      </Card.Body>
    </Card>
  );
}
