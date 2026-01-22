import { useState } from "react";
import { Bell, User, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeProvider";
import { useAuth } from "../context/AuthProvider";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, text: "Your daily habit goal is pending!" },
    { id: 2, text: "Don’t forget to drink 8 glasses of water today!" },
  ]);
  const [unreadCount, setUnreadCount] = useState(notifications.length);
  const [showProfile, setShowProfile] = useState(false);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setUnreadCount(0);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav
      className={`
        ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}
        shadow
        px-3 sm:px-4 md:px-6
        py-3 sm:py-4
        flex justify-between items-center
        sticky top-0 z-50
        transition-colors duration-300
      `}
    >
      {/* Logo / Title */}
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-widest text-indigo-600 ml-1 sm:ml-3">
        Habit Tracker
      </h1>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 relative">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition ${
            theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
          }`}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={handleNotificationClick}
            className={`p-2 rounded-full transition relative ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
            }`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className={`
                absolute right-0 mt-2
                w-64 sm:w-72
                rounded-lg shadow-lg p-3
                ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"}
              `}
            >
              <h3 className="font-semibold mb-2">Notifications</h3>
              <ul className="space-y-2">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`p-2 rounded-md text-sm ${
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {n.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className={`p-2 rounded-full transition ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
            }`}
          >
            <User size={18} />
          </button>

          {showProfile && (
            <div
              className={`
                absolute right-0 mt-2
                w-52 sm:w-56
                rounded-lg shadow-lg p-3
                ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"}
              `}
            >
              <div className="mb-3">
                <p className="font-semibold truncate">
                  {currentUser?.name || "User"}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {currentUser?.email}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-left rounded-md bg-red-500 text-white hover:bg-red-600 transition"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
