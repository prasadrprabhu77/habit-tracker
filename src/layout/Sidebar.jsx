import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";

const Sidebar = () => {
  const { theme } = useTheme();
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Dashboard" },
    { path: "/manage-habits", label: "Manage Habits" },
    { path: "/check-progress", label: "Check Progress" },
    { path: "/challenges", label: "Challenges" },
  ];

  return (
    <aside
      className={`${
        theme === "dark"
          ? "bg-gray-800 text-white"
          : "bg-white text-gray-900"
      } w-64 h-screen shadow-lg p-6 transition-colors duration-300`}
    >
      <h2 className="text-xl font-semibold mb-6">Menu</h2>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block rounded-md px-3 py-2 transition-colors duration-200 ${
              location.pathname === item.path
                ? theme === "dark"
                  ? "bg-gray-700 text-white font-medium"
                  : "bg-gray-200 text-gray-900 font-medium"
                : theme === "dark"
                ? "hover:bg-gray-800"
                : "hover:bg-gray-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
