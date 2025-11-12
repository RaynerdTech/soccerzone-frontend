import React, { useState } from "react";
import {
  X,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    identifier: "", // For email or phone login
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const url = isLogin
      ? "https://soccerzone-backend.onrender.com/api/auth/login"
      : "https://soccerzone-backend.onrender.com/api/auth/register";

    // Updated body to handle 'identifier' for login
    const body = isLogin
      ? { identifier: form.identifier, password: form.password }
      : {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setMessage(
        isLogin
          ? "Login successful! Redirecting..."
          : "Registration successful! You can now log in."
      );

      //Decode the token to get the payload
      function parseJwt(token: string) {
        try {
          return JSON.parse(atob(token.split(".")[1]));
        } catch (e) {
          return null;
        }
      }

      if (isLogin && data.token) {
        localStorage.setItem("token", data.token);

        const payload = parseJwt(data.token);

        if (payload?.role === "admin" || payload?.role === "super-admin") {
          window.location.href = "/admindashboard";
        } else {
          window.location.href = "/dashboard";
        }
      } else if (!isLogin) {
        // If registration is successful, switch to login view
        setIsLogin(true);
        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          identifier: form.email, // Pre-fill login with registered email
        });
      }
    } catch (err: any) {
      setMessage(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage("");
    setShowPassword(false);
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      identifier: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border border-gray-100 transition-all duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-green-600 mb-2 flex items-center justify-center space-x-2">
            {isLogin ? (
              <LogIn className="w-8 h-8" />
            ) : (
              <UserPlus className="w-8 h-8" />
            )}
            <span>{isLogin ? "Welcome Back" : "Join SoccerZone"}</span>
          </h2>
          <p className="text-gray-500 text-sm">
            {isLogin
              ? "Log in to access your account"
              : "Create an account to get started"}
          </p>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-xl text-center font-medium ${
              message.includes("successful")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              {/* Registration Fields */}
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
            </>
          )}

          {isLogin && (
            <>
              {/* Login Field */}
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="identifier"
                  placeholder="Email or Phone Number"
                  value={form.identifier}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-11 focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
            </>
          )}

          {/* Shared Password Field */}
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-11 pr-12 focus:ring-2 focus:ring-green-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={toggleMode}
            className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-all duration-200"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
