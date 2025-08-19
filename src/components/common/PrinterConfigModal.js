import React, { useState, useEffect } from "react";
import {
  Printer,
  TestTube,
  CheckCircle,
  XCircle,
  Settings,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useToastContext } from "../../contexts/ToastContext";

const PrinterConfigModal = ({ isOpen, onClose, usuario, onSave }) => {
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

  useEffect(() => {
    if (isOpen && usuario) {
      setFormData({
        printer_ip: usuario.printer_ip || "",
        printer_port: usuario.printer_port || 9100,
        printer_enabled: usuario.printer_enabled ?? true,
      });
      setTestResult(null);
    }
  }, [isOpen, usuario]);

  if (!isOpen || !usuario) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await request(`/api/usuarios/${usuario.id}/printer-config`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      toast.success(
        "Configuración de impresora actualizada exitosamente",
        3000
      );
      onSave();
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

      const response = await request("/api/printer/test", {
        method: "POST",
        body: JSON.stringify({
          printer_ip: formData.printer_ip,
          printer_port: formData.printer_port,
        }),
      });

      if (response.success) {
        setTestResult({
          success: true,
          message: "Conexión exitosa con la impresora",
        });
        toast.success("Conexión con la impresora exitosa", 3000);
      } else {
        setTestResult({
          success: false,
          message: "Error al conectar con la impresora",
        });
        toast.error("Error al conectar con la impresora", 3000);
      }
    } catch (error) {
      console.error("Error testing printer:", error);
      setTestResult({
        success: false,
        message: error.message || "Error al probar la conexión",
      });
      toast.error("Error al probar la impresora: " + error.message, 5000);
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
            <h2 className="modal-title">Configurar Impresora</h2>
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            ×
          </button>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          {/* Información del usuario */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.5rem",
              padding: "1rem",
              backgroundColor: "var(--gray-50)",
              borderRadius: "var(--border-radius)",
              border: "1px solid var(--gray-200)",
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
                {usuario.nombre}
              </h3>
              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontSize: "0.875rem",
                  color: "var(--gray-600)",
                }}
              >
                {usuario.correo}
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
              Si está deshabilitada, el usuario no podrá imprimir etiquetas
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
                {testing ? "Probando conexión..." : "Probar Conexión"}
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
                  testResult.success ? "var(--success-200)" : "var(--error-200)"
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
              <span style={{ fontSize: "0.875rem" }}>{testResult.message}</span>
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
              <li>La IP debe ser accesible desde el servidor</li>
              <li>El puerto por defecto para impresoras Zebra es 9100</li>
              <li>
                La prueba de conexión verifica que la impresora esté disponible
              </li>
            </ul>
          </div>
        </div>

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
              (formData.printer_ip && !isValidIP(formData.printer_ip))
            }
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Printer size={16} />
            {loading ? "Guardando..." : "Guardar Configuración"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrinterConfigModal;
