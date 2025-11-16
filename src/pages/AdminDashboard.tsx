import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import StatsGrid from "../components/AdminDashboard/StatsGrid";
import UserSearchTable from "../components/AdminDashboard/UserSearchTable";
import Sidebar from "../components/Layout/Sidebar";
import UsersPage from "./admin/UsersPage";
import Slots from "./admin/Slots";
import BookingDetails from "./admin/bookingdetails";
import SlotSettings from "./admin/Settings";
import BookingsChart from "../components/AdminDashboard/BookingsChart";

import { LayoutDashboard, Users, Settings, Timer, Ticket } from "lucide-react";
import { getUsers } from "../api/admindashboard/users";
import axiosInstance from "../api/axiosInstance";

// --- Types ---
interface User {
  id: string;
  name: string;
  email: string;
  totalBookings: number;
  lastBooking: string;
}

interface StatsData {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  revenueByStatus: {
    confirmed: number;
    pending: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    revenueByStatus: { confirmed: 0, pending: 0 },
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const data = await getUsers();
        const mappedUsers: User[] = data.map((u: any) => ({
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
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch bookings stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/bookings/all");
        const bookings: { totalAmount: number; status: string }[] = Array.isArray(
          res.data?.bookings?.bookings
        )
          ? res.data.bookings.bookings
          : [];

        const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
        const confirmedRevenue = bookings
          .filter((b) => b.status === "confirmed")
          .reduce((sum, b) => sum + b.totalAmount, 0);
        const pendingRevenue = bookings
          .filter((b) => b.status !== "confirmed")
          .reduce((sum, b) => sum + b.totalAmount, 0);

        setStats({
          totalUsers: users.length,
          totalBookings: bookings.length,
          totalRevenue,
          revenueByStatus: { confirmed: confirmedRevenue, pending: pendingRevenue },
        });
      } catch (err) {
        console.error("Failed to fetch booking stats:", err);
      }
    };
    fetchStats();
  }, [users]);

  const handleSearch = (query: string) => {
    console.log("Searching:", query);
  };

  return (
    <Sidebar
      brand="AdminPanel"
      footerText="© 2025 Soccerzone"
      navItems={[
        { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admindashboard" },
        { label: "Users", icon: <Users size={18} />, path: "/admindashboard/users" },
        { label: "Slots", icon: <Timer size={18} />, path: "/admindashboard/slots" },
        { label: "Bookings", icon: <Ticket size={18} />, path: "/admindashboard/booking-details" },
        { label: "Settings", icon: <Settings size={18} />, path: "/admindashboard/settings" },
      ]}
    >
      <div className="w-full p-2 sm:p-4 md:p-6">
        <Routes>
          <Route
            index
            element={
              <div className="flex flex-col gap-6">
                {/* Stats Cards */}
                <StatsGrid data={stats} />

                {/* Bookings Chart */}
                <div className="w-full overflow-x-auto">
                  <BookingsChart /> {/* Should now use live data */}
                </div>

                {/* User Table */}
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold mt-4 mb-2">User Management</h2>
                  <UserSearchTable users={users} onSearch={handleSearch} />
                  {loadingUsers && <p className="text-gray-500 mt-2">Loading users...</p>}
                </div>
              </div>
            }
          />
          <Route path="users" element={<UsersPage />} />
          <Route path="slots" element={<Slots />} />
          <Route path="booking-details" element={<BookingDetails />} />
          <Route path="settings" element={<SlotSettings />} />
        </Routes>
      </div>
    </Sidebar>
  );
};

export default AdminDashboard;
