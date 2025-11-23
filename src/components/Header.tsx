import { Menu, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthModal from "../pages/Signup";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Bookings", path: "/bookings" },
];

// Helper function to decode JWT safely
const parseJwt = (token: string | null) => {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (error) {
    console.error("Invalid token format");
    return null;
  }
};

// Get user role from token payload
const getUserRole = (): string | null => {
  const token = localStorage.getItem("token");
  const payload = parseJwt(token);
  return payload?.role || null;
};

const Header: React.FC = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const SCROLL_THRESHOLD = 20;

  // ✅ Check for token and set user role
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = getUserRole();
    setHasToken(!!token);
    setRole(userRole);
  }, []);

  // ✅ Detect scroll to apply header blur/background
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Prevent body scroll when menu or modal is open
  useEffect(() => {
    document.body.style.overflow = menuOpen || showAuth ? "hidden" : "unset";
  }, [menuOpen, showAuth]);

  // ✅ Handle main button (Dashboard or Signup)
  const handleButtonClick = () => {
    if (hasToken) {
      if (role === "admin" || role === "super-admin") {
        navigate("/admindashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      setShowAuth(true);
    }
  };

  // ✅ Optional logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    setHasToken(false);
    setRole(null);
    navigate("/");
  };

  // === Dynamic Classes ===
  const headerScrolled = isScrolled || menuOpen;
  const headerBgClass = headerScrolled
    ? "bg-white/90 backdrop-blur-md shadow-lg"
    : "bg-transparent";
  const textColorClass = headerScrolled ? "text-gray-900" : "text-black";
  const buttonClasses =
    "bg-green-600 text-white px-6 py-2.5 font-medium rounded-full transition-all duration-300 hover:bg-green-700 hover:scale-105 hover:shadow-md";

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${headerBgClass}`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-20">
          {/* === Logo === */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/soccer_zone.webp"
              alt="SoccerZone Logo"
              className="h-20 w-auto object-contain cursor-pointer"
            />
          </Link>

          {/* === Desktop Navigation === */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative font-medium group transition-colors duration-300 ${textColorClass} hover:text-green-500`}
              >
                {item.name}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* === Desktop Buttons === */}
          <div className="hidden md:flex items-center space-x-4">
            {hasToken ? (
              <>
                <button onClick={handleButtonClick} className={buttonClasses}>
                  {role === "admin" || role === "super-admin"
                    ? "Admin Dashboard"
                    : "Dashboard"}
                </button>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-500 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <button onClick={handleButtonClick} className={buttonClasses}>
                Login
              </button>
            )}
          </div>

          {/* === Mobile Menu Button === */}
          <button
            className={`md:hidden relative z-[60] transition-colors duration-300 ${textColorClass}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* === Mobile Menu Overlay === */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-white flex flex-col items-center justify-center transition-opacity duration-300 ease-in-out
          ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        <nav className="flex flex-col items-center text-center space-y-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-2xl font-semibold text-gray-800 hover:text-green-600 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          <button
            onClick={() => {
              setMenuOpen(false);
              handleButtonClick();
            }}
            className={`${buttonClasses} text-lg px-8 py-3`}
          >
            {hasToken
              ? role === "admin" || role === "super-admin"
                ? "Admin Dashboard"
                : "Dashboard"
              : "Login"}
          </button>

          {hasToken && (
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="text-red-600 font-medium text-lg mt-4"
            >
              Logout
            </button>
          )}
        </nav>
      </div>

      {/* === Auth Modal === */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
};

export default Header;
