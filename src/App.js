import React from "react";
import "./css/style.css";
import "./css/bootstrap.min.css";
import "./css/animate.css";
import "./css/animate.min.css";
import "./App.css";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./AuthContext";  // Proveedor de autenticación
import { CartProvider } from "./pages/CartContext"; // Proveedor del carrito
import ProtectedRoute from "./ProtectedRoute";  // Componente para proteger las rutas

// Páginas principales
import {
  Home,
  Booking,
  AboutUs,
  Contact,
  PageNotFound,
  Room,
  Services,
  Team,
  Testimonial,
  ReservasActivas,
  UserForm,
  MascotaForm,
  G_productos,
  G_servicio,
  G_usuario,
  Graficas,
  G_habitacion,

} from "./pages/index";
import RoomDetails from "./components/RoomDetails";  // Detalles de habitación
import Login from "./login";  // Componente Login

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider> {/* Aseguramos que CartProvider envuelva la aplicación */}
          <Routes>
            {/* Ruta para el login que no necesita protección */}
            <Route path="/login" element={<Login />} />

            {/* Ruta protegida: envuelve el resto del contenido */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  {/* Envolver el contenido con Header y Footer */}
                  <div className="app-container">
                    <Header />
                    <div className="content-container">
                      {/* Contenedor principal de las rutas */}
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/booking" element={<Booking />} />
                        <Route path="/ReservasActivas" element={<ReservasActivas />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/testimonial" element={<Testimonial />} />
                        <Route path="/rooms" element={<Room />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/room/:id" element={<RoomDetails />} />
                        <Route path="/UserForm" element={<UserForm />} />
                        <Route path="/MascotaForm" element={<MascotaForm />} />
                        <Route path="/admin/habitaciones" element={<G_habitacion />} />
                        <Route path="/admin/productos" element={<G_productos />} />
                        <Route path="/admin/servicios" element={<G_servicio />} />
                        <Route path="/admin/usuarios" element={<G_usuario />} />
                        <Route path="/admin/graficas" element={<Graficas />} />

                        {/* Rutas públicas (si las necesitas) */}
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/contact" element={<Contact />} />

                        {/* Ruta de página no encontrada */}
                        <Route path="/*" element={<PageNotFound />} />
                      </Routes>
                    </div>
                    <Footer />
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
