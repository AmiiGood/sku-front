import React, { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};

// Definición de roles por área
export const ROLES = {
  ADMINISTRADOR: 2, // TI
  OPERADOR: 5,      // Planeación
  GENERADOR: 6,     // Planeación
  CALIDAD: 7,       // Calidad
};

export const AREAS = {
  TI: "TI",
  PLANEACION: "Planeación", 
  CALIDAD: "Calidad"
};

export const ROLE_NAMES = {
  [ROLES.ADMINISTRADOR]: "Administrador",
  [ROLES.OPERADOR]: "Operador",
  [ROLES.GENERADOR]: "Generador", 
  [ROLES.CALIDAD]: "Calidad",
};

export const ROLE_AREAS = {
  [ROLES.ADMINISTRADOR]: AREAS.TI,
  [ROLES.OPERADOR]: AREAS.PLANEACION,
  [ROLES.GENERADOR]: AREAS.PLANEACION,
  [ROLES.CALIDAD]: AREAS.CALIDAD,
};

// Definición de permisos por rol y área
const PERMISSIONS = {
  [ROLES.ADMINISTRADOR]: {
    // TI - Acceso total al sistema
    articulos: {
      read: true,
      create: true,
      update: true,
      delete: true,
      print: true,
    },
    usuarios: {
      read: true,
      create: true,
      update: true,
      delete: true,
    },
    roles: {
      read: true,
      create: true,
      update: true,
      delete: true,
    },
    logs: {
      read: true,
      delete: true,
    },
    impresiones: {
      read: true,
    },
    defectivos: {
      read: true,
      create: true,
      update: true,
      delete: true,
    },
  },
  [ROLES.GENERADOR]: {
    // Planeación - Generador: Captura y edita información de artículos
    articulos: {
      read: true,
      create: true,
      update: true,
      delete: false,
      print: false,
    },
    usuarios: {
      read: false,
      create: false,
      update: false,
      delete: false,
    },
    roles: {
      read: false,
      create: false,
      update: false,
      delete: false,
    },
    logs: {
      read: false,
      delete: false,
    },
    impresiones: {
      read: false,
    },
    defectivos: {
      read: false,
      create: false,
      update: false,
      delete: false,
    },
  },
  [ROLES.OPERADOR]: {
    // Planeación - Operador: Solo genera etiquetas
    articulos: {
      read: true,
      create: false,
      update: false,
      delete: false,
      print: true,
    },
    usuarios: {
      read: false,
      create: false,
      update: false,
      delete: false,
    },
    roles: {
      read: false,
      create: false,
      update: false,
      delete: false,
    },
    logs: {
      read: false,
      delete: false,
    },
    impresiones: {
      read: true,
    },
    defectivos: {
      read: false,
      create: false,
      update: false,
      delete: false,
    },
  },
  [ROLES.CALIDAD]: {
    // Calidad - Solo defectivos
    articulos: {
      read: false,
      create: false,
      update: false,
      delete: false,
      print: false,
    },
    usuarios: {
      read: false,
      create: false,
      update: false,
      delete: false,
    },
    roles: {
      read: false,
      create: false,
      update: false,
      delete: false,
    },
    logs: {
      read: false,
      delete: false,
    },
    impresiones: {
      read: false,
    },
    defectivos: {
      read: true,
      create: true,
      update: true,
      delete: true,
    },
  },
};

