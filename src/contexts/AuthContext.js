import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Decodificar el token para obtener la información del usuario
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          token,
          id: payload.id,
          rol_id: payload.rol_id,
        });
      } catch (error) {
        console.error("Error decodificando token:", error);
        localStorage.removeItem("token");
        setToken(null);
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (correo, contrasena) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo, contrasena }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);

        // Decodificar el token para obtener la información del usuario
        try {
          const payload = JSON.parse(atob(data.token.split(".")[1]));
          setUser({
            token: data.token,
            id: payload.id,
            rol_id: payload.rol_id,
          });
        } catch (error) {
          console.error("Error decodificando token:", error);
        }

        return { success: true };
      } else {
        return {
          success: false,
          error: data.message || "Error al iniciar sesión",
        };
      }
    } catch (error) {
      return { success: false, error: "Error de conexión" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
