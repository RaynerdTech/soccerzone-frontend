import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import axiosInstance from "../../api/axiosInstance";
import { CreditCard, User } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Slot {
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  status: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Booking {
  bookingId: string;
  user: User | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  slots: Slot[];
}

const DashboardChart: React.FC = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced currency formatting with compact notation for large numbers
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000000) {
      return `₦${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(1)}K`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  // Format numbers with compact notation
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  // Get full currency for tooltips
  const formatFullCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString()}`;
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [bookingsRes, usersRes] = await Promise.all([
          axiosInstance.get("/bookings/all"),
          axiosInstance.get("/users")
        ]);

        console.log("Bookings API:", bookingsRes.data);
        console.log("Users API:", usersRes.data);

        const safeBookings = Array.isArray(bookingsRes.data?.bookings?.bookings)
          ? bookingsRes.data.bookings.bookings
          : [];

        const safeUsers = Array.isArray(usersRes.data)
          ? usersRes.data
          : Array.isArray(usersRes.data?.users)
          ? usersRes.data.users
          : [];

        setBookings(safeBookings);
        setUsers(safeUsers);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter dates
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const bookingsInRange = bookings.filter((b) => {
        const created = new Date(b.createdAt);
        return created >= start && created <= end;
      });

      const usersInRange = users.filter((u) => {
        const created = new Date(u.createdAt);
        return created >= start && created <= end;
      });

      setFilteredBookings(bookingsInRange);
      setFilteredUsers(usersInRange);
    } else {
      setFilteredBookings(bookings);
      setFilteredUsers(users);
    }
  }, [startDate, endDate, bookings, users]);

  // Stats
  const totalRevenue = filteredBookings.reduce(
    (sum, b) => sum + b.totalAmount,
    0
  );

  const pendingRevenue = filteredBookings
    .filter((b) => b.status !== "confirmed")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const confirmedRevenue = filteredBookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // Chart configuration
  const chartData = {
    labels: ["Total Bookings", "Confirmed Revenue", "Pending Revenue", "Users"],
    datasets: [
      {
        label: "Dashboard Stats",
        data: [
          filteredBookings.length,
          confirmedRevenue,
          pendingRevenue,
          filteredUsers.length,
        ],
        backgroundColor: [
          "rgba(74, 222, 128, 0.8)",
          "rgba(96, 165, 250, 0.8)",
          "rgba(250, 204, 21, 0.8)",
          "rgba(248, 113, 113, 0.8)",
        ],
        borderColor: [
          "rgb(74, 222, 128)",
          "rgb(96, 165, 250)",
          "rgb(250, 204, 21)",
          "rgb(248, 113, 113)",
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "white",
        bodyColor: "white",
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (context.label.includes('Revenue')) {
              return `${label}: ${formatFullCurrency(value)}`;
            } else {
              return `${label}: ${value.toLocaleString()}`;
            }
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          callback: function(value: any) {
            if (typeof value === 'number') {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
              return value.toLocaleString();
            }
            return value;
          },
          maxTicksLimit: 6,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        }
      },
    },
  };

  // Reset filters
  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg max-w-md">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="font-semibold mb-2">Error Loading Data</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="mb-4 md:mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Analyze your booking and revenue statistics
        </p>
      </div>

      {/* Date Filters */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-3 sm:gap-4 md:gap-6">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 md:gap-4">
              <div className="flex-1 min-w-0">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={handleResetFilters}
            disabled={!startDate && !endDate}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            Reset Filters
          </button>
        </div>
        
        {(startDate || endDate) && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-700">
              Showing data from{" "}
              <span className="font-semibold">
                {startDate || "the beginning"} to {endDate || "now"}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Summary Cards - Mobile First Approach */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        {/* Total Bookings */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-green-200">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                {formatNumber(filteredBookings.length)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">Total Bookings</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Confirmed Revenue */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-blue-200">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                {formatCurrency(confirmedRevenue)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">Confirmed Revenue</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
</div>
          </div>
          <p className="text-xs text-blue-600 mt-2 truncate">
            Full: {formatFullCurrency(confirmedRevenue)}
          </p>
        </div>

        {/* Pending Revenue */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-yellow-200">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                {formatCurrency(pendingRevenue)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">Pending Revenue</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-2 truncate">
            Full: {formatFullCurrency(pendingRevenue)}
          </p>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-red-200">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                {formatNumber(filteredUsers.length)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">Total Users</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
             <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
            Statistics Overview
          </h2>
          <div className="text-xs sm:text-sm text-gray-500">
            Total: {filteredBookings.length} bookings • {filteredUsers.length} users
          </div>
        </div>
        
        <div className="h-48 xs:h-56 sm:h-64 md:h-80 lg:h-96">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default DashboardChart;