export const RoleProvider = ({ children }) => {
  const { user } = useAuth();

  const getUserRole = () => {
    if (!user || !user.rol_id) return null;
    return user.rol_id;
  };

  const getRoleName = () => {
    const roleId = getUserRole();
    return ROLE_NAMES[roleId] || "Usuario";
  };

  const getUserArea = () => {
    const roleId = getUserRole();
    return ROLE_AREAS[roleId] || "Sin Área";
  };

  const hasPermission = (module, action) => {
    const roleId = getUserRole();
    if (!roleId || !PERMISSIONS[roleId]) return false;

    const modulePermissions = PERMISSIONS[roleId][module];
    if (!modulePermissions) return false;

    return modulePermissions[action] === true;
  };

  const canAccessModule = (module) => {
    const roleId = getUserRole();
    if (!roleId || !PERMISSIONS[roleId]) return false;

    const modulePermissions = PERMISSIONS[roleId][module];
    if (!modulePermissions) return false;

    // Si tiene al menos un permiso en el módulo, puede acceder
    return Object.values(modulePermissions).some(
      (permission) => permission === true
    );
  };

  const isAdmin = () => {
    return getUserRole() === ROLES.ADMINISTRADOR;
  };

  const isOperador = () => {
    return getUserRole() === ROLES.OPERADOR;
  };

  const isGenerador = () => {
    return getUserRole() === ROLES.GENERADOR;
  };

  const isCalidad = () => {
    return getUserRole() === ROLES.CALIDAD;
  };

  const isTI = () => {
    return getUserArea() === AREAS.TI;
  };

  const isPlaneacion = () => {
    return getUserArea() === AREAS.PLANEACION;
  };

  // Obtener las secciones disponibles según el rol y área
  const getAvailableSections = () => {
    const roleId = getUserRole();
    if (!roleId) return [];

    const sections = [];

    // TI (Administrador) - Todas las secciones
    if (isTI()) {
      sections.push("articulos", "usuarios", "roles", "logs", "impresiones", "defectivos");
    }
    // Planeación (Generador y Operador) - Solo artículos e impresiones
    else if (isPlaneacion()) {
      if (canAccessModule("articulos")) {
        sections.push("articulos");
      }
      if (canAccessModule("impresiones")) {
        sections.push("impresiones");
      }
    }
    // Calidad - Solo defectivos
    else if (isCalidad()) {
      if (canAccessModule("defectivos")) {
        sections.push("defectivos");
      }
    }

    return sections;
  };

  // Obtener módulos agrupados por área
  const getModulesByArea = () => {
    const modules = {
      [AREAS.TI]: [],
      [AREAS.PLANEACION]: [],
      [AREAS.CALIDAD]: []
    };

    // Módulos de TI
    if (canAccessModule("usuarios")) {
      modules[AREAS.TI].push({
        id: "usuarios",
        name: "Usuarios", 
        available: canAccessModule("usuarios")
      });
    }
    
    if (canAccessModule("roles")) {
      modules[AREAS.TI].push({
        id: "roles",
        name: "Roles",
        available: canAccessModule("roles")
      });
    }
    
    if (canAccessModule("logs")) {
      modules[AREAS.TI].push({
        id: "logs", 
        name: "Logs",
        available: canAccessModule("logs")
      });
    }

    // Módulos de Planeación
    if (canAccessModule("articulos")) {
      modules[AREAS.PLANEACION].push({
        id: "articulos",
        name: "Artículos",
        available: canAccessModule("articulos")
      });
    }
    
    if (canAccessModule("impresiones")) {
      modules[AREAS.PLANEACION].push({
        id: "impresiones", 
        name: "Impresiones",
        available: canAccessModule("impresiones")
      });
    }

    // Módulos de Calidad
    if (canAccessModule("defectivos")) {
      modules[AREAS.CALIDAD].push({
        id: "defectivos",
        name: "Defectivos", 
        available: canAccessModule("defectivos")
      });
    }

    return modules;
  };

  const value = {
    userRole: getUserRole(),
    roleName: getRoleName(),
    userArea: getUserArea(),
    hasPermission,
    canAccessModule,
    isAdmin,
    isOperador,
    isGenerador,
    isCalidad,
    isTI,
    isPlaneacion,
    getAvailableSections,
    getModulesByArea,
    ROLES,
    ROLE_NAMES,
    AREAS,
    ROLE_AREAS,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};