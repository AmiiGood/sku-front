import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const ExtraLightLogo = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      marginBottom: "2rem",
    }}
  >
    <img
      src="/images/dbxextralight.png"
      alt="EXTRALIGHT"
      style={{
        width: "100px",
        objectFit: "contain",
        filter: "var(--logo-filter, none)", // Para poder invertir en modo oscuro
      }}
    />
  </div>
);

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const result = await login(correo, contrasena);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <ExtraLightLogo />
          <h1 className="login-title">Iniciar Sesión</h1>
          <p className="login-subtitle">Accede a tu sistema de inventario</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-input"
              placeholder="usuario@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              onKeyPress={handleKeyPress}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              onKeyPress={handleKeyPress}
              required
            />
          </div>

          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            style={{
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.75rem 1rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
