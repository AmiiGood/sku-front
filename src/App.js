import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { RoleProvider, useRole } from "./contexts/RoleContext";
import { ToastProvider } from "./contexts/ToastContext";
import { Monitor, Clipboard, Award } from "lucide-react";
import Login from "./components/auth/Login";
import Sidebar from "./components/layout/Sidebar";
import UserPrinterSettings from "./components/common/UserPrinterSettings";
import ArticulosSection from "./components/sections/ArticulosSection";
import UsuariosSection from "./components/sections/UsuariosSection";
import RolesSection from "./components/sections/RolesSection";
import LogsSection from "./components/sections/LogsSection";
import ImpresionesSection from "./components/sections/ImpresionesSection";
import DefectivosSection from "./components/sections/DefectivoSection";

// Importar los estilos
import "./styles/globals.css";
import "./styles/themes.css";

// Componente AreaIndicator
const AreaIndicator = () => {
  const { roleName, userArea, AREAS } = useRole();

  // Iconos para las áreas
  const areaIcons = {
    [AREAS.TI]: Monitor,
    [AREAS.PLANEACION]: Clipboard,
    [AREAS.CALIDAD]: Award,
  };

  // Colores por área
  const areaColors = {
    [AREAS.TI]: {
      bg: "var(--primary-50)",
      text: "var(--primary-800)",
      border: "var(--primary-200)",
    },
    [AREAS.PLANEACION]: {
      bg: "var(--success-50)",
      text: "var(--success-800)",
      border: "var(--success-200)",
    },
    [AREAS.CALIDAD]: {
      bg: "var(--warning-50)",
      text: "var(--warning-800)",
      border: "var(--warning-200)",
    },
  };

  const AreaIcon = areaIcons[userArea] || Monitor;
  const colors = areaColors[userArea] || areaColors[AREAS.TI];

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "var(--border-radius-lg)",
        padding: "1rem",
        marginBottom: "1.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <AreaIcon size={20} style={{ color: colors.text }} />
        <div>
          <div
            style={{
              fontWeight: "600",
              color: colors.text,
              fontSize: "0.875rem",
            }}
          >
            Área: {userArea}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: colors.text,
              opacity: 0.8,
            }}
          >
            Rol: {roleName}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal de la aplicación
const Dashboard = () => {
  const [currentSection, setCurrentSection] = useState("articulos");
  const [showPrinterSettings, setShowPrinterSettings] = useState(false);

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
        return "Historial de Impresiones";
      case "defectivos":
        return "Control de Defectivos";
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
      case "defectivos":
        return <DefectivosSection />;
      default:
        return <ArticulosSection />;
    }
  };

  const handleOpenPrinterSettings = () => {
    setShowPrinterSettings(true);
  };

  const handleClosePrinterSettings = () => {
    setShowPrinterSettings(false);
  };

  return (
    <RoleProvider>
      <div className="app">
        <Sidebar
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
          onOpenPrinterSettings={handleOpenPrinterSettings}
        />
        <div className="main-content">
          <AreaIndicator />
          {renderSection()}
        </div>
      </div>
      
      {/* Modal de configuración de impresora - Renderizado fuera de la sidebar */}
      <UserPrinterSettings
        isOpen={showPrinterSettings}
        onClose={handleClosePrinterSettings}
      />
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