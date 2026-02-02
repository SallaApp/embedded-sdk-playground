import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
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

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const setTheme = useCallback((theme) => {
    const isDark = theme === "dark";
    setIsDarkMode((prev) => {
      // Only update if theme actually changed
      if (prev === isDark) {
        return prev;
      }
      return isDark;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
