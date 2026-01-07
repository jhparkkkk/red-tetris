import { useState, useEffect } from "react";

/**
 * Hook pour gérer le thème (clair/sombre)
 * Sauvegarde la préférence dans localStorage
 */
export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Charger le thème depuis localStorage après le montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("tetris-theme");
        if (savedTheme === "dark") {
          setIsDarkMode(true);
          document.body.setAttribute("data-theme", "dark");
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    }
  }, []);

  // Sauvegarder et appliquer le thème quand il change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const theme = isDarkMode ? "dark" : "light";
        localStorage.setItem("tetris-theme", theme);
        document.body.setAttribute("data-theme", theme);
      } catch (error) {
        console.error("Error saving theme:", error);
      }
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return { isDarkMode, toggleTheme };
};
