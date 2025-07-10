import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from "lucide-react";

// Hook para manejar notificaciones
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 5000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message, duration) => addToast(message, "success", duration);
  const error = (message, duration) => addToast(message, "error", duration);
  const warning = (message, duration) => addToast(message, "warning", duration);
  const info = (message, duration) => addToast(message, "info", duration);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};

// Componente individual de Toast
const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animación de entrada
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <AlertCircle size={20} />;
      case "warning":
        return <AlertTriangle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case "success":
        return {
          background: "var(--success-50)",
          border: "var(--success-600)",
          text: "var(--success-800)",
          icon: "var(--success-600)",
        };
      case "error":
        return {
          background: "var(--error-50)",
          border: "var(--error-600)",
          text: "var(--error-800)",
          icon: "var(--error-600)",
        };
      case "warning":
        return {
          background: "var(--warning-50)",
          border: "var(--warning-600)",
          text: "var(--warning-800)",
          icon: "var(--warning-600)",
        };
      default:
        return {
          background: "var(--gray-50)",
          border: "var(--gray-600)",
          text: "var(--gray-800)",
          icon: "var(--gray-600)",
        };
    }
  };

  const colors = getColors();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "1rem",
        backgroundColor: colors.background,
        border: `1px solid ${colors.border}`,
        borderRadius: "var(--border-radius-lg)",
        boxShadow: "var(--shadow-lg)",
        marginBottom: "0.5rem",
        minWidth: "300px",
        maxWidth: "500px",
        transform: isVisible ? "translateX(0)" : "translateX(100%)",
        opacity: isVisible ? 1 : 0,
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onClick={handleRemove}
    >
      <div style={{ color: colors.icon, flexShrink: 0 }}>{getIcon()}</div>

      <div
        style={{
          flex: 1,
          color: colors.text,
          fontSize: "0.875rem",
          fontWeight: "500",
        }}
      >
        {toast.message}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRemove();
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: colors.icon,
          opacity: 0.7,
          transition: "opacity 0.2s ease",
          padding: "0.25rem",
          borderRadius: "var(--border-radius)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => (e.target.style.opacity = 1)}
        onMouseLeave={(e) => (e.target.style.opacity = 0.7)}
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Contenedor de Toasts
export const ToastContainer = ({ toasts, onRemoveToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "2rem",
        right: "2rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemoveToast} />
      ))}
    </div>
  );
};

// Componente completo de Toast
const Toast = () => {
  const { toasts, removeToast } = useToast();

  return <ToastContainer toasts={toasts} onRemoveToast={removeToast} />;
};

export default Toast;
