import React, { useState } from "react";
import { Search, Eye, X, Loader2 } from "lucide-react";
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
}

const Spinner = () => (
  <Loader2 size={16} className="animate-spin text-gray-500" />
);

// --- Date Formatting Helper ---
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
};

const UserSearchTable: React.FC<UserSearchTableProps> = ({
  users,
  onSearch,
}) => {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof User>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<DetailedUser | null>(null);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    // Notify parent component, in case it wants to do server-side search/logging
    onSearch(value);
  };

  const handleSort = (key: keyof User) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  // --- 1. NEW FILTERING LOGIC ---
  // Filter the users based on the local 'query' state
  const filteredUsers = users.filter((user) => {
    const lowerCaseQuery = query.toLowerCase();
    // Check against name and email. Placeholder also mentions Ticket ID,
    // but it's not in the User type. If you add it, include it here.
    return (
      user.name.toLowerCase().includes(lowerCaseQuery) ||
      user.email.toLowerCase().includes(lowerCaseQuery)
    );
  });

  // --- 2. UPDATE SORTING LOGIC ---
  // Sort the *filtered* list, not the full 'users' list
  const sortedUsers = [...filteredUsers].sort((a, b) => {
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

  // --- More robust modal logic from previous fix ---
  const handleViewUser = async (userId: string) => {
    setLoadingUserId(userId);
    setLoadingModal(true);
    setIsModalOpen(true);
    setError(null);
    setSelectedUser(null);
    setSummary(null);
    setBookings([]);

    try {
      const data = await getUserById(userId);
      if (data) {
        const fetchedBookings = data.bookings || [];
        let fetchedSummary = data.summary || null;

        if (fetchedBookings.length > 0) {
          const sortedByDate = [...fetchedBookings].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          const firstBookingDate = sortedByDate[0].createdAt;
          const lastBookingDate = sortedByDate[sortedByDate.length - 1].createdAt;

          if (!fetchedSummary) {
            fetchedSummary = {
              totalBookings: fetchedBookings.length,
              confirmedBookings: fetchedBookings.filter(
                (b: Booking) => b.status === "CONFIRMED"
              ).length,
              pendingBookings: fetchedBookings.filter(
                (b: Booking) => b.status === "PENDING"
              ).length,
              totalAmount: Array.isArray(fetchedBookings)
                ? fetchedBookings.reduce((acc, b) => acc + b.totalAmount, 0)
                : 0,
              firstBookingDate: firstBookingDate,
              lastBookingDate: lastBookingDate,
            };
          } else {
            fetchedSummary.lastBookingDate = lastBookingDate;
            fetchedSummary.firstBookingDate = firstBookingDate;
          }
        }
        setSelectedUser(data.user);
        setSummary(fetchedSummary);
        setBookings(fetchedBookings);
      } else {
        setError("No user data found.");
      }
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      setError("Failed to fetch user details. Please try again.");
    } finally {
      setLoadingUserId(null);
      setLoadingModal(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
      setSummary(null);
      setBookings([]);
      setError(null);
    }, 300);
  };

  return (
    <>
      <style>{`
        @keyframes subtleFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-subtle-fade-in {
          animation: subtleFadeIn 0.2s ease-out;
        }
      `}</style>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder="Search by Email or Name..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* User List Container */}
        <div className="max-h-[70vh] overflow-y-auto">
          {/* Desktop Header Row */}
          <div className="hidden md:grid md:grid-cols-[2fr_3fr_1.2fr_1.5fr_100px] gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100">
            {[
              { key: "name", label: "User Name" },
              { key: "email", label: "Email" },
              { key: "totalBookings", label: "Bookings" },
              { key: "lastBooking", label: "Last Booking" },
            ].map(({ key, label }) => (
              <div
                key={key}
                onClick={() => handleSort(key as keyof User)}
                className="cursor-pointer hover:text-emerald-600 select-none text-sm font-medium text-gray-700 transition-colors"
              >
                {label}
                {sortBy === key && (
                  <span className="ml-1 text-emerald-600">
                    {sortOrder === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </div>
            ))}
            <div className="text-right text-sm font-medium text-gray-700">Actions</div>
          </div>

          {/* User List Body */}
          <div>
            {/* --- 3. Use sortedUsers length check --- */}
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <div key={user.id}>
                  {/* Mobile Card View */}
                  <div className="md:hidden border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="flex-shrink-0 p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="View User"
                          disabled={loadingUserId === user.id}
                        >
                          {loadingUserId === user.id ? (
                            <Spinner />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                        <div>
                          <span className="text-gray-500">Bookings: </span>
                          <span className="font-medium text-gray-900">{user.totalBookings}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Last: </span>
                          <span className="font-medium text-gray-900">
                            {user.lastBooking
                              ? new Date(user.lastBooking).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Table Row */}
                  <div className="hidden md:grid md:grid-cols-[2fr_3fr_1.2fr_1.5fr_100px] gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {user.email}
                    </div>
                    <div className="text-sm text-gray-900">
                      {user.totalBookings}
                    </div>
                    <div className="text-sm text-gray-600">
                      {user.lastBooking
                        ? new Date(user.lastBooking).toLocaleDateString()
                        : "—"}
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="View User"
                        disabled={loadingUserId === user.id}
                      >
                        {loadingUserId === user.id ? (
                          <Spinner />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">
                  {/* Give different message based on why list is empty */}
                  {query ? "No users match your search." : "No users found."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal (with formatting fixes) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-subtle-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate pr-2">
                {selectedUser ? selectedUser.name : "User Details"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="flex-shrink-0 p-1.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              {loadingModal ? (
                <div className="flex flex-col justify-center items-center gap-3 text-gray-500 py-12">
                  <Spinner />
                  <span className="text-sm">Loading user details...</span>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 py-12">
                  <p className="text-sm">{error}</p>
                </div>
              ) : selectedUser ? (
                <>
                  {/* User Info */}
                  <div className="space-y-1 mb-6">
                    <p className="text-sm text-gray-600 break-all">
                      <span className="font-medium">Email:</span> {selectedUser.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Role:</span> {selectedUser.role || "N/A"}
                    </p>
                  </div>

                  {/* Summary Section */}
                  {summary && (
                    <div className="border-t border-gray-100 pt-4 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4 text-base">
                        Summary
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Total Bookings</p>
                          <p className="text-lg font-semibold text-gray-900">{summary.totalBookings}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Confirmed</p>
                          <p className="text-lg font-semibold text-green-700">{summary.confirmedBookings}</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Pending</p>
                          <p className="text-lg font-semibold text-amber-700">{summary.pendingBookings}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                          <p className="text-lg font-semibold text-emerald-700">₦{summary.totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">First Booking</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(summary.firstBookingDate)}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Last Booking</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(summary.lastBookingDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bookings Section */}
                  {bookings.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <h3 className="font-semibold text-gray-900 mb-4 text-base">
                        Bookings ({bookings.length})
                      </h3>
                      <div className="space-y-3">
                        {bookings.map((b) => (
                          <div
                            key={b.id}
                            className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                              <p className="font-medium text-gray-900 text-sm">
                                ID: {b.bookingId}
                              </p>
                              <span
                                className={`self-start sm:self-auto text-xs font-bold px-2.5 py-1 rounded-full ${
                                  b.status === "CONFIRMED"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>
                            <div className="space-y-1.5 text-sm text-gray-600">
                              <p>
                                <span className="font-medium">Amount:</span> ₦{b.totalAmount.toLocaleString()}
                              </p>
                              <p>
                                <span className="font-medium">Slots:</span> {b.slotCount} | <span className="font-medium">Dates:</span> {b.dates.join(", ")}
                              </p>
                              <p className="break-all">
                                <span className="font-medium">Times:</span> {b.startTimes.join(" - ")} / {b.endTimes.join(" - ")}
                              </p>
                              <p>
                                <span className="font-medium">Payment:</span>{" "}
                                <span className={b.paymentVerified ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                  {b.paymentVerified ? "Verified" : "Not Verified"}
                                </span>
                              </p>
                              {b.ticketId && (
                                <p className="break-all">
                                  <span className="font-medium">Ticket ID:</span> {b.ticketId}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 pt-1">
                                <span className="font-medium">Created:</span> {new Date(b.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSearchTable;