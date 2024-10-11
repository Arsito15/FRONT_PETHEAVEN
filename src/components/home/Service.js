import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Para redirigir a la página de agendamiento
import { useCart } from "../../pages/CartContext"; // Para interactuar con el carrito
import CommonHeading from "../common/CommonHeading";
import "./Service.css";  // Archivo CSS específico para los estilos

export default function Services() {
  const [services, setServices] = useState([]);
  const { addServiceToCart, removeServiceFromCart, cartItems } = useCart(); // Métodos para agregar y eliminar del carrito
  const navigate = useNavigate(); // Navegador para redirigir a otra página

  useEffect(() => {
    // Fetch services data from el backend
    axios
      .get("http://localhost:3000/api/servicios") // Ruta de tu API que devuelve los servicios
      .then((response) => {
        const servicesData = response.data.map(service => ({
          Servicio_ID: service[0],
          Nombre_Servicio: service[1],
          Descripcion: service[2],
          Precio: service[3],
          Duracion: service[4],
          Tipo: service[5]
        }));
        setServices(servicesData);
      })
      .catch((error) => {
        console.error("Error fetching services data:", error);
      });
  }, []);

  // Función para asignar el icono basado en el tipo de servicio
  const getIconUrl = (tipo) => {
    switch (tipo) {
      case "Alimentos":
        return "https://img.icons8.com/?size=100&id=3971&format=png&color=000000";
      case "Cuidados":
        return "https://img.icons8.com/?size=100&id=2863&format=png&color=000000";
      case "Clases":
        return "https://img.icons8.com/?size=100&id=61080&format=png&color=000000";
      case "Recreacion":
        return "https://img.icons8.com/?size=100&id=56042&format=png&color=000000";
      case "Ejercitacion":
        return "https://img.icons8.com/?size=100&id=1784&format=png&color=000000";
      default:
        return "https://img.icons8.com/?size=100&id=39539&format=png&color=000000";
    }
  };

  // Agrupar servicios por tipo
  const groupServicesByType = () => {
    const grouped = services.reduce((acc, service) => {
      if (!acc[service.Tipo]) {
        acc[service.Tipo] = [];
      }
      acc[service.Tipo].push(service);
      return acc;
    }, {});
    return grouped;
  };

  const groupedServices = groupServicesByType();

  // Función para manejar la selección/deselección de un servicio (selección múltiple)
  const handleServiceClick = (service) => {
    const isAlreadySelected = cartItems.services.some(item => item.Servicio_ID === service.Servicio_ID);

    if (isAlreadySelected) {
      // Si el servicio ya está en el carrito, lo eliminamos
      removeServiceFromCart(service.Servicio_ID);
    } else {
      // Si el servicio no está en el carrito, lo añadimos
      addServiceToCart(service);
    }
  };

  const isServiceSelected = (serviceID) => {
    return Array.isArray(cartItems.services) && cartItems.services.some(item => item.Servicio_ID === serviceID);
  };

  const getServiceClass = (tipo, isSelected) => {
    let baseClass = tipo === "Premium" ? "service-item premium" : "service-item";
    return isSelected ? `${baseClass} selected` : baseClass;
  };

  const handleConfirmReservation = () => {
    navigate("/Booking"); // Redirige a la página de agendamiento
  };

  // Obtener la URL de la imagen de la habitación seleccionada
  const getImageUrl = (imagePath) => {
    if (imagePath && typeof imagePath === "string" && imagePath.length > 0) {
      return `http://localhost:3000${imagePath}`;
    }
    return "https://via.placeholder.com/300x200";
  };

  return (
    <div className="container-xxl py-5">
      <div className="container-fluid">
        <div className="row">
          {/* Columna para los servicios */}
          <div className="col-lg-9">
            <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
              <CommonHeading
                heading="Nuestros Servicios"
                title="Servicios"
                subtitle="Explora nuestros"
              />
            </div>
            {Object.keys(groupedServices).map((tipo, index) => (
              <div key={index} className="service-group">
                <h3 className="text-center my-4">{tipo}</h3>
                <div className="row g-4">
                  {groupedServices[tipo].map((service, idx) => (
                    <div
                      className="col-lg-4 col-md-6 wow fadeInUp"
                      data-wow-delay="0.1s"
                      key={idx}
                    >
                      <div
                        className={getServiceClass(service.Tipo, isServiceSelected(service.Servicio_ID))}
                        onClick={() => handleServiceClick(service)}
                      >
                        <div className="service-icon p-1">
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                            <img
                              src={getIconUrl(service.Tipo)}
                              alt={service.Nombre_Servicio}
                              className="service-icon-img"
                            />
                          </div>
                        </div>
                        <h5 className="mb-3">{service.Nombre_Servicio}</h5>
                        <p className="text-body mb-0">
                          {service.Descripcion || "Descripción no disponible"}
                        </p>
                        <p className="service-price">Precio: ${service.Precio}</p>
                        <p className="service-duration">
                          Duración: {service.Duracion} minutos
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Columna para mostrar los datos de la habitación, la mascota y los servicios seleccionados */}
          <div className="col-lg-3">
            <div className="cart-summary">
              <h4>Detalles de la Reserva</h4>
              {cartItems.room && (
                <>
                  <h5>Habitación Seleccionada</h5>
                  <img
                    src={getImageUrl(cartItems.room.Imagenes)} 
                    alt={cartItems.room.Nombre_Habitacion} 
                    className="img-fluid room-img"
                  />
                  <p><strong>Nombre:</strong> {cartItems.room.Nombre_Habitacion}</p>
                  <p><strong>Capacidad:</strong> {cartItems.room.Capacidad_Maxima}</p>
                  <p><strong>Precio:</strong> ${cartItems.room.Precio_Base}</p>
                </>
              )}
              {cartItems.mascota && (
                <>
                  <h5>Mascota</h5>
                  <p><strong>Nombre:</strong> {cartItems.mascota[2]}</p> {/* Corregido el índice */}
                  <p><strong>Especie:</strong> {cartItems.mascota[3]}</p>
                  <p><strong>Edad:</strong> {cartItems.mascota[7]} años</p>
                </>
              )}
              {/* Mostrar servicios seleccionados */}
              <h5>Servicios Seleccionados</h5>
              {cartItems.services.length > 0 ? (
                cartItems.services.map((service, idx) => (
                  <div key={idx}>
                    <p><strong>{service.Nombre_Servicio}</strong></p>
                    <p>Precio: ${service.Precio}</p>
                  </div>
                ))
              ) : (
                <p>No se han seleccionado servicios aún.</p>
              )}

              {/* Botón para confirmar la reserva */}
              {cartItems.room && cartItems.mascota && (
                <div className="text-center mt-4">
                  <button className="btn btn-primary" onClick={handleConfirmReservation}>
                    Confirmar Reserva
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
