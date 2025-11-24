


import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import BookingsChart from "../components/AdminDashboard/BookingsChart";
import StatsGrid from "../components/AdminDashboard/StatsGrid";
import UserSearchTable from "../components/AdminDashboard/UserSearchTable";
import Sidebar from "../components/Layout/Sidebar";
import BookingDetails from "./admin/bookingdetails";
import SlotSettings from "./admin/Settings";
import Slots from "./admin/Slots";
import UsersPage from "./admin/UsersPage";

import { LayoutDashboard, Settings, Ticket, Timer, Users } from "lucide-react";
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

interface BookingItem {
  totalAmount: number;
  status: string;
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

  // Get logged-in admin role
  const token = localStorage.getItem("token");
  let role: string | null = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      role = payload.role;
    } catch (err) {
      console.error("Failed to decode JWT token", err);
    }
  }

  const isSuperAdmin = role === "super-admin";

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

  // Fetch booking stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/bookings/all");
        const bookings: BookingItem[] = Array.isArray(res.data?.bookings?.bookings)
          ? res.data.bookings.bookings
          : [];

        const totalRevenue = bookings.reduce((sum: number, b: BookingItem) => sum + b.totalAmount, 0);

        setStats({
          totalUsers: users.length,
          totalBookings: bookings.length,
          totalRevenue,
          revenueByStatus: {
            confirmed: bookings
              .filter((b: BookingItem) => b.status === "confirmed")
              .reduce((sum: number, b: BookingItem) => sum + b.totalAmount, 0),
            pending: bookings
              .filter((b: BookingItem) => b.status !== "confirmed")
              .reduce((sum: number, b: BookingItem) => sum + b.totalAmount, 0),
          },
        });
      } catch (err) {
        console.error("Failed to fetch booking stats:", err);
      }
    };
    fetchStats();
  }, [users]);

  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admindashboard" },
    { label: "Users", icon: <Users size={18} />, path: "/admindashboard/users" },
    { label: "Slots", icon: <Timer size={18} />, path: "/admindashboard/slots" },
    { label: "Bookings", icon: <Ticket size={18} />, path: "/admindashboard/booking-details" },
    { label: "Settings", icon: <Settings size={18} />, path: "/admindashboard/settings" }, // always shown in sidebar
  ];

  return (
    <Sidebar brand="AdminPanel" footerText="© 2025 Soccerzone" navItems={navItems}>
      <div className="w-full p-2 sm:p-4 md:p-6">
        <Routes>
          <Route
            index
            element={
              <div className="flex flex-col gap-6">
                <StatsGrid data={stats} />
                <div className="w-full overflow-x-auto">
                  <BookingsChart />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold mt-4 mb-2">User Management</h2>
                  <UserSearchTable users={users} onSearch={() => {}} />
                  {loadingUsers && <p className="text-gray-500">Loading users...</p>}
                </div>
              </div>
            }
          />

          <Route path="users" element={<UsersPage />} />
          <Route path="slots" element={<Slots />} />
          <Route path="booking-details" element={<BookingDetails />} />

          {/* Super Admin Protected Route */}
          <Route
            path="settings"
            element={
              isSuperAdmin ? (
                <SlotSettings />
              ) : (
                <div className="text-center text-red-600 text-lg font-semibold mt-20">
                  Super admin only
                </div>
              )
            }
          />

          <Route path="*" element={<Navigate to="/admindashboard" replace />} />
        </Routes>
      </div>
    </Sidebar>
  );
};

export default AdminDashboard;

