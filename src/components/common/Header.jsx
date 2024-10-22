import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";  // Importa el contexto de autenticación

export default function Header() {
  const [navbarCollapse, setNavbarCollapse] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { userData, logout } = useAuth();  // Extraemos los datos del usuario y la función de logout del contexto

  // Verificación de URL del avatar: externa o local
  const avatarUrl = userData?.AVATAR_URL?.startsWith('http')
    ? userData.AVATAR_URL  // URL externa (Google, etc.)
    : `http://localhost:3000${userData?.AVATAR_URL}`;  // URL local, añadir el host

  const handleMouseEnter = (itemId) => {
    setActiveDropdown(itemId);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const handleUserMouseEnter = () => {
    setShowUserDropdown(true);
  };

  const handleUserMouseLeave = () => {
    setShowUserDropdown(false);
  };

  return (
    <>
      <div className="container-fluid bg-dark px-0">
        <div className="row gx-0">
          <div className="col-lg-3 bg-dark d-none d-lg-block">
            <Link
              to="/"
              className="navbar-brand w-100 h-100 m-0 p-0 d-flex align-items-center justify-content-center"
            >
              {/* Aquí ajustamos el tamaño del logo */}
              <img
                src="/assets/img/petlogo.png"
                alt="Petheaven Logo"
                style={{ width: "85px", height: "80px", marginRight: "5px" }}  // Ajusta el tamaño del logo aquí
              />
              <h1 className="m-0 text-primary text-uppercase">PETHEAVEN</h1>
            </Link>
          </div>
          <div className="col-lg-9">
            <nav className="navbar navbar-expand-lg bg-dark navbar-dark p-3 p-lg-0">
              <Link to="/" className="navbar-brand d-block d-lg-none d-flex align-items-center">
                {/* Aquí ajustamos el tamaño del logo para pantallas pequeñas */}
                <img
                  src="/assets/img/petlogo.png"
                  alt="Petheaven Logo"
                  style={{ width: "60px", height: "60px", marginRight: "10px" }}  // Ajusta el tamaño del logo aquí para pantallas pequeñas
                />
                <h1 className="m-0 text-primary text-uppercase">Petheaven</h1>
              </Link>
              <button
                type="button"
                className="navbar-toggler"
                onClick={() => setNavbarCollapse(!navbarCollapse)}
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div
                className={
                  navbarCollapse
                    ? "navbar-collapse justify-content-around navbarCollapse"
                    : "collapse navbar-collapse justify-content-around"
                }
              >
                <div className="navbar-nav mr-auto py-0">
                  {/* Condición para mostrar diferentes opciones según el rol */}
                  {userData?.rol === 'admin' ? (
                    <>
                      {/* Opciones para administradores */}
                      <Link to="/admin/graficas" className="nav-item nav-link">Dashboard Admin</Link>
                      <Link to="/admin/usuarios" className="nav-item nav-link">G Usuarios</Link>
                      <Link to="/admin/servicios" className="nav-item nav-link">G Servicios</Link>
                      <Link to="/admin/habitaciones" className="nav-item nav-link">G Habitaciones</Link>
                      <Link to="/admin/productos" className="nav-item nav-link">G Productos</Link>
                    </>
                  ) : (
                    <>
                      {/* Opciones para usuarios normales */}
                      <Link to="/" className="nav-item nav-link">Inicio</Link>
                      <Link to="/about" className="nav-item nav-link">Acerca de</Link>
                      <Link to="/services" className="nav-item nav-link">Servicios</Link>
                      <Link to="/rooms" className="nav-item nav-link">Habitaciones</Link>
                      <div
                        className="nav-item dropdown"
                        onMouseEnter={() => handleMouseEnter(5)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Link className="nav-link dropdown-toggle">Páginas</Link>
                        <div
                          className={`dropdown-menu rounded-0 m-0 ${
                            activeDropdown === 5 ? "show" : ""
                          }`}
                        >
                          <Link to="/booking" className="dropdown-item">Agendar</Link>
                          <Link to="/ReservasActivas" className="dropdown-item">Reservas Activas</Link>
                          <Link to="/team" className="dropdown-item">Nuestro Equipo</Link>
                          <Link to="/testimonial" className="dropdown-item">Testimonios</Link>
                        </div>
                      </div>
                      <Link to="/contact" className="nav-item nav-link">Contáctanos</Link>
                    </>
                  )}
                </div>

                {/* Sección de usuario */}
                <div
                  className="nav-item dropdown"
                  onMouseEnter={handleUserMouseEnter}
                  onMouseLeave={handleUserMouseLeave}
                >
                  {/* Mostrar el avatar del usuario si existe, de lo contrario una imagen por defecto */}
                  <img
                    src={avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"}  // Usar avatarUrl calculado
                    alt="User Avatar"
                    className="rounded-circle"
                    style={{ width: "40px", height: "40px", cursor: "pointer", marginRight: "10px" }}
                  />
                  <span className="text-white">{userData?.NOMBRE_USUARIO || "Usuario"}</span>
                  <div
                    className={`dropdown-menu dropdown-menu-end ${
                      showUserDropdown ? "show" : ""
                    }`}
                    style={{
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #ddd",
                      padding: "10px",
                      borderRadius: "5px"
                    }}
                  >
                    <Link to="/UserForm" className="dropdown-item">
                      Configuración de perfil
                    </Link>
                    <Link to="/MascotaForm" className="dropdown-item">
                      Tus Mascotas
                    </Link>
                    <button className="dropdown-item" onClick={logout}>
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
