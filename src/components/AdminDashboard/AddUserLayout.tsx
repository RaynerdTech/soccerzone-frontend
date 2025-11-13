import React, { useState } from "react";
import axios from "axios";
import { UserPlus, X, Mail, Phone, Lock, User } from "lucide-react";

interface AddUserLayoutProps {
  onUserAdded?: () => void;
}

const AddUserLayout: React.FC<AddUserLayoutProps> = ({ onUserAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("⚠️ You must be logged in as an admin to perform this action.");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        "https://soccerzone-backend.onrender.com/api/users",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("✅ User added successfully!");
      setForm({ name: "", email: "", phone: "", password: "", role: "user" });
      onUserAdded?.();
      setTimeout(() => setIsOpen(false), 1000);
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        "❌ Something went wrong. Only admins can add users.";
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Add User Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
      >
        <UserPlus className="inline w-5 h-5 mr-2" />
        Add User
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border border-gray-100 transition-all duration-300">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-green-600 mb-2 flex items-center justify-center space-x-2">
                <UserPlus className="w-8 h-8" />
                <span>Add New User</span>
              </h2>
              <p className="text-gray-500 text-sm">
                Fill in the user details below to create a new account.
              </p>
            </div>

            {message && (
              <div
                className={`mb-4 p-3 rounded-xl text-center font-medium ${
                  message.includes("success")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-11 focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-11 focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-11 focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-11 focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 transition-all"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add User"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddUserLayout;
