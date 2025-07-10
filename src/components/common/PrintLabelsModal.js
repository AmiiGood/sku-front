import React, { useState } from "react";
import { Printer, Plus, Minus, Eye, X } from "lucide-react";

const LabelPreview = ({ articulo, cantidad }) => {
  const currentDate = new Date().toLocaleDateString("es-ES");
  const qrCode = `${currentDate}$${articulo.SKU}$${articulo.QuantityPerLU}`;

  return (
    <div
      style={{
        border: "2px dashed var(--gray-300)",
        borderRadius: "var(--border-radius)",
        padding: "1rem",
        backgroundColor: "var(--gray-50)",
        minHeight: "200px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        fontFamily: "monospace",
        fontSize: "0.75rem",
      }}
    >
      {/* Header de la etiqueta */}
      <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        <div
          style={{
            fontSize: "0.875rem",
            fontWeight: "bold",
            color: "var(--black)",
            marginBottom: "0.25rem",
          }}
        >
          EXTRALIGHT
        </div>
        <div
          style={{
            fontSize: "0.625rem",
            color: "var(--gray-600)",
          }}
        >
          Sistema de Inventario
        </div>
      </div>

      {/* Información principal */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontWeight: "bold", color: "var(--black)" }}>
            SKU: {articulo.SKU}
          </div>
          <div
            style={{
              color: "var(--gray-700)",
              fontSize: "0.7rem",
              marginTop: "0.25rem",
              lineHeight: "1.2",
            }}
          >
            {articulo.Descripcion}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
            fontSize: "0.65rem",
            color: "var(--gray-600)",
          }}
        >
          <div>
            <strong>Color:</strong> {articulo.ColorCode}
          </div>
          <div>
            <strong>Talla:</strong> {articulo.Size}
          </div>
          <div>
            <strong>Grupo:</strong> {articulo.GroupCode}
          </div>
          <div>
            <strong>Cant/LU:</strong> {articulo.QuantityPerLU}
          </div>
        </div>
      </div>

      {/* Código QR simulado */}
      <div
        style={{
          textAlign: "center",
          marginTop: "0.5rem",
          paddingTop: "0.5rem",
          borderTop: "1px solid var(--gray-200)",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            backgroundColor: "var(--black)",
            margin: "0 auto 0.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.5rem",
            color: "var(--white)",
            fontWeight: "bold",
          }}
        >
          QR
        </div>
        <div
          style={{
            fontSize: "0.5rem",
            color: "var(--gray-500)",
            wordBreak: "break-all",
          }}
        >
          {qrCode}
        </div>
        <div
          style={{
            fontSize: "0.6rem",
            color: "var(--gray-600)",
            marginTop: "0.25rem",
          }}
        >
          {currentDate}
        </div>
      </div>

      {/* Indicador de cantidad */}
      {cantidad > 1 && (
        <div
          style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem",
            backgroundColor: "var(--primary-600)",
            color: "var(--white)",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: "bold",
          }}
        >
          {cantidad}
        </div>
      )}
    </div>
  );
};

const PrintLabelsModal = ({ isOpen, onClose, articulo, onPrint }) => {
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !articulo) return null;

  const handleCantidadChange = (nuevaCantidad) => {
    if (nuevaCantidad >= 1 && nuevaCantidad <= 100) {
      setCantidad(nuevaCantidad);
    }
  };

  const handlePrint = async () => {
    setLoading(true);
    try {
      await onPrint(articulo, cantidad);
      onClose();
    } catch (error) {
      console.error("Error printing labels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePrint();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: "600px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyPress}
        tabIndex="0"
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Printer size={20} />
            <h2 className="modal-title">Imprimir Etiquetas</h2>
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
              padding: "1rem",
              backgroundColor: "var(--gray-50)",
              borderRadius: "var(--border-radius)",
              border: "1px solid var(--gray-200)",
            }}
          >
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "var(--black)",
                }}
              >
                {articulo.Descripcion}
              </h3>
              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontSize: "0.875rem",
                  color: "var(--gray-600)",
                }}
              >
                SKU: {articulo.SKU} • {articulo.ColorCode} • Talla{" "}
                {articulo.Size}
              </p>
            </div>
          </div>

          {/* Selector de cantidad */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label className="form-label" style={{ marginBottom: "0.75rem" }}>
              Cantidad de etiquetas a imprimir
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                justifyContent: "center",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => handleCantidadChange(cantidad - 1)}
                disabled={cantidad <= 1}
                style={{
                  minWidth: "40px",
                  height: "40px",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Minus size={16} />
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={cantidad}
                  onChange={(e) =>
                    handleCantidadChange(parseInt(e.target.value) || 1)
                  }
                  style={{
                    width: "80px",
                    textAlign: "center",
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    padding: "0.5rem",
                    border: "2px solid var(--primary-600)",
                    borderRadius: "var(--border-radius)",
                    backgroundColor: "var(--white)",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--gray-600)",
                    minWidth: "60px",
                  }}
                >
                  {cantidad === 1 ? "etiqueta" : "etiquetas"}
                </span>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => handleCantidadChange(cantidad + 1)}
                disabled={cantidad >= 100}
                style={{
                  minWidth: "40px",
                  height: "40px",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Botones de cantidad rápida */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            >
              {[1, 5, 10, 25, 50].map((num) => (
                <button
                  key={num}
                  className={`btn ${
                    cantidad === num ? "btn-primary" : "btn-secondary"
                  }`}
                  onClick={() => setCantidad(num)}
                  style={{
                    minWidth: "40px",
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.5rem",
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Vista previa */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <Eye size={16} />
              <label className="form-label" style={{ margin: 0 }}>
                Vista previa de la etiqueta
              </label>
            </div>
            <LabelPreview articulo={articulo} cantidad={cantidad} />
          </div>

          {/* Información adicional */}
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              backgroundColor: "var(--gray-50)",
              borderRadius: "var(--border-radius)",
              fontSize: "0.75rem",
              color: "var(--gray-600)",
              textAlign: "center",
            }}
          >
            💡 Las etiquetas incluyen código QR para trazabilidad y fecha de
            generación
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
            onClick={handlePrint}
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Printer size={16} />
            {loading
              ? "Imprimiendo..."
              : `Imprimir ${cantidad} ${
                  cantidad === 1 ? "etiqueta" : "etiquetas"
                }`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintLabelsModal;
