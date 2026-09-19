import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Gate for pages that now require a logged-in account (currently just booking - see
// Booking.tsx history for why guest checkout was reversed). Bounces an anonymous visitor
// to /login, carrying the page they were headed to (so Login can send them straight back
// after they sign in) and a message explaining why they landed on the login page.
export function RequireAuth({ children }: { children: ReactElement }) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, message: "You must log in to book a tee time." }}
      />
    );
  }

  return children;
}
