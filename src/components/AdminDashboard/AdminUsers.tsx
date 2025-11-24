// AdminUsers.tsx
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Edit } from "lucide-react";
import React, { useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  totalBookings?: number;
  totalAmount?: number;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://soccerzone-backend.onrender.com/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || "");
    setAvatar(user.avatar || "");
    setPassword("");
    setError("");
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setError("");
    try {
      const body = {
        name,
        email,
        phone,
        avatar,
        ...(password ? { password } : {}),
      };
      const res = await fetch(
        `https://soccerzone-backend.onrender.com/api/users/profile/${selectedUser._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        let msg = "Update failed";
        try {
          const errData = await res.json();
          msg = errData?.message || msg;
        } catch {}
        throw new Error(msg);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to save user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-screen p-8 bg-gray-50">
      <h2 className="text-3xl font-bold mb-6">Users Management</h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {loading
          ? "Loading users..."
          : users.map((user) => (
              <div
                key={user._id}
                className="bg-white border rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md cursor-pointer transition"
                onClick={() => selectUser(user)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || "https://via.placeholder.com/40"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Edit className="w-5 h-5 text-gray-400" />
              </div>
            ))}
      </div>

      {/* Edit form */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white border rounded-lg p-6 shadow-lg max-w-md mx-auto"
          >
            <h3 className="text-xl font-semibold mb-4">Edit User</h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Avatar URL"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="password"
                placeholder="New Password (optional)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded bg-green-600 text-white font-semibold ${
                  saving ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded border text-gray-700"
              >
                Cancel
              </button>
            </div>

            {/* success */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-3 flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded"
                >
                  <CheckCircle2 className="w-5 h-5" /> User updated successfully
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AdminUsers;
