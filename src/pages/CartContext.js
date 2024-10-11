import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({
    room: null,
    mascota: null,
    services: [],
    checkIn: "", // Fecha de entrada
    checkOut: "", // Fecha de salida
  });

  // Función para agregar la habitación, mascota y las fechas al carrito
  const addRoomToCart = (room, mascota, checkIn, checkOut) => {
    setCartItems((prevItems) => ({
      ...prevItems,
      room,
      mascota,
      checkIn,   // Guardar la fecha de entrada
      checkOut,  // Guardar la fecha de salida
    }));
  };

  // Función para agregar un servicio al carrito
  const addServiceToCart = (service) => {
    setCartItems((prevItems) => ({
      ...prevItems,
      services: [...prevItems.services, service], // Añadir el nuevo servicio al carrito
    }));
  };

  // Función para eliminar un servicio del carrito
  const removeServiceFromCart = (serviceID) => {
    setCartItems((prevItems) => ({
      ...prevItems,
      services: prevItems.services.filter(service => service.Servicio_ID !== serviceID), // Filtrar los servicios
    }));
  };

  // Función para vaciar el carrito (p. ej., tras el pago exitoso)
  const clearCart = () => {
    setCartItems({
      room: null,
      mascota: null,
      services: [],
      checkIn: "",
      checkOut: "",
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, addRoomToCart, addServiceToCart, removeServiceFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para acceder al contexto del carrito
export const useCart = () => useContext(CartContext);
