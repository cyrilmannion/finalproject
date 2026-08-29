import type {
  Booking,
  CreateBookingRequest,
  LoginRequest,
  LoginResponse,
  TeeTimeSlot,
} from "../../../shared/src/types";

const BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getTeeTimes: () => request<TeeTimeSlot[]>("/tee-times"),
  createBooking: (payload: CreateBookingRequest) =>
    request<Booking>("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: LoginRequest) =>
    request<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
};
