import { useState, useEffect } from "react";

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check URL params for dark mode
    const urlParams = new URLSearchParams(window.location.search);
    const darkParam = urlParams.get("dark");
    if (darkParam !== null) {
      return darkParam === "true" || darkParam === "1";
    }
    // Check localStorage
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  const applyTheme = (dark) => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light",
    );
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setTheme = (theme) => {
    const isDark = theme === "dark";
    setIsDarkMode(isDark);
  };

  return { isDarkMode, toggleTheme, setTheme };
}
