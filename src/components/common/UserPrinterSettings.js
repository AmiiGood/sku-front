import React, { useState, useEffect } from "react";
import {
  Printer,
  TestTube,
  CheckCircle,
  XCircle,
  Settings,
  Save,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useToastContext } from "../../contexts/ToastContext";

const UserPrinterSettings = ({ isOpen, onClose }) => {
  const { request } = useApi();
  const toast = useToastContext();

  const [formData, setFormData] = useState({
    printer_ip: "",
    printer_port: 9100,
    printer_enabled: true,
  });

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCurrentConfig();
    }
  }, [isOpen]);

  const loadCurrentConfig = async () => {
    try {
      setInitialLoad(true);
      const response = await request("/api/articulos/me/printer-config");

      if (response.success) {
        setFormData({
          printer_ip: response.data.printer_ip || "",
          printer_port: response.data.printer_port || 9100,
          printer_enabled: response.data.printer_enabled ?? true,
        });
      }
    } catch (error) {
      console.error("Error loading printer config:", error);
      // Si no hay configuración, mantener valores por defecto
      setFormData({
        printer_ip: "",
        printer_port: 9100,
        printer_enabled: true,
      });
    } finally {
      setInitialLoad(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await request("/api/articulos/me/printer-config", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      toast.success(
        "Configuración de impresora actualizada exitosamente",
        3000
      );
      onClose();
    } catch (error) {
      console.error("Error updating printer config:", error);
      toast.error("Error al actualizar la configuración de impresora", 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.printer_ip) {
      toast.error("Por favor ingresa una IP de impresora", 3000);
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);

      const response = await request("/api/printer/test-my-printer", {
        method: "POST",
      });

      if (response.success) {
        setTestResult({
          success: true,
          message: "Conexión exitosa con tu impresora",
        });
        toast.success("Conexión con tu impresora exitosa", 3000);
      } else {
        setTestResult({
          success: false,
          message: "Error al conectar con tu impresora",
        });
        toast.error("Error al conectar con tu impresora", 3000);
      }
    } catch (error) {
      console.error("Error testing printer:", error);
      setTestResult({
        success: false,
        message: error.message || "Error al probar la conexión",
      });
      toast.error("Error al probar tu impresora: " + error.message, 5000);
    } finally {
      setTesting(false);
    }
  };

  const isValidIP = (ip) => {
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: "500px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyPress}
        tabIndex="0"
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Settings size={20} />
            <h2 className="modal-title">Mi Configuración de Impresora</h2>
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            ×
          </button>
        </div>

        {initialLoad ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Cargando configuración...
          </div>
        ) : (
          <div style={{ marginBottom: "1.5rem" }}>
            {/* Información */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1.5rem",
                padding: "1rem",
                backgroundColor: "var(--primary-50)",
                borderRadius: "var(--border-radius)",
                border: "1px solid var(--primary-200)",
              }}
            >
              <Printer size={20} style={{ color: "var(--primary-600)" }} />
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "var(--black)",
                  }}
                >
                  Configuración Personal
                </h3>
                <p
                  style={{
                    margin: "0.25rem 0 0",
                    fontSize: "0.875rem",
                    color: "var(--gray-600)",
                  }}
                >
                  Configura tu impresora personal para imprimir etiquetas
                </p>
              </div>
            </div>

            {/* Configuración de IP */}
            <div className="form-group">
              <label className="form-label">IP de Impresora *</label>
              <input
                type="text"
                className="form-input"
                placeholder="192.168.1.100"
                value={formData.printer_ip}
                onChange={(e) =>
                  setFormData({ ...formData, printer_ip: e.target.value })
                }
                style={{
                  borderColor:
                    formData.printer_ip && !isValidIP(formData.printer_ip)
                      ? "var(--error-600)"
                      : "var(--gray-300)",
                }}
              />
              {formData.printer_ip && !isValidIP(formData.printer_ip) && (
                <p
                  style={{
                    color: "var(--error-600)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                  }}
                >
                  Formato de IP no válido
                </p>
              )}
            </div>

            {/* Configuración de Puerto */}
            <div className="form-group">
              <label className="form-label">Puerto de Impresora</label>
              <input
                type="number"
                className="form-input"
                placeholder="9100"
                value={formData.printer_port}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    printer_port: parseInt(e.target.value) || 9100,
                  })
                }
                min="1"
                max="65535"
              />
            </div>

            {/* Estado de la impresora */}
            <div className="form-group">
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="checkbox"
                  checked={formData.printer_enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      printer_enabled: e.target.checked,
                    })
                  }
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "var(--primary-600)",
                  }}
                />
                <span className="form-label" style={{ margin: 0 }}>
                  Impresora habilitada
                </span>
              </label>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--gray-600)",
                  marginTop: "0.25rem",
                  marginLeft: "1.5rem",
                }}
              >
                Si está deshabilitada, no podrás imprimir etiquetas
              </p>
            </div>

            {/* Botón de prueba */}
            {formData.printer_ip && isValidIP(formData.printer_ip) && (
              <div style={{ marginTop: "1rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleTestConnection}
                  disabled={testing}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <TestTube size={16} />
                  {testing ? "Probando conexión..." : "Probar Mi Impresora"}
                </button>
              </div>
            )}

            {/* Resultado de la prueba */}
            {testResult && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginTop: "1rem",
                  padding: "0.75rem",
                  borderRadius: "var(--border-radius)",
                  backgroundColor: testResult.success
                    ? "var(--success-50)"
                    : "var(--error-50)",
                  border: `1px solid ${
                    testResult.success
                      ? "var(--success-200)"
                      : "var(--error-200)"
                  }`,
                  color: testResult.success
                    ? "var(--success-800)"
                    : "var(--error-800)",
                }}
              >
                {testResult.success ? (
                  <CheckCircle size={16} />
                ) : (
                  <XCircle size={16} />
                )}
                <span style={{ fontSize: "0.875rem" }}>
                  {testResult.message}
                </span>
              </div>
            )}

            {/* Información adicional */}
            <div
              style={{
                marginTop: "1.5rem",
                padding: "0.75rem",
                backgroundColor: "var(--gray-50)",
                borderRadius: "var(--border-radius)",
                fontSize: "0.75rem",
                color: "var(--gray-600)",
              }}
            >
              <strong>Información:</strong>
              <ul style={{ margin: "0.5rem 0", paddingLeft: "1rem" }}>
                <li>Consulta con tu administrador la IP de tu impresora</li>
                <li>El puerto por defecto para impresoras Zebra es 9100</li>
                <li>La impresora debe estar conectada a la misma red</li>
                <li>Esta configuración solo afecta tu usuario</li>
              </ul>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={
              loading ||
              initialLoad ||
              (formData.printer_ip && !isValidIP(formData.printer_ip))
            }
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Save size={16} />
            {loading ? "Guardando..." : "Guardar Configuración"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPrinterSettings;
