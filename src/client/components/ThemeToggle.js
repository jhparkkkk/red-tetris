import React from "react";

/**
 * ThemeToggle component - Bouton pour basculer entre mode clair et sombre
 */
const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? "light mode" : "dark mode"}
    </button>
  );
};

export default ThemeToggle;
