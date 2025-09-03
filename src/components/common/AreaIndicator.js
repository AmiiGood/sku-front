import React, { useState } from "react";
import { Info, ChevronDown, ChevronUp, Monitor, Clipboard, Award } from "lucide-react";
import { useRole } from "../../contexts/RoleContext";

const AreaIndicator = () => {
  const { 
    roleName, 
    userArea, 
    getModulesByArea, 
    hasPermission, 
    AREAS 
  } = useRole();
  
  const [showDetails, setShowDetails] = useState(false);

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

  const AreaIcon = areaIcons[userArea] || Info;
  const colors = areaColors[userArea] || areaColors[AREAS.TI];
  const modulesByArea = getModulesByArea();

  // Obtener permisos del usuario para el área actual
  const getCurrentAreaPermissions = () => {
    const permissions = [];
    
    Object.entries(modulesByArea).forEach(([area, modules]) => {
      if (area === userArea) {
        modules.forEach(module => {
          if (module.available) {
            const modulePermissions = [];
            
            if (hasPermission(module.id, "read")) modulePermissions.push("Consultar");
            if (hasPermission(module.id, "create")) modulePermissions.push("Crear");
            if (hasPermission(module.id, "update")) modulePermissions.push("Editar");
            if (hasPermission(module.id, "delete")) modulePermissions.push("Eliminar");
            if (hasPermission(module.id, "print")) modulePermissions.push("Imprimir");
            
            if (modulePermissions.length > 0) {
              permissions.push({
                module: module.name,
                permissions: modulePermissions
              });
            }
          }
        });
      }
    });

    return permissions;
  };

  const userPermissions = getCurrentAreaPermissions();

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
      {/* Header del indicador */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => setShowDetails(!showDetails)}
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
              {userArea}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: colors.text,
                opacity: 0.8,
              }}
            >
              {roleName}
            </div>
          </div>
        </div>
        
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: colors.text,
            padding: "0.25rem",
            borderRadius: "var(--border-radius)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.2s ease",
            opacity: 0.7,
          }}
          onMouseEnter={(e) => (e.target.style.opacity = 1)}
          onMouseLeave={(e) => (e.target.style.opacity = 0.7)}
        >
          {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Detalles expandibles */}
      {showDetails && (
        <div
          style={{
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <h4
            style={{
              fontSize: "0.875rem",
              fontWeight: "600",
              color: colors.text,
              marginBottom: "0.75rem",
            }}
          >
            Permisos Asignados
          </h4>

          {userPermissions.length === 0 ? (
            <p
              style={{
                fontSize: "0.75rem",
                color: colors.text,
                opacity: 0.7,
                fontStyle: "italic",
              }}
            >
              No tienes permisos asignados en esta área.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {userPermissions.map((item, index) => (
                <div key={index}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "500",
                      color: colors.text,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {item.module}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.25rem",
                    }}
                  >
                    {item.permissions.map((permission, permIndex) => (
                      <span
                        key={permIndex}
                        style={{
                          fontSize: "0.7rem",
                          padding: "0.125rem 0.375rem",
                          backgroundColor: colors.text,
                          color: colors.bg,
                          borderRadius: "8px",
                          fontWeight: "500",
                        }}
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Descripción del área */}
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              borderRadius: "var(--border-radius)",
              fontSize: "0.75rem",
              color: colors.text,
              opacity: 0.8,
            }}
          >
            <strong>Descripción del Área:</strong>
            <br />
            {userArea === AREAS.TI && 
              "Administración completa del sistema, gestión de usuarios y configuraciones."}
            {userArea === AREAS.PLANEACION && 
              "Gestión de artículos e impresión de etiquetas para la producción."}
            {userArea === AREAS.CALIDAD && 
              "Control y registro de productos defectuosos en el proceso de producción."}
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaIndicator;