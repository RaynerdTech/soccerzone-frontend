import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import Bookings from "./pages/Bookings";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";
import Success from "./pages/payments/booking/Success";

//  Wrapper component that controls header/footer visibility
const AppContent = () => {
  const location = useLocation();

  //  Define routes where Header/Footer should be hidden
  const hideHeaderPaths = ["/admindashboard"];

  // ✅ Check if current path starts with any of these routes
  const hideHeader = hideHeaderPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="flex flex-col m-h-screen">
      {/* Conditionally render Header */}
      {!hideHeader && <Header />}

      <main className={`flex-1 ${!hideHeader ? "pt-20" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<Signup isOpen={true} onClose={() => {}} />} />
          <Route path="/payments/booking/success" element={<Success />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/*  Admin Dashboard (no Header/Footer) */}
          <Route
            path="/admindashboard/*"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/*  Conditionally render Footer */}
      {!hideHeader && <Footer />}
    </div>
  );
};

// Main App wrapper
const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
