import React, { useState } from "react";
import { Printer, Plus, Minus, Eye, X } from "lucide-react";

const LabelPreview = ({ articulo, cantidad }) => {
  const now = new Date();
  const fecha = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const [year, month, day] = fecha.split("-");
  const fechaFormateada = `${day}${month}${year.slice(2)}$${articulo.SKU}$${
    articulo.QuantityPerLU
  }`;
  const numeroEtiqueta = 1; // Para preview, usamos 1
  const codigoFinal = `${fechaFormateada}$${numeroEtiqueta
    .toString()
    .padStart(3, "0")}`;
  const fechaFormateadaBonita = `${day}/${month}/${year}`;
  const hora = now.toTimeString().split(" ")[0];
  const fechaHora = `${fechaFormateadaBonita} ${hora}`;

  return (
    <div
      style={{
        border: "2px solid var(--gray-400)",
        borderRadius: "4px",
        padding: "0",
        backgroundColor: "var(--white)",
        width: "400px",
        height: "280px",
        position: "relative",
        fontFamily: "monospace",
        fontSize: "14px",
        margin: "0 auto",
        overflow: "hidden",
      }}
    >
      {/* Simulación exacta del layout ZPL */}

      {/* SKU - Posición ^FO50,50 */}
      <div
        style={{
          position: "absolute",
          left: "25px",
          top: "25px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "var(--black)",
        }}
      >
        SKU: {articulo.SKU}
      </div>

      {/* Descripción - Posición ^FO50,100 */}
      <div
        style={{
          position: "absolute",
          left: "25px",
          top: "50px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "var(--black)",
          maxWidth: "280px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        Descrip: {articulo.Descripcion}
      </div>

      {/* Color - Posición ^FO50,150 */}
      <div
        style={{
          position: "absolute",
          left: "25px",
          top: "75px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "var(--black)",
        }}
      >
        Color: {articulo.ColorCode}
      </div>

      {/* Size - Posición ^FO50,200 */}
      <div
        style={{
          position: "absolute",
          left: "25px",
          top: "100px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "var(--black)",
        }}
      >
        Size: {articulo.Size}
      </div>

      {/* Qty - Posición ^FO50,250 */}
      <div
        style={{
          position: "absolute",
          left: "25px",
          top: "125px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "var(--black)",
        }}
      >
        Qty: {articulo.QuantityPerLU}
      </div>

      {/* Fecha y hora - Posición ^FO50,300 */}
      <div
        style={{
          position: "absolute",
          left: "25px",
          top: "150px",
          fontSize: "12px",
          color: "var(--black)",
        }}
      >
        {fechaHora}
      </div>

      {/* Código QR - Posición ^FO350,120 */}
      <div
        style={{
          position: "absolute",
          right: "30px",
          top: "60px",
          width: "80px",
          height: "80px",
          backgroundColor: "var(--black)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: "var(--white)",
          fontWeight: "bold",
          border: "2px solid var(--black)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div>QR</div>
          <div style={{ fontSize: "8px" }}>CODE</div>
        </div>
      </div>

      {/* Código debajo del QR - Posición ^FO280,300 */}
      <div
        style={{
          position: "absolute",
          right: "30px",
          top: "150px",
          fontSize: "10px",
          color: "var(--black)",
          textAlign: "center",
          width: "80px",
          wordBreak: "break-all",
          lineHeight: "1.1",
        }}
      >
        {codigoFinal}
      </div>

      {/* Línea separadora inferior - Posición ^FO50,370 */}
      <div
        style={{
          position: "absolute",
          left: "25px",
          bottom: "40px",
          width: "350px",
          height: "3px",
          backgroundColor: "var(--black)",
        }}
      />

      {/* Indicador de cantidad */}
      {cantidad > 1 && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            backgroundColor: "var(--primary-600)",
            color: "var(--white)",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "bold",
            zIndex: 10,
          }}
        >
          {cantidad}
        </div>
      )}

      {/* Marca de agua "PREVIEW" */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-45deg)",
          fontSize: "24px",
          color: "rgba(0, 0, 0, 0.1)",
          fontWeight: "bold",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        PREVIEW
      </div>
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
        style={{ maxWidth: "700px", width: "95%" }}
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
                Vista previa de la etiqueta (Zebra ZPL)
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
            💡 Preview basado en el formato ZPL real de la impresora Zebra •
            Incluye código QR único con trazabilidad completa
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
