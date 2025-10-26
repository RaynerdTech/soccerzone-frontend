import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // npm install lucide-react

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Event", path: "/event" },
];

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const SCROLL_THRESHOLD = 20;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "unset";
  }, [menuOpen]);

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

          {/* === Desktop Nav === */}
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

          {/* === Signup Button (Desktop) === */}
          <div className="hidden md:block">
            <Link to="/signup">
              <button className={buttonClasses}>Signup</button>
            </Link>
          </div>

          {/* === Hamburger Icon (Mobile) === */}
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

          <Link to="/signup" onClick={() => setMenuOpen(false)}>
            <button className={`${buttonClasses} text-lg px-8 py-3`}>
              Signup
            </button>
          </Link>

          <Link to="/login" onClick={() => setMenuOpen(false)}>
            <button className={`${buttonClasses} bg-gray-800 hover:bg-gray-900 text-lg px-8 py-3`}>
              Login
            </button>
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Header;
