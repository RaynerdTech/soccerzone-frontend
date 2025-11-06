import React, { useEffect, useState, useMemo } from "react";
import BookingCard from "../components/BookingCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { 
  DollarSign, 
  Hash, 
  Clock, 
  LogOut, 
  User, 
  Mail, 
  Phone,
  Calendar,
  TrendingUp
} from "lucide-react";

// --- TYPE DEFINITIONS ---
interface Slot {
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  status: string;
  bookedBy: string | null;
}

interface Booking {
  bookingId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  slots: Slot[];
  paymentRef?: string;
  ticketId?: string | null;
  email?: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

interface ApiResponse {
  user: UserProfile;
  summary: {
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    totalAmount: number;
    firstBookingDate: string;
    lastBookingDate: string;
  };
  bookings: Booking[];
}

// --- HELPER COMPONENTS ---

/**
 * Enhanced reusable card component with better styling
 */
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}> = ({ title, value, icon, description }) => (
  <div className="group bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-green-100">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 text-green-600 group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
  </div>
);

/**
 * Enhanced colored badge with better visual hierarchy
 */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const lowerStatus = status.toLowerCase();
  const statusConfig = {
    completed: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    confirmed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    default: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" }
  };

  const config = statusConfig[lowerStatus as keyof typeof statusConfig] || statusConfig.default;

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} capitalize inline-flex items-center`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-70"></span>
      {status}
    </span>
  );
};

/**
 * Enhanced custom tooltip
 */
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 backdrop-blur-sm">
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        <p className="text-sm font-medium text-green-600 mt-1">
          {`Spent: ₦${payload[0].value.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard: React.FC = () => {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState<"overview" | "bookings">("overview");

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to access your dashboard");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(
          "https://soccerzone-backend.onrender.com/api/auth/profile",
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        
        if (!res.ok) {
          throw new Error("Failed to load profile data");
        }
        
        const data: ApiResponse = await res.json();
        setApiData(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        if (err.message.includes("token") || err.message.includes("auth")) {
          localStorage.removeItem("token");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const user = apiData?.user;
  const bookings = apiData?.bookings || [];
  const summary = apiData?.summary;

  // Enhanced data processing with proper monthly aggregation and date fixing
  const { monthlyData, averageSpending } = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return {
        monthlyData: [],
        averageSpending: 0
      };
    }

    const monthlyAgg: { [key: string]: number } = {};

    bookings.forEach((b) => {
      try {
        const date = new Date(b.createdAt);
        if (isNaN(date.getTime())) {
          console.warn("Invalid date for booking:", b.bookingId);
          return;
        }
        
        // FIX: Use the actual year from the booking date
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;

        if (!monthlyAgg[monthKey]) {
          monthlyAgg[monthKey] = 0;
        }
        monthlyAgg[monthKey] += b.totalAmount;
      } catch (e) {
        console.error("Error processing booking date:", e);
      }
    });

    // FIX: Proper date formatting to show correct year
    const sortedMonthlyData = Object.keys(monthlyAgg)
      .sort()
      .map((key) => {
        const [year, month] = key.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          name: date.toLocaleString("default", { 
            month: "short", 
            year: "numeric"
          }),
          amount: monthlyAgg[key],
          fullDate: date
        };
      });

    return {
      monthlyData: sortedMonthlyData,
      averageSpending: bookings.length > 0 ? (summary?.totalAmount || 0) / bookings.length : 0
    };
  }, [bookings, summary]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // ADD THE MISSING renderOverview FUNCTION
  const renderOverview = () => {
    if (!user || !summary) return null;
    
    return (
      <>
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Spent"
            value={`₦${summary.totalAmount.toLocaleString()}`}
            icon={<DollarSign size={20} />}
            description="All-time spending"
          />
          <StatCard
            title="Total Bookings"
            value={summary.totalBookings}
            icon={<Hash size={20} />}
            description="All sessions"
          />
          <StatCard
            title="Pending"
            value={summary.pendingBookings}
            icon={<Clock size={20} />}
            description="Awaiting confirmation"
          />
          <StatCard
            title="Avg. Booking"
            value={`₦${Math.round(averageSpending).toLocaleString()}`}
            icon={<TrendingUp size={20} />}
            description="Per session"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Spending Overview
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>All months</span>
              </div>
            </div>
            
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={monthlyData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₦${value / 1000}k`}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(16, 185, 129, 0.05)" }}
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    vertical={false}
                  />
                  <Bar
                    dataKey="amount"
                    radius={[4, 4, 0, 0]}
                  >
                    {monthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="url(#colorAmount)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No spending data yet</p>
                <p className="text-sm text-gray-400 mt-1">Your spending history will appear here</p>
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                title="Logout"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <User size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">Full Name</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <Mail size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">Email Address</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <Phone size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                  <p className="text-xs text-gray-500">Phone Number</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings Preview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Bookings
            </h2>
            <button 
              onClick={() => setActiveView("bookings")}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View All →
            </button>
          </div>
          
          {bookings.length > 0 ? (
            <div className="p-6">
              <div className="space-y-4">
                {bookings.slice(0, 3).map((booking) => (
                  <BookingCard key={booking.bookingId} booking={booking} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No bookings yet</p>
              <p className="text-sm text-gray-400 mt-1">Your bookings will appear here</p>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderBookings = () => {
    if (!bookings) return null;
    
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            All Bookings ({bookings.length})
          </h2>
          <button 
            onClick={() => setActiveView("overview")}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Overview
          </button>
        </div>
        
        {bookings.length > 0 ? (
          <div className="p-6">
            <div className="space-y-4">
              {bookings.map((booking) => (
                <BookingCard key={booking.bookingId} booking={booking} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No bookings yet</p>
            <p className="text-sm text-gray-400 mt-1">Your bookings will appear here</p>
          </div>
        )}
      </div>
    );
  };

  // --- RENDER STATES ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Getting everything ready for you</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium w-full"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your SoccerZone bookings today.
          </p>
        </div>

        {/* View Toggle - Now Functional! */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-8">
          <button
            onClick={() => setActiveView("overview")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === "overview" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView("bookings")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === "bookings" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Bookings ({bookings.length})
          </button>
        </div>

        {/* Render the active view */}
        {activeView === "overview" ? renderOverview() : renderBookings()}
      </main>
    </div>
  );
};

export default Dashboard;
