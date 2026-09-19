import { Router } from "express";

interface DailyForecast {
  date: string;
  code: number;
  description: string;
  maxC: number;
  minC: number;
}

interface WeatherResponse {
  location: string;
  updatedAt: string;
  current: {
    temperatureC: number;
    humidity: number;
    windSpeedMph: number;
    windDirection: string;
    code: number;
    description: string;
  };
  daily: DailyForecast[];
}

// Enniskerry Road, Kilternan, Co. Dublin - the club's real address (per Wikipedia's
// entry for Kilternan). Overridable via .env if the pin ever needs to move.
const LATITUDE = Number(process.env.WEATHER_LAT) || 53.2356;
const LONGITUDE = Number(process.env.WEATHER_LON) || -6.1934;
const LOCATION_LABEL = "Enniskerry Road, Kilternan, Co. Dublin";

// WMO weather codes -> plain-English condition, per Open-Meteo's documented code table.
const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm, slight hail",
  99: "Thunderstorm, heavy hail",
};

function describe(code: number): string {
  return WEATHER_CODES[code] ?? "Unknown";
}

const COMPASS_POINTS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

function toCompass(degrees: number): string {
  const index = Math.round(degrees / 22.5) % 16;
  return COMPASS_POINTS[index];
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

// Open-Meteo is free and keyless, but still worth caching so a burst of homepage
// visits doesn't turn into a burst of outbound requests for near-identical data.
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
let cache: { fetchedAt: number; payload: WeatherResponse } | null = null;

export const weatherRouter = Router();

weatherRouter.get("/", async (_req, res) => {
  try {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
      return res.json(cache.payload);
    }

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&wind_speed_unit=mph&timezone=Europe%2FDublin&forecast_days=6`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo request failed: ${response.status}`);
    }
    const data = (await response.json()) as OpenMeteoResponse;

    const payload: WeatherResponse = {
      location: LOCATION_LABEL,
      updatedAt: new Date().toISOString(),
      current: {
        temperatureC: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        windSpeedMph: data.current.wind_speed_10m,
        windDirection: toCompass(data.current.wind_direction_10m),
        code: data.current.weather_code,
        description: describe(data.current.weather_code),
      },
      daily: data.daily.time.slice(0, 6).map((date, i) => ({
        date,
        code: data.daily.weather_code[i],
        description: describe(data.daily.weather_code[i]),
        maxC: data.daily.temperature_2m_max[i],
        minC: data.daily.temperature_2m_min[i],
      })),
    };

    cache = { fetchedAt: Date.now(), payload };
    res.json(payload);
  } catch (err) {
    console.error("Weather fetch failed:", err);
    res.status(502).json({ error: "Unable to fetch weather right now." });
  }
});
