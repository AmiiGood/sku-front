import React, { useState } from "react";
import {
  Package,
  Users,
  Shield,
  Activity,
  LogOut,
  Printer,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useRole } from "../../contexts/RoleContext";
import UserPrinterSettings from "../common/UserPrinterSettings";

const ExtraLightLogo = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    }}
  >
    <img
      src="/images/dbxextralight.png"
      alt="EXTRALIGHT"
      style={{
        width: "80px",
        objectFit: "contain",
        filter: "var(--logo-filter, none)",
      }}
    />
  </div>
);

const Sidebar = ({ currentSection, setCurrentSection }) => {
  const { logout } = useAuth();
  const { canAccessModule, roleName, hasPermission } = useRole();
  const [showPrinterSettings, setShowPrinterSettings] = useState(false);

  // Definir todos los items de navegación con sus condiciones de acceso
  const allNavItems = [
    {
      id: "articulos",
      label: "Artículos",
      icon: Package,
      module: "articulos",
    },
    {
      id: "defectivos",
      label: "Defectivos",
      icon: AlertTriangle,
      module: "defectivos",
    },
    {
      id: "usuarios",
      label: "Usuarios",
      icon: Users,
      module: "usuarios",
    },
    {
      id: "roles",
      label: "Roles",
      icon: Shield,
      module: "roles",
    },
    {
      id: "logs",
      label: "Logs",
      icon: Activity,
      module: "logs",
    },
    {
      id: "impresiones",
      label: "Impresiones",
      icon: Printer,
      module: "impresiones",
    },
  ];

  // Filtrar items basado en permisos del rol
  const navItems = allNavItems.filter((item) => canAccessModule(item.module));

  // Si el usuario no tiene acceso a la sección actual, cambiar a la primera disponible
  React.useEffect(() => {
    if (
      navItems.length > 0 &&
      !canAccessModule(currentSection.replace("articulos", "articulos"))
    ) {
      const firstAvailableSection = navItems[0]?.id;
      if (firstAvailableSection) {
        setCurrentSection(firstAvailableSection);
      }
    }
  }, [currentSection, navItems, setCurrentSection, canAccessModule]);

  // Verificar si el usuario puede imprimir etiquetas
  const canPrint = hasPermission("articulos", "print");

  // Si no hay items disponibles, mostrar solo el logout
  if (navItems.length === 0) {
    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <ExtraLightLogo />
          <div
            style={{
              textAlign: "center",
              marginTop: "1rem",
              fontSize: "0.875rem",
              color: "var(--gray-600)",
            }}
          >
            {roleName}
          </div>
        </div>

        <nav className="sidebar-nav">
          <div
            style={{
              padding: "1rem",
              textAlign: "center",
              color: "var(--gray-500)",
              fontSize: "0.875rem",
            }}
          >
            No tienes permisos para acceder a ningún módulo.
          </div>

          <button
            className="nav-item"
            onClick={logout}
            style={{
              marginTop: "2rem",
              color: "var(--gray-500)",
              borderTop: "1px solid var(--gray-200)",
              paddingTop: "1rem",
            }}
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <ExtraLightLogo />
        <div
          style={{
            textAlign: "center",
            marginTop: "1rem",
            fontSize: "0.875rem",
            color: "var(--gray-600)",
            fontWeight: "500",
          }}
        >
          {roleName}
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentSection === item.id ? "active" : ""}`}
            onClick={() => setCurrentSection(item.id)}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}

        {/* Separador */}
        <div
          style={{
            borderTop: "1px solid var(--gray-200)",
            margin: "1rem 0",
          }}
        />

        {/* Configuración de impresora personal (solo si puede imprimir) */}
        {canPrint && (
          <button
            className="nav-item"
            onClick={() => setShowPrinterSettings(true)}
            style={{
              color: "var(--primary-600)",
              fontSize: "0.8rem",
            }}
          >
            <Settings size={16} />
            Mi Impresora
          </button>
        )}

        {/* Cerrar sesión */}
        <button
          className="nav-item"
          onClick={logout}
          style={{
            marginTop: "1rem",
            color: "var(--gray-500)",
            borderTop: "1px solid var(--gray-200)",
            paddingTop: "1rem",
          }}
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </nav>

      {/* Modal de configuración de impresora */}
      <UserPrinterSettings
        isOpen={showPrinterSettings}
        onClose={() => setShowPrinterSettings(false)}
      />
    </div>
  );
};

export default Sidebar;
