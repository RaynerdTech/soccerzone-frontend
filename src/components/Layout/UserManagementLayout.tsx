import React, { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  User,
  Package,
  Menu,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const UserManagementLayout: React.FC<LayoutProps> = ({ children, title }) => {
  const [isHidden, setIsHidden] = useState(false);

  return (
    <div className="h-screen flex font-sans text-gray-900 bg-gradient-to-br from-gray-50 to-green-50 overflow-hidden">
      {/* ✅ Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 shadow-sm transform transition-transform duration-300 ease-in-out ${
          isHidden ? "-translate-x-full" : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-emerald-600">AdminPanel</h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-1 px-3 mt-4">
          <a
            href="#"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all"
          >
            <LayoutDashboard size={18} />
            <span className="text-sm font-medium">Dashboard</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all"
          >
            <Calendar size={18} />
            <span className="text-sm font-medium">Calendar</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all"
          >
            <User size={18} />
            <span className="text-sm font-medium">Users</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all"
          >
            <Package size={18} />
            <span className="text-sm font-medium">Bookings</span>
          </a>
        </nav>

        {/* Footer */}
        <div className="mt-auto p-4 border-t border-gray-100 text-center text-sm text-gray-500">
          © 2025 Point2
        </div>
      </aside>

      {/* ✅ Toggle Button (always visible) */}
      <button
        onClick={() => setIsHidden(!isHidden)}
        className="fixed top-4 left-4 z-50 bg-emerald-600 text-white p-2 rounded-md shadow-md hover:bg-emerald-700 transition"
      >
        <Menu size={18} />
      </button>

      {/* ✅ Scrollable Content Area */}
      <main className="flex-1 ml-0 lg:ml-64 h-full overflow-y-auto p-6 transition-all duration-300">
        {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
        {children}
      </main>
    </div>
  );
};

export default UserManagementLayout;
