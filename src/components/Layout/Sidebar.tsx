import React, { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  User,
  Package,
  Menu,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  brand?: string;
  navItems?: NavItem[];
  footerText?: string;
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({
  brand = "Point2",
  footerText = "© 2025 Soccerzone",
  navItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "/admindashboard",
    },
    {
      label: "Users",
      icon: <User size={18} />,
      path: "/admindashboard/users",
    },
    {
      label: "Calendar",
      icon: <Calendar size={18} />,
      path: "/admindashboard/calendar",
    },
    {
      label: "Settings",
      icon: <Package size={18} />,
      path: "/admindashboard/settings",
    },
  ],
  children,
}) => {
  const [isHidden, setIsHidden] = useState(false);
  const navigate = useNavigate();

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/"); // redirect to main page
  };

  return (
    <div className="relative flex h-screen font-sans text-gray-900 bg-gradient-to-br from-gray-50 to-green-50">
      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-100 shadow-sm transform transition-transform duration-300 ease-in-out ${
          isHidden ? "-translate-x-full" : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-emerald-600">{brand}</h1>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ✅ Logout Button */}
        <div className="mt-6 px-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-red-600 hover:scale-[1.02]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Footer */}
        <div className="mt-auto p-4 border-t border-gray-100 text-center text-sm text-gray-500">
          {footerText}
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        onClick={() => setIsHidden(!isHidden)}
        className="fixed top-4 left-4 z-50 bg-emerald-600 text-white p-2 rounded-md shadow-md hover:bg-emerald-700 transition"
        title="Toggle Menu"
      >
        <Menu size={18} />
      </button>

      {/* Page Content */}
      <main className="flex-1 p-6 ml-0 lg:ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default Sidebar;
