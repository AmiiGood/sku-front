import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { RoleProvider } from "./contexts/RoleContext";
import { ToastProvider } from "./contexts/ToastContext";
import Login from "./components/auth/Login";
import Sidebar from "./components/layout/Sidebar";
import ArticulosSection from "./components/sections/ArticulosSection";
import UsuariosSection from "./components/sections/UsuariosSection";
import RolesSection from "./components/sections/RolesSection";
import LogsSection from "./components/sections/LogsSection";
import ImpresionesSection from "./components/sections/ImpresionesSection";

// Importar los estilos
import "./styles/globals.css";
import "./styles/themes.css";

// Componente principal de la aplicación
const Dashboard = () => {
  const [currentSection, setCurrentSection] = useState("articulos");

  const getSectionTitle = () => {
    switch (currentSection) {
      case "articulos":
        return "Gestión de Artículos";
      case "usuarios":
        return "Gestión de Usuarios";
      case "roles":
        return "Gestión de Roles";
      case "logs":
        return "Logs del Sistema";
      case "impresiones":
        return "Impresiones de Etiquetas";
      default:
        return "Dashboard";
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case "articulos":
        return <ArticulosSection />;
      case "usuarios":
        return <UsuariosSection />;
      case "roles":
        return <RolesSection />;
      case "logs":
        return <LogsSection />;
      case "impresiones":
        return <ImpresionesSection />;
      default:
        return <ArticulosSection />;
    }
  };

  return (
    <RoleProvider>
      <div className="app">
        <Sidebar
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
        />
        <div className="main-content">{renderSection()}</div>
      </div>
    </RoleProvider>
  );
};

// Componente principal
const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "var(--gray-50)",
          color: "var(--gray-600)",
          fontSize: "0.875rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              border: "2px solid var(--gray-300)",
              borderTop: "2px solid var(--black)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          Cargando...
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
};

// Exportar con AuthProvider y ToastProvider
export default function AppWithAuth() {
  return (
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  );
}
