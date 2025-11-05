import React, { useState } from "react";
import { Search, Eye, Edit, Calendar, X } from "lucide-react";
import { getUserById } from "../../api/admindashboard/users";

// --- Types ---
interface User {
  id: string;
  name: string;
  email: string;
  totalBookings: number;
  lastBooking: string;
}

interface Booking {
  id: string;
  bookingId: string;
  status: string;
  totalAmount: number;
  slotCount: number;
  dates: string[];
  startTimes: string[];
  endTimes: string[];
  paymentVerified: boolean;
  paymentRef: string;
  ticketId: string | null;
  createdAt: string;
}

interface UserSummary {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalAmount: number;
  firstBookingDate: string;
  lastBookingDate: string;
}

interface DetailedUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: string;
}

interface UserSearchTableProps {
  users: User[];
  onSearch: (query: string) => void;
  onEditBooking: (userId: string) => void;
}

const UserSearchTable: React.FC<UserSearchTableProps> = ({
  users,
  onSearch,
  onEditBooking,
}) => {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof User>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedUser, setSelectedUser] = useState<DetailedUser | null>(null);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  // ↕️ Sorting logic
  const handleSort = (key: keyof User) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  // Sort users
  const sortedUsers = [...users].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
    return 0;
  });

  // 👁️ Fetch user details
  const handleViewUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserById(userId);
      if (data) {
        setSelectedUser(data.user);
        setSummary(data.summary || null);
        setBookings(data.bookings || []);
      } else {
        setError("No user data found.");
      }
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      setError("Failed to fetch user details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Close modal
  const handleCloseModal = () => {
    setSelectedUser(null);
    setSummary(null);
    setBookings([]);
    setError(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 🔍 Search Header */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search by Ticket ID, Email, or Name..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* 📋 Users Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] max-w-full">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {[
                { key: "name", label: "User Name" },
                { key: "email", label: "Email" },
                { key: "totalBookings", label: "Total Bookings" },
                { key: "lastBooking", label: "Last Booking" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key as keyof User)}
                  className="px-4 py-3 text-left font-medium cursor-pointer hover:text-emerald-600 select-none"
                >
                  {label}
                  {sortBy === key && (
                    <span className="ml-1 text-emerald-600">
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="overflow-y-auto">
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition-all"
                >
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.totalBookings}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {user.lastBooking
                      ? new Date(user.lastBooking).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    {/* View */}
                    <button
                      onClick={() => handleViewUser(user.id)}
                      className="p-2 rounded-md text-emerald-600 hover:bg-emerald-50 transition"
                      title="View User"
                    >
                      <Eye size={16} />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEditBooking(user.id)}
                      className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition"
                      title="Edit Booking"
                    >
                      <Edit size={16} />
                    </button>

                    {/* Book Slot */}
                    <button
                      onClick={() => console.log('Book slot for', user.name)}
                      className="p-2 rounded-md text-amber-600 hover:bg-amber-50 transition"
                      title="Book Slot"
                    >
                      <Calendar size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500 italic">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🧩 User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 relative overflow-y-auto max-h-[90vh] animate-fadeIn">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>

            {loading ? (
              <div className="text-center text-gray-500 py-6">
                Loading user details...
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-6">{error}</div>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-2">
                  {selectedUser.name}
                </h2>
                <p className="text-sm text-gray-600 mb-1">
                  Email: {selectedUser.email}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Role: {selectedUser.role || "N/A"}
                </p>

                {summary && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="font-medium mb-2">Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>Total Bookings: {summary.totalBookings}</p>
                      <p>Confirmed: {summary.confirmedBookings}</p>
                      <p>Pending: {summary.pendingBookings}</p>
                      <p>Total Amount: ₦{summary.totalAmount.toLocaleString()}</p>
                      <p>
                        First Booking:{" "}
                        {new Date(summary.firstBookingDate).toLocaleDateString()}
                      </p>
                      <p>
                        Last Booking:{" "}
                        {new Date(summary.lastBookingDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {bookings.length > 0 && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="font-medium mb-2">Bookings</h3>
                    <ul className="space-y-2 text-sm">
                      {bookings.map((b) => (
                        <li
                          key={b.id}
                          className="border rounded-lg p-3 hover:bg-gray-50 transition"
                        >
                          <p>Booking ID: {b.bookingId}</p>
                          <p>Status: {b.status}</p>
                          <p>Amount: ₦{b.totalAmount.toLocaleString()}</p>
                          <p>
                            Slots: {b.slotCount} | Dates: {b.dates.join(", ")}
                          </p>
                          <p>
                            Times: {b.startTimes.join(" - ")} /{" "}
                            {b.endTimes.join(" - ")}
                          </p>
                          <p>
                            Payment Verified: {b.paymentVerified ? "Yes" : "No"}
                          </p>
                          {b.ticketId && <p>Ticket ID: {b.ticketId}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearchTable;
