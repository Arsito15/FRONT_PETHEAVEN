import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import "./Login.css";

const clientId = '471447306458-j42j2q10c6b0ukglpu0bcg5kb6i9ben2.apps.googleusercontent.com';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post("http://localhost:3000/api/login", {
        correo: email,
        password,
      });
  
      if (response.data.token) {
        console.log("Token recibido: ", response.data.token);
        localStorage.setItem("token", response.data.token);
        setIsAuthenticated(true);
        navigate("/");  
      } else {
        setErrorMessage("Login fallido. Verifica tus credenciales.");
      }
    } catch (error) {
      setErrorMessage("Error al iniciar sesión. Por favor, inténtalo de nuevo.");
      console.error("Error en login tradicional:", error);
    }
  };
  
  const onSuccess = async (credentialResponse) => {
    console.log("Login exitoso con Google. Credencial recibida:", credentialResponse);

    try {
      const decodedToken = jwtDecode(credentialResponse.credential);
      const { name, picture, email } = decodedToken;

      console.log("Información decodificada del token de Google:", decodedToken);

      const res = await axios.post("http://localhost:3000/api/google-login", {
        tokenId: credentialResponse.credential,
      });

      if (res.data.token) {
        console.log("Token recibido de Google: ", res.data.token);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("avatarUrl", picture);  // Guarda la URL del avatar en localStorage
        setIsAuthenticated(true);
        navigate("/");  
      } else {
        setErrorMessage("Error en la autenticación con Google.");
      }
    } catch (error) {
      console.error("Error en autenticación con Google:", error);
      setErrorMessage("Error al autenticar con Google.");
    }
  };

  const onFailure = (error) => {
    console.error("Error en el login con Google:", error);
    setErrorMessage("Error al iniciar sesión con Google. Por favor, inténtalo de nuevo.");
  };

  return (
    <div className="login-container">
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="buttons-container">
          <button type="submit" className="btn btn-primary">Iniciar Sesión</button>

          <GoogleOAuthProvider clientId={clientId}>
            <GoogleLogin onSuccess={onSuccess} onError={onFailure} />
          </GoogleOAuthProvider>
        </div>
      </form>
    </div>
  );
}
