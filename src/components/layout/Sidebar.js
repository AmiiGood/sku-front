import React from "react";
import { Package, Users, Shield, Activity, LogOut, Printer } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

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
        filter: "var(--logo-filter, none)", // Para poder invertir en modo oscuro
      }}
    />
  </div>
);

const Sidebar = ({ currentSection, setCurrentSection }) => {
  const { logout } = useAuth();

  const navItems = [
    { id: "articulos", label: "Artículos", icon: Package },
    { id: "usuarios", label: "Usuarios", icon: Users },
    { id: "roles", label: "Roles", icon: Shield },
    { id: "logs", label: "Logs", icon: Activity },
    { id: "impresiones", label:"Impresiones", icon: Printer },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <ExtraLightLogo />
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
};

export default Sidebar;
