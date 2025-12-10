// src/context/ThemeProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

// Create context
const ThemeContext = createContext();

// Hook to use theme context
export const useTheme = () => useContext(ThemeContext);

// Provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light"); // default theme

  // On mount, check localStorage for saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("habitify-theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Update document class and localStorage whenever theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("habitify-theme", theme);
  }, [theme]);

  // Toggle function
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
