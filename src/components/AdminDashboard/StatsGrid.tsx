import React from "react";
import { CreditCard, Ticket, Clock, User } from "lucide-react";
import { formatNumber } from "../../utils/formatNumber";

// --- Reusable StatCard Component ---
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => (
  <div className="group bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-green-100 w-full">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1 truncate">
          {title}
        </p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">{value}</p>
        {description && (
          <p className="text-xs text-gray-500 truncate">{description}</p>
        )}
      </div>
      <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 text-green-600 group-hover:scale-110 transition-transform flex-shrink-0">
        {icon}
      </div>
    </div>
  </div>
);

// --- StatsGrid Component ---
interface StatsData {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  revenueByStatus: {
    confirmed: number;
    pending: number;
  };
}

interface StatsGridProps {
  data: StatsData;
}

const StatsGrid: React.FC<StatsGridProps> = ({ data }) => {
  const { totalUsers, totalBookings, totalRevenue, revenueByStatus } = data;

  const avgBooking = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      <StatCard
        title="Total Revenue"
        value={`₦${formatNumber(totalRevenue)}`}
        icon={<CreditCard size={20} />}
        description="All-time revenue"
      />
      <StatCard
        title="Total Bookings"
        value={formatNumber(totalBookings)}
        icon={<Ticket size={20} />}
        description={`Confirmed: ₦${formatNumber(revenueByStatus.confirmed)}`}
      />
      <StatCard
        title="Pending Revenue"
        value={`₦${formatNumber(revenueByStatus.pending)}`}
        icon={<Clock size={20} />}
        description="Awaiting payment"
      />
      <StatCard
        title="Total Users"
        value={formatNumber(totalUsers)}
        icon={<User size={20} />}
        description={`Avg per booking: ₦${formatNumber(avgBooking)}`}
      />
    </div>
  );
};

export default StatsGrid;
