import React, { useState, useEffect } from "react";
import {
  Printer,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useRole } from "../../contexts/RoleContext";

const PrinterStatusWidget = () => {
  const { request } = useApi();
  const { hasPermission } = useRole();
  const [printerStatus, setPrinterStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Solo mostrar si el usuario puede imprimir
  const canPrint = hasPermission("articulos", "print");

  useEffect(() => {
    if (canPrint) {
      checkPrinterStatus();
    }
  }, [canPrint]);

  const checkPrinterStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await request("/api/printer/test-my-printer", {
        method: "POST",
      });

      if (response.success) {
        setPrinterStatus({
          status: "connected",
          message: "Impresora conectada",
          config: response.data.user_config,
        });
      }
    } catch (error) {
      console.error("Error checking printer status:", error);

      if (error.message.includes("No tienes una impresora configurada")) {
        setPrinterStatus({
          status: "not_configured",
          message: "Impresora no configurada",
          config: null,
        });
      } else if (error.message.includes("Tu impresora está deshabilitada")) {
        setPrinterStatus({
          status: "disabled",
          message: "Impresora deshabilitada",
          config: null,
        });
      } else {
        setPrinterStatus({
          status: "error",
          message: "Error de conexión",
          config: null,
        });
      }
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    checkPrinterStatus();
  };

  if (!canPrint) {
    return null;
  }

  const getStatusIcon = () => {
    if (loading) {
      return <RefreshCw size={16} className="animate-spin" />;
    }

    switch (printerStatus?.status) {
      case "connected":
        return (
          <CheckCircle size={16} style={{ color: "var(--success-600)" }} />
        );
      case "not_configured":
        return (
          <AlertTriangle size={16} style={{ color: "var(--warning-600)" }} />
        );
      case "disabled":
        return <XCircle size={16} style={{ color: "var(--error-600)" }} />;
      case "error":
        return <XCircle size={16} style={{ color: "var(--error-600)" }} />;
      default:
        return <Printer size={16} style={{ color: "var(--gray-600)" }} />;
    }
  };

  const getStatusColor = () => {
    switch (printerStatus?.status) {
      case "connected":
        return {
          bg: "var(--success-50)",
          border: "var(--success-200)",
          text: "var(--success-800)",
        };
      case "not_configured":
        return {
          bg: "var(--warning-50)",
          border: "var(--warning-200)",
          text: "var(--warning-800)",
        };
      case "disabled":
      case "error":
        return {
          bg: "var(--error-50)",
          border: "var(--error-200)",
          text: "var(--error-800)",
        };
      default:
        return {
          bg: "var(--gray-50)",
          border: "var(--gray-200)",
          text: "var(--gray-800)",
        };
    }
  };

  const colors = getStatusColor();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem 1rem",
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "var(--border-radius)",
        color: colors.text,
        fontSize: "0.875rem",
        marginBottom: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {getStatusIcon()}
        <span style={{ fontWeight: "500" }}>
          {loading
            ? "Verificando..."
            : printerStatus?.message || "Estado desconocido"}
        </span>
      </div>

      {printerStatus?.config && (
        <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>
          {printerStatus.config.printer_ip}:{printerStatus.config.printer_port}
        </span>
      )}

      <button
        onClick={handleRefresh}
        disabled={loading}
        style={{
          marginLeft: "auto",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          padding: "0.25rem",
          borderRadius: "var(--border-radius)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: loading ? 0.5 : 0.7,
          transition: "opacity 0.2s ease",
        }}
        onMouseEnter={(e) => !loading && (e.target.style.opacity = 1)}
        onMouseLeave={(e) => !loading && (e.target.style.opacity = 0.7)}
        title="Actualizar estado"
      >
        <RefreshCw size={14} />
      </button>
    </div>
  );
};

export default PrinterStatusWidget;
