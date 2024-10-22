  import React, { createContext, useState, useEffect, useCallback } from "react";
  import { useNavigate } from "react-router-dom";
  import {jwtDecode} from "jwt-decode";  // Asegúrate de que la importación es correcta
  import axios from "axios";

  const AuthContext = createContext();

  export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);  // Inicialmente en null
    const [userData, setUserData] = useState(null);  // Almacena los datos del usuario
    const navigate = useNavigate();

    const obtenerDatosUsuario = useCallback(async (token) => {
      try {
        const response = await axios.get("http://localhost:3000/api/me", {
          headers: { "x-access-token": token },
        });
        setUserData({
          ...response.data,
          rol: response.data.ROL,  // Usamos ROL que viene en mayúsculas desde la API
        });
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUserData(null);
        navigate("/login");
      }
    }, [navigate]);
    
    

    useEffect(() => {
      const token = localStorage.getItem("token");
      console.log("Token en localStorage: ", token);  // Verificar el token en localStorage

      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp > currentTime) {
            setIsAuthenticated(true);
            console.log("Token válido, autenticación establecida.");
            obtenerDatosUsuario(token);  // Obtener los datos del usuario
          } else {
            console.log("Token expirado, redirigiendo al login.");
            localStorage.removeItem("token");
            setIsAuthenticated(false);
            setUserData(null);
            navigate("/login");
          }
        } catch (error) {
          console.error("Error al decodificar el token:", error);
          setIsAuthenticated(false);
          localStorage.removeItem("token");
          navigate("/login");
        }
      } else {
        setIsAuthenticated(false);  // Si no hay token en localStorage, no está autenticado
        navigate("/login");
      }
    }, [navigate, obtenerDatosUsuario]);  // Agregamos obtenerDatosUsuario como dependencia del useEffect

    const logout = () => {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUserData(null);
      navigate("/login");
    };

    return (
      <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, userData, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };

  export const useAuth = () => React.useContext(AuthContext);
