import React, { useState, useEffect } from "react";
import { Palette } from "lucide-react";

const ThemeSelector = () => {
  const [currentTheme, setCurrentTheme] = useState("light");
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { id: "light", name: "Modo Claro", className: "", color: "#ffffff" },
    {
      id: "dark",
      name: "Modo Oscuro",
      className: "theme-dark",
      color: "#0a0a0a",
    },
    { id: "ocean", name: "Océano", className: "theme-ocean", color: "#4b6dd1" },
    {
      id: "sunset",
      name: "Sunset",
      className: "theme-sunset",
      color: "#f97316",
    },
  ];

  useEffect(() => {
    // Cargar tema guardado del localStorage
    const savedTheme = localStorage.getItem("theme") || "light";
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeId) => {
    const theme = themes.find((t) => t.id === themeId);
    if (theme) {
      document.body.className = theme.className;
      localStorage.setItem("theme", themeId);
    }
  };

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    setIsOpen(false);
  };

  const currentThemeObj = themes.find((t) => t.id === currentTheme);

  return (
    <div style={{ position: "relative" }}>
      <button
        className="btn btn-secondary"
        onClick={() => setIsOpen(!isOpen)}
        title="Cambiar tema"
        style={{
          padding: "0.5rem",
          minWidth: "auto",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <Palette size={16} />
        <span style={{ fontSize: "0.75rem" }}>{currentThemeObj?.name}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.5rem",
            backgroundColor: "var(--white)",
            border: "1px solid var(--gray-300)",
            borderRadius: "var(--border-radius)",
            boxShadow: "var(--shadow-md)",
            zIndex: 1000,
            minWidth: "160px",
          }}
        >
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "none",
                background: "none",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.875rem",
                color: "var(--gray-700)",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "var(--gray-50)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: theme.color,
                  border:
                    theme.id === "light" ? "1px solid var(--gray-300)" : "none",
                  flexShrink: 0,
                }}
              />
              <span>{theme.name}</span>
              {currentTheme === theme.id && (
                <span style={{ marginLeft: "auto", fontSize: "0.75rem" }}>
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Overlay para cerrar el dropdown cuando se hace click afuera */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeSelector;
