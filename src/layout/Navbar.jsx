import { useState } from "react";
import { Bell, User, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeProvider";
import { useAuth } from "../context/AuthProvider";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
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
      className={`${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "text-gray-900 bg-white"
      } shadow px-6 py-4 flex justify-between items-center sticky top-0 z-50 transition-colors duration-300`}
    >
      {/* Heading */}
      <h1 className={`text-5xl ml-5 text-indigo-600 font-bold  tracking-widest`}>Habit Tracker</h1>

      {/* Right Section */}
      <div className="flex items-center space-x-6 relative">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition ${
            theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
          }`}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={handleNotificationClick}
            className={`p-2 rounded-full transition relative ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg p-3 ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              }`}
            >
              <h3 className="font-semibold mb-2">Notifications</h3>
              {notifications.length > 0 ? (
                <ul className="space-y-2">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`p-2 rounded-md ${
                        theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}
                    >
                      {n.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No notifications</p>
              )}
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
            <User size={20} />
          </button>

          {showProfile && (
            <div
              className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg p-3 ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              }`}
            >
              <div className="mb-3">
                <p className="font-semibold">{currentUser?.name || "User"}</p>
                <p className="text-sm text-gray-500">{currentUser?.email}</p>
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
