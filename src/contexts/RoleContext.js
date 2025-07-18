import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

// Definición de roles y permisos
export const ROLES = {
  ADMINISTRADOR: 2,
  OPERADOR: 5,
  GENERADOR: 6
};

export const ROLE_NAMES = {
  [ROLES.ADMINISTRADOR]: 'Administrador',
  [ROLES.OPERADOR]: 'Operador',
  [ROLES.GENERADOR]: 'Generador'
};

// Definición de permisos por rol
const PERMISSIONS = {
  [ROLES.ADMINISTRADOR]: {
    articulos: {
      read: true,
      create: true,
      update: true,
      delete: true,
      print: true
    },
    usuarios: {
      read: true,
      create: true,
      update: true,
      delete: true
    },
    roles: {
      read: true,
      create: true,
      update: true,
      delete: true
    },
    logs: {
      read: true,
      delete: true
    },
    impresiones: {
      read: true
    }
  },
  [ROLES.OPERADOR]: {
    articulos: {
      read: true,
      create: false,
      update: false,
      delete: false,
      print: true
    },
    usuarios: {
      read: false,
      create: false,
      update: false,
      delete: false
    },
    roles: {
      read: false,
      create: false,
      update: false,
      delete: false
    },
    logs: {
      read: false,
      delete: false
    },
    impresiones: {
      read: true
    }
  },
  [ROLES.GENERADOR]: {
    articulos: {
      read: true,
      create: true,
      update: true,
      delete: false,
      print: false
    },
    usuarios: {
      read: false,
      create: false,
      update: false,
      delete: false
    },
    roles: {
      read: false,
      create: false,
      update: false,
      delete: false
    },
    logs: {
      read: false,
      delete: false
    },
    impresiones: {
      read: false
    }
  }
};

export const RoleProvider = ({ children }) => {
  const { user } = useAuth();
  
  const getUserRole = () => {
    if (!user || !user.rol_id) return null;
    return user.rol_id;
  };

  const getRoleName = () => {
    const roleId = getUserRole();
    return ROLE_NAMES[roleId] || 'Usuario';
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
    return Object.values(modulePermissions).some(permission => permission === true);
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

  // Obtener las secciones disponibles según el rol
  const getAvailableSections = () => {
    const roleId = getUserRole();
    if (!roleId) return [];

    const sections = [];

    if (canAccessModule('articulos')) {
      sections.push('articulos');
    }
    
    if (canAccessModule('usuarios')) {
      sections.push('usuarios');
    }
    
    if (canAccessModule('roles')) {
      sections.push('roles');
    }
    
    if (canAccessModule('logs')) {
      sections.push('logs');
    }
    
    if (canAccessModule('impresiones')) {
      sections.push('impresiones');
    }

    return sections;
  };

  const value = {
    userRole: getUserRole(),
    roleName: getRoleName(),
    hasPermission,
    canAccessModule,
    isAdmin,
    isOperador,
    isGenerador,
    getAvailableSections,
    ROLES,
    ROLE_NAMES
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};