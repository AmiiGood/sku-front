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
  Monitor,
  Clipboard,
  Award,
  ChevronDown,
  ChevronRight,
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
  const { 
    canAccessModule, 
    roleName, 
    userArea, 
    hasPermission, 
    getModulesByArea,
    AREAS 
  } = useRole();
  const [showPrinterSettings, setShowPrinterSettings] = useState(false);
  const [expandedAreas, setExpandedAreas] = useState({});

  // Definir iconos para cada módulo
  const moduleIcons = {
    articulos: Package,
    impresiones: Printer,
    usuarios: Users,
    roles: Shield,
    logs: Activity,
    defectivos: AlertTriangle,
  };

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
      hover: "var(--primary-100)",
    },
    [AREAS.PLANEACION]: {
      bg: "var(--success-50)",
      text: "var(--success-800)",
      border: "var(--success-200)",
      hover: "var(--success-100)",
    },
    [AREAS.CALIDAD]: {
      bg: "var(--warning-50)",
      text: "var(--warning-800)",
      border: "var(--warning-200)",
      hover: "var(--warning-100)",
    },
  };

  // Obtener módulos organizados por área
  const modulesByArea = getModulesByArea();

  // Verificar si el usuario puede imprimir etiquetas
  const canPrint = hasPermission("articulos", "print");

  // Filtrar solo las áreas que tienen módulos disponibles
  const availableAreas = Object.entries(modulesByArea).filter(
    ([area, modules]) => modules.some(module => module.available)
  );

  // Inicializar áreas expandidas (la primera área expandida por defecto)
  React.useEffect(() => {
    if (availableAreas.length > 0 && Object.keys(expandedAreas).length === 0) {
      const userAreaName = availableAreas.find(([area]) => area === userArea)?.[0];
      if (userAreaName) {
        setExpandedAreas({ [userAreaName]: true });
      } else {
        // Si el usuario no tiene su área, expandir la primera disponible
        setExpandedAreas({ [availableAreas[0][0]]: true });
      }
    }
  }, [availableAreas, userArea, expandedAreas]);

  // Si el usuario no tiene acceso a la sección actual, cambiar a la primera disponible
  React.useEffect(() => {
    const hasCurrentSection = availableAreas.some(([area, modules]) =>
      modules.some(module => module.available && module.id === currentSection)
    );
    
    if (!hasCurrentSection && availableAreas.length > 0) {
      const firstAvailableModule = availableAreas[0][1].find(module => module.available);
      if (firstAvailableModule) {
        setCurrentSection(firstAvailableModule.id);
      }
    }
  }, [currentSection, availableAreas, setCurrentSection]);

  const toggleArea = (areaName) => {
    setExpandedAreas(prev => ({
      ...prev,
      [areaName]: !prev[areaName]
    }));
  };

  // Si no hay áreas disponibles, mostrar solo el logout
  if (availableAreas.length === 0) {
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
            <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
              {roleName}
            </div>
            <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
              {userArea}
            </div>
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
          }}
        >
          <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
            {roleName}
          </div>
          <div 
            style={{ 
              fontSize: "0.75rem", 
              opacity: 0.8,
              backgroundColor: areaColors[userArea]?.bg || "var(--primary-50)",
              color: areaColors[userArea]?.text || "var(--primary-600)",
              padding: "0.25rem 0.5rem",
              borderRadius: "12px",
              display: "inline-block"
            }}
          >
            {userArea}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {availableAreas.map(([areaName, modules]) => {
          const AreaIcon = areaIcons[areaName];
          const availableModules = modules.filter(module => module.available);
          const isExpanded = expandedAreas[areaName];
          const colors = areaColors[areaName] || areaColors[AREAS.TI];
          
          if (availableModules.length === 0) return null;

          return (
            <div key={areaName} style={{ marginBottom: "0.5rem" }}>
              {/* Header del área - clickeable para expandir/contraer */}
              <button
                onClick={() => toggleArea(areaName)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 0.5rem",
                  marginTop: availableAreas[0][0] === areaName ? "0" : "1rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: colors.text,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "var(--border-radius)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.hover;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <AreaIcon size={14} />
                  {areaName}
                </div>
                {isExpanded ? (
                  <ChevronDown size={14} style={{ transition: "transform 0.2s ease" }} />
                ) : (
                  <ChevronRight size={14} style={{ transition: "transform 0.2s ease" }} />
                )}
              </button>

              {/* Contenedor de módulos con animación */}
              <div
                style={{
                  overflow: "hidden",
                  maxHeight: isExpanded ? `${availableModules.length * 40}px` : "0px",
                  opacity: isExpanded ? 1 : 0,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isExpanded ? "translateY(0)" : "translateY(-10px)",
                }}
              >
                {/* Módulos del área */}
                {availableModules.map((module) => {
                  const ModuleIcon = moduleIcons[module.id];
                  return (
                    <button
                      key={module.id}
                      className={`nav-item ${
                        currentSection === module.id ? "active" : ""
                      }`}
                      onClick={() => setCurrentSection(module.id)}
                      style={{
                        marginLeft: "1rem",
                        fontSize: "0.875rem",
                        transition: "all 0.2s ease",
                        transform: isExpanded ? "translateX(0)" : "translateX(-10px)",
                        opacity: isExpanded ? 1 : 0,
                      }}
                    >
                      <ModuleIcon size={16} />
                      {module.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}


        

        {/* Cerrar sesión */}
        <button
          className="nav-item"
          onClick={logout}
          style={{
            marginTop: "1rem",
            color: "var(--gray-500)",
            borderTop: "1px solid var(--gray-200)",
            paddingTop: "1rem",
            transition: "all 0.2s ease",
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