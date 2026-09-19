import type {
  Booking,
  BookingWithSlot,
  CreateBookingRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  TeeTimeSlot,
  WeatherResponse,
} from "../../../shared/src/types";

const BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    // Spread options first, headers last, so a caller-supplied header (e.g. Authorization)
    // merges with Content-Type instead of silently replacing the whole headers object.
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

function authHeader(token?: string | null): HeadersInit | undefined {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export const api = {
  getTeeTimes: () => request<TeeTimeSlot[]>("/tee-times"),
  createBooking: (payload: CreateBookingRequest, token?: string | null) =>
    request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: authHeader(token),
    }),
  login: (payload: LoginRequest) =>
    request<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload: RegisterRequest) =>
    request<LoginResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  getBookings: (token: string) =>
    request<BookingWithSlot[]>("/bookings", { headers: authHeader(token) }),
  getMyBookings: (token: string) =>
    request<BookingWithSlot[]>("/bookings/mine", { headers: authHeader(token) }),
  getWeather: () => request<WeatherResponse>("/weather"),
};
