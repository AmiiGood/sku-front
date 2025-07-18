import React from "react";
import { useRole } from "../../contexts/RoleContext";

// Componente para proteger contenido basado en permisos
export const ProtectedComponent = ({
  module,
  action,
  children,
  fallback = null,
  showMessage = false,
}) => {
  const { hasPermission } = useRole();

  if (!hasPermission(module, action)) {
    if (showMessage) {
      return (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "var(--warning-50)",
            border: "1px solid var(--warning-200)",
            borderRadius: "var(--border-radius)",
            color: "var(--warning-800)",
            textAlign: "center",
            fontSize: "0.875rem",
          }}
        >
          No tienes permisos para acceder a esta funcionalidad
        </div>
      );
    }
    return fallback;
  }

  return children;
};

// Componente para proteger botones específicos
export const ProtectedButton = ({
  module,
  action,
  children,
  onClick,
  ...props
}) => {
  const { hasPermission } = useRole();

  if (!hasPermission(module, action)) {
    return null;
  }

  return (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  );
};

// Hook para obtener permisos de forma más directa
export const usePermissions = (module) => {
  const { hasPermission } = useRole();

  return {
    canRead: hasPermission(module, "read"),
    canCreate: hasPermission(module, "create"),
    canUpdate: hasPermission(module, "update"),
    canDelete: hasPermission(module, "delete"),
    canPrint: hasPermission(module, "print"),
  };
};

// Componente para mostrar información del rol actual
export const RoleIndicator = () => {
  const { roleName, userRole, ROLE_NAMES } = useRole();

  const getRoleColor = () => {
    switch (userRole) {
      case 1: // Administrador
        return {
          background: "var(--success-50)",
          color: "var(--success-800)",
          border: "var(--success-200)",
        };
      case 2: // Operador
        return {
          background: "var(--warning-50)",
          color: "var(--warning-800)",
          border: "var(--warning-200)",
        };
      case 3: // Generador
        return {
          background: "var(--primary-50)",
          color: "var(--primary-800)",
          border: "var(--primary-200)",
        };
      default:
        return {
          background: "var(--gray-50)",
          color: "var(--gray-800)",
          border: "var(--gray-200)",
        };
    }
  };

  const colors = getRoleColor();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.25rem 0.75rem",
        backgroundColor: colors.background,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: "500",
      }}
    >
      {roleName}
    </div>
  );
};
