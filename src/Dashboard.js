import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica si el token existe
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");  // Redirige a login si no hay token
    } else {
      // Verificar si el token es válido
      axios
        .get("http://localhost:3000/api/dashboard", {
          headers: { "x-access-token": token },
        })
        .then((response) => {
          console.log("Usuario autenticado", response.data);
        })
        .catch((error) => {
          console.error("Error en la autenticación:", error);
          localStorage.removeItem("token");  // Remover token si es inválido
          navigate("/login");
        });
    }
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard Protegido</h1>
      <p>Bienvenido a la página protegida</p>
    </div>
  );
}
