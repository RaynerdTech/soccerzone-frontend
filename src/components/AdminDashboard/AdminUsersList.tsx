// components/AdminDashboard/AdminUsersList.tsx
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Edit as EditIcon,
  Eye,
  Loader2,
  Search as SearchIcon,
  X
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

/* ----------------------- Types ----------------------- */
interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  totalBookings?: number;
  lastBooking?: string;
  totalAmount?: number;
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
  paymentRef?: string;
  ticketId?: string | null;
  createdAt: string;
}

interface DetailedUserPayload {
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role?: string;
    createdAt?: string;
  };
  bookings?: Booking[];
  summary?: {
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    totalAmount: number;
    firstBookingDate?: string;
    lastBookingDate?: string;
  };
}

/* ----------------------- Helpers ----------------------- */
const Spinner = () => <Loader2 size={16} className="animate-spin text-gray-500" />;

const getAuthToken = () =>
  localStorage.getItem("adminToken") || localStorage.getItem("token") || "";

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString();
};

/* ----------------------- Component ----------------------- */
const AdminUsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof User>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // View Modal state
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [viewingLoading, setViewingLoading] = useState(false);
  const [viewingError, setViewingError] = useState<string | null>(null);
  const [viewingPayload, setViewingPayload] = useState<DetailedUserPayload | null>(null);

  // Edit Modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // form fields for edit
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editPassword, setEditPassword] = useState("");

  /* ----------------------- Fetch Users ----------------------- */
  const fetchUsers = async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No token found. Please login as admin.");

      const res = await fetch("https://soccerzone-backend.onrender.com/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized. Please login again.");
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Failed to fetch users");
      }
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ----------------------- Search + Sort ----------------------- */
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = users.filter((u) =>
      `${u.name || ""} ${u.email || ""}`.toLowerCase().includes(q)
    );
    return filtered.sort((a, b) => {
      const A = (a[sortBy] ?? "") as any;
      const B = (b[sortBy] ?? "") as any;
      if (typeof A === "string" && typeof B === "string") {
        return sortOrder === "asc" ? A.localeCompare(B) : B.localeCompare(A);
      }
      if (typeof A === "number" && typeof B === "number") {
        return sortOrder === "asc" ? A - B : B - A;
      }
      return 0;
    });
  }, [users, search, sortBy, sortOrder]);

  const handleSort = (key: keyof User) => {
    if (sortBy === key) setSortOrder((s) => (s === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  /* ----------------------- View User ----------------------- */
  const openViewModal = async (userId: string) => {
    setViewingUserId(userId);
    setViewingLoading(true);
    setViewingError(null);
    setViewingPayload(null);

    try {
      const token = getAuthToken();
      if (!token) throw new Error("No token found.");

      const res = await fetch(`https://soccerzone-backend.onrender.com/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Failed to load user details");
      }

      const payload: DetailedUserPayload = await res.json();
      setViewingPayload(payload);
    } catch (err: any) {
      console.error("View user error:", err);
      setViewingError(err.message || "Failed to load user details");
    } finally {
      setViewingLoading(false);
    }
  };

  const closeViewModal = () => {
    setViewingUserId(null);
    setViewingLoading(false);
    setViewingError(null);
    setViewingPayload(null);
  };

  /* ----------------------- Edit User ----------------------- */
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditPhone(user.phone || "");
    setEditAvatar(user.avatar || "");
    setEditPassword("");
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditError(null);
    setEditPassword("");
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setEditSaving(true);
    setEditError(null);

    try {
      const token = getAuthToken();
      if (!token) throw new Error("No token found.");

      const payload: any = {
        name: editName,
        email: editEmail,
        phone: editPhone,
        avatar: editAvatar,
      };
      if (editPassword) payload.password = editPassword;

      const res = await fetch(
        `https://soccerzone-backend.onrender.com/api/users/profile/${editingUser._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Failed to update user");
      }

      setEditSuccess(true);
      setTimeout(() => setEditSuccess(false), 3000);
      closeEditModal();
      await fetchUsers();
    } catch (err: any) {
      console.error("Edit save failed:", err);
      setEditError(err.message || "Failed to save user");
    } finally {
      setEditSaving(false);
    }
  };

  /* ----------------------- Render ----------------------- */
  return (
    <div className="p-0">
      {/* Header: Search + Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border shadow-sm w-full sm:max-w-md">
          <SearchIcon className="text-gray-400" />
          <input
            className="w-full outline-none"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="ml-auto flex items-center gap-4 text-sm text-gray-600">
          <div>
            <strong>{filteredUsers.length}</strong> shown
          </div>
          <div className="hidden sm:block">
            {loadingUsers ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Loading
              </span>
            ) : (
              <span>All users loaded</span>
            )}
          </div>
        </div>
      </div>

      {/* Desktop header row */}
      <div className="hidden md:grid md:grid-cols-[2fr_3fr_1fr_1fr_80px] gap-4 px-4 py-3 bg-gray-50 border rounded-t-md">
        <div className="cursor-pointer text-sm font-medium text-gray-700" onClick={() => handleSort("name")}>
          Name {sortBy === "name" && (sortOrder === "asc" ? "▲" : "▼")}
        </div>
        <div className="cursor-pointer text-sm font-medium text-gray-700" onClick={() => handleSort("email")}>
          Email {sortBy === "email" && (sortOrder === "asc" ? "▲" : "▼")}
        </div>
        <div className="cursor-pointer text-sm font-medium text-gray-700" onClick={() => handleSort("totalBookings")}>
          Bookings {sortBy === "totalBookings" && (sortOrder === "asc" ? "▲" : "▼")}
        </div>
        <div className="text-sm font-medium text-gray-700">Last Booking</div>
        <div className="text-right text-sm font-medium text-gray-700">Actions</div>
      </div>

      {/* Users grid/list (scrollable) */}
      <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto">
        {filteredUsers.length === 0 && !loadingUsers ? (
          <div className="text-center py-12 text-gray-500">
            {search ? "No users match your search." : "No users found."}
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div key={u._id} className="border rounded-md bg-white overflow-hidden">
              {/* Mobile card */}
              <div className="md:hidden p-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar || "https://via.placeholder.com/48"}
                    alt={u.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{u.name}</div>
                    <div className="text-sm text-gray-500 truncate">{u.email}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Bookings: <strong className="text-gray-900">{u.totalBookings ?? 0}</strong>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button className="p-2 rounded-md text-emerald-600 hover:bg-emerald-50" onClick={() => openViewModal(u._id)} title="View user history">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 rounded-md text-slate-700 hover:bg-slate-50" onClick={() => openEditModal(u)} title="Edit user">
                    <EditIcon size={18} />
                  </button>
                </div>
              </div>

              {/* Desktop row */}
              <div className="hidden md:grid md:grid-cols-[2fr_3fr_1fr_1fr_80px] items-center gap-4 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={u.avatar || "https://via.placeholder.com/40"}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{u.name}</div>
                    <div className="text-sm text-gray-500 truncate">{u.email}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 truncate">{u.email}</div>
                <div className="text-sm text-gray-900">{u.totalBookings ?? 0}</div>
                <div className="text-sm text-gray-600">{u.lastBooking ? formatDate(u.lastBooking) : "—"}</div>
                <div className="flex justify-end items-center gap-2">
                  <button className="p-2 rounded-md text-emerald-600 hover:bg-emerald-50" onClick={() => openViewModal(u._id)} title="View user history">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 rounded-md text-slate-700 hover:bg-slate-50" onClick={() => openEditModal(u)} title="Edit user">
                    <EditIcon size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* global error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <div>{error}</div>
        </div>
      )}

      {/* ----------------------- View Modal ----------------------- */}
      <AnimatePresence>
        {viewingUserId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={closeViewModal}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="bg-white w-full max-w-3xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-lg font-semibold">{viewingPayload?.user?.name ?? "User details"}</h3>
                  <p className="text-sm text-gray-500">{viewingPayload?.user?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded hover:bg-gray-100" onClick={closeViewModal} title="Close">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Body scrollable */}
              <div className="p-4 overflow-y-auto flex-1">
                {viewingLoading ? (
                  <div className="py-16 flex flex-col items-center gap-3">
                    <Spinner />
                    <div className="text-sm text-gray-500">Loading details...</div>
                  </div>
                ) : viewingError ? (
                  <div className="py-8 text-center text-red-600">{viewingError}</div>
                ) : viewingPayload ? (
                  <>
                    {/* User info */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Role:</span> {viewingPayload.user.role || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Created:</span> {formatDate(viewingPayload.user.createdAt)}
                      </div>
                    </div>

                    {/* Summary */}
                    {viewingPayload.summary && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-xs text-gray-500">Total bookings</p>
                          <p className="font-semibold text-lg">{viewingPayload.summary.totalBookings}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-xs text-gray-500">Confirmed</p>
                          <p className="font-semibold text-lg text-green-700">{viewingPayload.summary.confirmedBookings}</p>
                        </div>
                        <div className="bg-amber-50 p-3 rounded">
                          <p className="text-xs text-gray-500">Pending</p>
                          <p className="font-semibold text-lg text-amber-700">{viewingPayload.summary.pendingBookings}</p>
                        </div>
                      </div>
                    )}

                    {/* Bookings list (scrollable) */}
                    <div className="max-h-[60vh] overflow-y-auto">
                      {viewingPayload.bookings && viewingPayload.bookings.length > 0 ? (
                        <div className="space-y-3">
                          {viewingPayload.bookings.map((b) => (
                            <div key={b.id} className="border rounded p-3 hover:bg-gray-50 transition">
                              <p className="text-sm font-medium">Booking ID: {b.bookingId}</p>
                              <p className="text-xs text-gray-500">Status: {b.status}</p>
                              <p className="text-xs text-gray-500">Total amount: ${b.totalAmount}</p>
                              <p className="text-xs text-gray-500">Slot count: {b.slotCount}</p>
                              <p className="text-xs text-gray-500">
                                Dates: {b.dates.join(", ")}
                              </p>
                              <p className="text-xs text-gray-500">
                                Time: {b.startTimes.join(", ")} - {b.endTimes.join(", ")}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-6">
                          No bookings found.
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------- Edit Modal ----------------------- */}
<AnimatePresence>
  {editingUser && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-md rounded-lg p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold mb-4">Edit User</h2>

        {/* Error */}
        {editError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-3">
            {editError}
          </div>
        )}

        {/* Success */}
        {editSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded mb-3">
            User updated successfully!
          </div>
        )}

        {/* Form fields */}
        <div className="flex flex-col gap-3">
          <input
            className="border px-3 py-2 rounded"
            placeholder="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <input
            className="border px-3 py-2 rounded"
            placeholder="Email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />
          <input
            className="border px-3 py-2 rounded"
            placeholder="Phone"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
          />
          <input
            className="border px-3 py-2 rounded"
            placeholder="Avatar URL"
            value={editAvatar}
            onChange={(e) => setEditAvatar(e.target.value)}
          />
          <input
            className="border px-3 py-2 rounded"
            placeholder="New Password (optional)"
            type="password"
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            className="px-4 py-2 rounded bg-gray-200"
            onClick={closeEditModal}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-emerald-600 text-white"
            onClick={handleSaveEdit}
            disabled={editSaving}
          >
            {editSaving ? <Loader2 className="animate-spin w-4 h-4" /> : "Save"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
};

export default AdminUsersList;
