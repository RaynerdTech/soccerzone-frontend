import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import StatsGrid from "../components/AdminDashboard/StatsGrid";
import UserSearchTable from "../components/AdminDashboard/UserSearchTable";
import Sidebar from "../components/Layout/Sidebar"; // ✅ import reusable sidebar
import UsersPage from "./admin/UsersPage";
import Slots from "./admin/Slots";
import BookingDetails from "./admin/bookingdetails"; // ✅ 1. Import your new component

import {
  LayoutDashboard,
  Users,
  Settings,
  Timer,
  Ticket, // ✅ 2. Import the Ticket icon
} from "lucide-react";
import { getUsers } from "../api/admindashboard/users";

// --- Types ---
interface User {
  id: string;
  name: string;
  email: string;
  totalBookings: number;
  lastBooking: string;
}

// --- Dummy Stats Data (can fetch from API later) ---
const dummyStats = {
  totalUsers: 14,
  totalBookings: 39,
  totalRevenue: 1620000,
  revenueByStatus: {
    confirmed: 1000000,
    pending: 620000,
  },
};

// --- Main Admin Dashboard Component ---
const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch users from API on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getUsers();
        const mappedUsers = data.map((u: any) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          totalBookings: u.totalBookings || 0,
          lastBooking: u.lastBooking || "",
        }));
        setUsers(mappedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (query: string) => {
    console.log("Searching:", query);
  };

  const handleEditBooking = (userId: string) => {
    console.log("Editing booking for user:", userId);
  };

  return (
    <Sidebar
      brand="AdminPanel"
      footerText="© 2025 Soccerzone"
      navItems={[
        {
          label: "Dashboard",
          icon: <LayoutDashboard size={18} />,
          path: "/admindashboard",
        },
        { label: "Users", icon: <Users size={18} />, path: "/admindashboard/users" },
        { label: "Slots", icon: <Timer size={18} />, path: "/admindashboard/slots" },
        // ✅ 3. Update the "Ticket" nav item to use the new path and icon
        {
          label: "Bookings",
          icon: <Ticket size={18} />,
          path: "/admindashboard/booking-details",
        },
        {
          label: "Settings",
          icon: <Settings size={18} />,
          path: "/admindashboard/settings",
        },
      ]}
    >
      {/* ✅ Nested routes inside Sidebar layout */}
      <Routes>
        {/* --- Dashboard Home --- */}
        <Route
          index
          element={
            <div className="p-2">
              {/* Stats Cards */}
              <StatsGrid data={dummyStats} />

              {/* User Table */}
              <h2 className="text-xl font-bold mt-6 mb-4">User Management</h2>
              <UserSearchTable
                users={users}
                onSearch={handleSearch}
             
              />

              {loading && (
                <p className="text-gray-500 mt-4">Loading users...</p>
              )}
            </div>
          }
        />

        {/* --- Users Page --- */}
        <Route path="users" element={<UsersPage />} />

        {/* --- Calendar Placeholder --- */}
        <Route path="slots" element={<Slots />} />

        {/* ✅ 4. Add the new Route for your booking details page */}
        <Route path="booking-details" element={<BookingDetails />} />

        {/* --- Settings Placeholder --- */}
        <Route
          path="settings"
          element={<div className="p-6">⚙️ Settings Page</div>}
        />
      </Routes>
    </Sidebar>
  );
};

export default AdminDashboard;