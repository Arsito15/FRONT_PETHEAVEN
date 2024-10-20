import React from 'react';
import { useCart } from './CartContext';  // Asegúrate de que el contexto está importado correctamente
import { useNavigate } from "react-router-dom";  // Para redirigir a la página de servicios

// Función para obtener la URL de la imagen de la habitación correctamente
const getImageUrl = (imagePath) => {
  if (imagePath && typeof imagePath === "string" && imagePath.length > 0) {
    return `http://localhost:3000${imagePath}`;
  }
  return "https://via.placeholder.com/300x200";
};

// Función para obtener la URL de la imagen de la mascota correctamente
const getPetImageUrl = (imagePath) => {
  const avatarUrl = imagePath || "https://via.placeholder.com/150";
  return avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:3000${avatarUrl}`;
};

const Cart = () => {
  const { cartItems } = useCart();  // Obtenemos los datos del carrito desde el contexto
  const navigate = useNavigate();

  // Verificamos si 'cartItems' contiene una habitación y una mascota seleccionada
  if (!cartItems.room && !cartItems.mascota) {
    return <div className="cart cart-empty">No hay habitaciones ni mascotas seleccionadas.</div>;
  }

  const handleProceedToServices = () => {
    if (cartItems.room) {
      navigate('/services');  // Redirigir a la página de servicios
    } else {
      alert("Selecciona una habitación antes de continuar.");
    }
  };

  return (
    <div className="cart">
      <h3 className="cart-title">Tu Carrito</h3>

      {/* Datos de la habitación */}
      {cartItems.room && (
        <>
          <h4>Datos de la Habitación</h4>
          <img 
            src={getImageUrl(cartItems.room.Imagenes)} 
            alt={cartItems.room.Nombre_Habitacion} 
            className="cart-room-img" 
          />
          <div className="cart-item-info">
            <p><strong>ID Habitación:</strong> {cartItems.room.Habitacion_ID}</p>
            <p><strong>Nombre Habitación:</strong> {cartItems.room.Nombre_Habitacion}</p>
            <p><strong>Precio:</strong> ${cartItems.room.Precio_Base}</p>
            <p><strong>Capacidad:</strong> {cartItems.room.Capacidad_Maxima} mascotas</p>
            <p><strong>Camas:</strong> {cartItems.room.Cantidad_Camas || "N/A"}</p>
            <p><strong>Baños Privados:</strong> {cartItems.room.Banos_Propios ? "Sí" : "No"}</p>
            <p><strong>Descripción:</strong> {cartItems.room.Descripcion}</p>
            <p><strong>Tipo de Habitación:</strong> {cartItems.room.Tipo_Habitacion}</p>
            <p><strong>Ubicación:</strong> {cartItems.room.Ubicacion}</p>
          </div>
        </>
      )}

      {/* Datos de la mascota */}
      {cartItems.mascota && (
        <>
          <h4>Datos de la Mascota</h4>
          <img 
            src={getPetImageUrl(cartItems.mascota[10])} 
            alt={cartItems.mascota[2]} 
            className="cart-pet-img" 
          />
          <div className="cart-pet-info">
            <p><strong>ID Mascota:</strong> {cartItems.mascota[0]}</p>
            <p><strong>Nombre Mascota:</strong> {cartItems.mascota[2]}</p>
            <p><strong>Especie:</strong> {cartItems.mascota[3]}</p>
            <p><strong>Edad:</strong> {cartItems.mascota[7]} años</p>
            <p><strong>Peso:</strong> {cartItems.mascota[5]} kg</p>
            <p><strong>Categoría:</strong> {cartItems.mascota[9]}</p>
          </div>
        </>
      )}

      {/* Servicios seleccionados */}
      {cartItems.services && cartItems.services.length > 0 && (
        <>
          <h4>Servicios Seleccionados</h4>
          {cartItems.services.map((service, index) => (
            <div key={index} className="cart-service">
              <p><strong>Servicio:</strong> {service.Nombre_Servicio}</p>
              <p><strong>Precio:</strong> ${service.Precio}</p>
            </div>
          ))}
        </>
      )}

      {/* Botón para proceder a los servicios */}
      {cartItems.room && cartItems.mascota && (
        <div className="text-center mt-4">
          <button className="btn btn-primary" onClick={handleProceedToServices}>
            Proceder a seleccionar servicios
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
