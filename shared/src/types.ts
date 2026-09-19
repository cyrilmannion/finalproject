// Shared types between client and server.
// Mirrors the shared-models pattern used by ECommerceCommon in the DBSAdvancedWeb reference repo.

export type UserRole = "Admin" | "Member";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export type BookingType = "Visitor" | "Society";

export interface TeeTimeSlot {
  id: string;
  date: string;       // ISO date, e.g. "2026-09-05"
  time: string;        // "HH:mm"
  capacity: number;
  available: number;
}

export interface Booking {
  id: string;
  teeTimeSlotId: string;
  type: BookingType;
  name: string;
  email: string;
  phone?: string;
  partySize: number;
  createdAt: string;
}

export interface CreateBookingRequest {
  teeTimeSlotId: string;
  type: BookingType;
  name: string;
  email: string;
  phone?: string;
  partySize: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// A booking joined with its tee-time slot's date/time - what the Admin bookings view needs.
export interface BookingWithSlot {
  id: string;
  type: BookingType;
  name: string;
  email: string;
  phone: string | null;
  partySize: number;
  createdAt: string;
  date: string;
  time: string;
}

export interface DailyForecast {
  date: string;         // ISO date, e.g. "2026-09-05"
  code: number;          // WMO weather code
  description: string;
  maxC: number;
  minC: number;
}

export interface WeatherResponse {
  location: string;
  updatedAt: string;     // ISO timestamp of when the server fetched this from Open-Meteo
  current: {
    temperatureC: number;
    humidity: number;
    windSpeedMph: number;
    windDirection: string; // compass point, e.g. "WSW"
    code: number;           // WMO weather code
    description: string;
  };
  daily: DailyForecast[];
}
