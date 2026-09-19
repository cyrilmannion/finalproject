import { Container, Nav, NavDropdown, Navbar } from "react-bootstrap";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { Account } from "./pages/Account";
import { Admin } from "./pages/Admin";
import { AboutUsPage } from "./pages/AboutUsPage";
import { Booking } from "./pages/Booking";
import { ContactUs } from "./pages/ContactUs";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { GreenFees } from "./pages/GreenFees";
import { Register } from "./pages/Register";
import { SocietyGolf } from "./pages/SocietyGolf";
import { Location } from "./pages/Location";
import { TheCourse } from "./pages/TheCourse";

export function App() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      {/* fluid (not fluid="lg") so the nav uses the full browser width instead of being
          capped at the "lg" breakpoint's fixed container width - that mismatch was why
          six nav items + account controls were being squeezed and wrapping mid-word. */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container fluid className="px-3 px-lg-4">
          <Navbar.Brand as={NavLink} to="/" className="text-nowrap">
            Stepaside Golf Course
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/" end className="text-nowrap">
                Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="/about-us" className="text-nowrap">
                About Us
              </Nav.Link>
              <Nav.Link as={NavLink} to="/our-societies" className="text-nowrap">
                Our Societies
              </Nav.Link>
              <Nav.Link as={NavLink} to="/green-fees" className="text-nowrap">
                Green Fees
              </Nav.Link>
              <Nav.Link as={NavLink} to="/location" className="text-nowrap">
                Location
              </Nav.Link>
              <Nav.Link as={NavLink} to="/contact-us" className="text-nowrap">
                Contact Us
              </Nav.Link>
            </Nav>

            <Nav className="align-items-lg-center">
              {token && user ? (
                // One dropdown instead of separate "My Bookings" / "Admin" / "Log out (email)"
                // items sitting side by side.
                <NavDropdown title={user.name || user.email} id="account-dropdown" align="end">
                  {user.role === "Admin" && (
                    <NavDropdown.Item as={NavLink} to="/admin">
                      Admin
                    </NavDropdown.Item>
                  )}
                  {user.role === "Member" && (
                    <NavDropdown.Item as={NavLink} to="/account">
                      My Bookings
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Log out</NavDropdown.Item>
                </NavDropdown>
              ) : (
                // Register isn't shown separately - the Login page already links to it.
                <Nav.Link as={NavLink} to="/login" className="text-nowrap">
                  Login
                </Nav.Link>
              )}
              {/* Plain Link, not NavLink: this is a persistent call-to-action, not a
                  "current page" tab, so it shouldn't pick up react-router's auto "active"
                  class. It used to - and Bootstrap's ".navbar-dark .navbar-nav .nav-link.active"
                  rule (color: #fff) outranks ".btn-outline-light"'s own active/hover styling
                  on specificity, forcing white text onto the outline button's light active
                  background once you were actually on /booking - i.e. invisible text. */}
              <Nav.Link
                as={Link}
                to="/booking"
                className="btn btn-outline-light text-nowrap ms-lg-3 mt-2 mt-lg-0"
              >
                Book a Tee Time
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container as="main" className="pb-5">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/the-course" element={<TheCourse />} />
          <Route path="/green-fees" element={<GreenFees />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/our-societies" element={<SocietyGolf />} />
          <Route path="/location" element={<Location />} />
          <Route
            path="/booking"
            element={
              <RequireAuth>
                <Booking />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Container>

      <Footer />
    </>
  );
}
