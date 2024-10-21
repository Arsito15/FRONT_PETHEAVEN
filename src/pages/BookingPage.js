import React, { useState, useEffect } from "react";
import Heading from "../components/common/Heading";
import { useCart } from "../pages/CartContext"; // Para acceder al carrito
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm"; // Formulario de pago de Stripe
import { useNavigate } from "react-router-dom"; // Para redirigir al usuario
import "./Booking.css";
import { useAuth } from "../AuthContext"; // Asegúrate de que la ruta sea la correcta

// Cargar la clave pública de Stripe
const stripePromise = loadStripe("pk_test_51Q7rPlP9VBpcKRyaBmd4WsoCTnitpOzGOfxhD5tmGOMoN0BL9tAhubAvVSNI6qXPOtKkuenRwPp4SjknLP8TwCFI00Vco5GyZW");

export default function Booking() {
  const { cartItems, clearCart } = useCart(); // Obtenemos los elementos del carrito y la función para vaciarlo
  const navigate = useNavigate(); // Para redirigir al usuario
  const { userData } = useAuth(); // Obtener el correo desde el contexto de autenticación
  const [formData, setFormData] = useState({
    mascotaId: cartItems.mascota ? cartItems.mascota[0] : "", // Prellenar el ID de la mascota
    habitacionId: cartItems.room ? cartItems.room.Habitacion_ID : "", // Prellenar el ID de la habitación
    fechaEntrada: cartItems.checkIn || "", // Prellenar con la fecha seleccionada de check-in
    fechaSalida: cartItems.checkOut || "", 
    estadoReservacion: "Pendiente", // Valor por defecto
    total: "", // Se calculará automáticamente
    notas: "",
  });

  const [message, setMessage] = useState(""); // Estado para manejar mensajes
  const [reservationId, setReservationId] = useState(null); // Guardar el ID de la reserva para insertar en pagos
  const [isFormDisabled, setIsFormDisabled] = useState(false); // Para congelar el formulario
  const [isPaymentVisible, setIsPaymentVisible] = useState(false); // Mostrar el formulario de pago
  const [showSuccessNotification, setShowSuccessNotification] = useState(false); // Mostrar notificación personalizada

  // Función para calcular la diferencia en días entre la fecha de entrada y salida
  const calcularDiasHospedaje = (fechaEntrada, fechaSalida) => {
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    const diferenciaTiempo = salida - entrada;
    const diferenciaDias = diferenciaTiempo / (1000 * 3600 * 24);
    return Math.max(diferenciaDias, 1); // Asegurarse que al menos sea 1 día
  };

  // Función para actualizar el total cuando se cambian las fechas o los servicios
  useEffect(() => {
    if (formData.fechaEntrada && formData.fechaSalida && cartItems.room) {
      const diasHospedaje = calcularDiasHospedaje(formData.fechaEntrada, formData.fechaSalida);
      const totalServicios = cartItems.services.reduce(
        (total, service) => total + service.Precio * diasHospedaje,
        0
      );
      const totalHabitacion = cartItems.room.Precio_Base * diasHospedaje;
      const totalPrice = totalHabitacion + totalServicios;

      // Actualizar el total en el formData
      setFormData((prevFormData) => ({
        ...prevFormData,
        total: totalPrice.toFixed(2), // Formato de dos decimales
      }));
    }
  }, [formData.fechaEntrada, formData.fechaSalida, cartItems]);

  // Función para formatear la fecha a DD/MM/YY HH24:MI:SS
  const formatearFechaOracle = (fecha) => {
    const dateObj = new Date(fecha);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    const year = String(dateObj.getFullYear()).slice(-2); // Tomamos los últimos dos dígitos del año
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds},000000000`;
  };

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Formatear las fechas correctamente
    const formattedEntrada = formatearFechaOracle(formData.fechaEntrada);
    const formattedSalida = formatearFechaOracle(formData.fechaSalida);

    // Convertir el total para que use coma como separador decimal
    const totalWithComma = formData.total.replace('.', ',');

    try {
      // Realiza la creación de la reservación primero
      const reservaResponse = await axios.post("http://localhost:3000/api/reservaciones", {
        Mascota_ID: formData.mascotaId,
        Habitacion_ID: formData.habitacionId,
        FECHA_ENTRADA: formattedEntrada,  // Fecha formateada correctamente
        FECHA_SALIDA: formattedSalida,    // Fecha formateada correctamente
        ESTADO: "Pendiente", // Forzamos que el estado sea "Pendiente"
        TOTAL: totalWithComma, // Total con coma como separador decimal
        NOTAS: formData.notas,
      });

      // Obtener el ID de la reservación creada
      const reservacionID = reservaResponse.data.RESERVACION_ID;

      if (!reservacionID) {
        throw new Error("No se pudo obtener el ID de la reservación");
      }

      // Inserción de servicios seleccionados en una sola solicitud
      const servicios = cartItems.services.map((service) => ({
        Reservacion_ID: reservacionID,
        Servicio_ID: service.Servicio_ID,
        Cantidad: 1, // Esto depende de cómo manejes la cantidad en tu lógica
        Precio: service.Precio.toFixed(2).replace('.', ','), // Convertir el precio con coma como separador decimal
      }));

      // Enviar los servicios al backend
      await axios.post("http://localhost:3000/api/servicios_reservaciones", { servicios });

      // Guarda el ID de la reserva
      setReservationId(reservacionID);
      setIsFormDisabled(true); // Congelar el formulario una vez confirmada la reserva
      setIsPaymentVisible(true); // Mostrar el formulario de pago en la parte derecha

      setMessage("Reserva y servicios registrados con éxito. Proceda al pago.");
    } catch (error) {
      console.error("Error al realizar la reserva o registrar los servicios:", error);
      setMessage("Ocurrió un error al realizar la reserva o registrar los servicios. Inténtalo de nuevo.");
    }
  };

  // Función para manejar el éxito del pago
  const handlePaymentSuccess = async () => {
    setShowSuccessNotification(true); // Mostrar la notificación de éxito personalizada
    setIsPaymentVisible(false); // Ocultar el formulario de pago tras el éxito
    clearCart(); // Limpiar el carrito
    
    // Llamar a la API del backend para enviar el correo al usuario
    try {
      const emailData = {
        to: userData.email, // El correo del usuario
        subject: 'Confirmación de Reserva', // Asunto del correo
        htmlContent: `
          <h1>Gracias por tu reserva</h1>
          <p>Tu reserva ha sido confirmada. A continuación, encontrarás los detalles:</p>
          <ul>
            <li><strong>Fecha de Entrada:</strong> ${cartItems.checkIn}</li>
            <li><strong>Fecha de Salida:</strong> ${cartItems.checkOut}</li>
            <li><strong>Habitación:</strong> ${cartItems.room.Nombre_Habitacion}</li>
            <li><strong>Total Pagado:</strong> $${formData.total}</li>
          </ul>
          <p>Haz clic en el botón a continuación para ver tus reservas activas:</p>
          <a href="http://localhost:3001/ReservasActivas" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Reservas Activas</a>
        `,
      };
  
      await axios.post("http://localhost:3000/api/send-email", emailData); // Cambia esta URL por la ruta en tu backend
    } catch (error) {
      console.error("Error al enviar el correo:", error);
    }
  
    navigate("/ReservasActivas"); // Redirigir a la página de reservas activas
  };

  // Obtener la URL de la imagen de la habitación seleccionada
  const getImageUrl = (imagePath) => {
    if (imagePath && typeof imagePath === "string" && !imagePath.startsWith("http")) {
      return `http://localhost:3000${imagePath}`;
    }
    return imagePath || "https://via.placeholder.com/300x200";
  };

  // No procesamos la URL de la imagen de la mascota, ya que viene completa en el carrito
  const getPetImageUrl = (imagePath) => {
    return imagePath || "https://via.placeholder.com/150";
  };

  return (
    <>
      <Heading heading="Reservas" title="Home" subtitle="Reservas" />
      <div className="booking-container">
        <div className="reservation-details">
          <h3>Detalles de la Reserva</h3>

          {/* Información de fechas */}
          <div className="date-selection">
            <div className="form-group">
              <label htmlFor="fechaEntrada">Fecha de Entrada:</label>
              <input
                type="datetime-local"
                id="fechaEntrada"
                name="fechaEntrada"
                value={formData.fechaEntrada}
                required
                className="form-control"
                disabled={true} // Deshabilitar para que no pueda cambiarse
              />
            </div>
            <div className="form-group">
              <label htmlFor="fechaSalida">Fecha de Salida:</label>
              <input
                type="datetime-local"
                id="fechaSalida"
                name="fechaSalida"
                value={formData.fechaSalida}
                required
                className="form-control"
                disabled={true} // Deshabilitar para que no pueda cambiarse
              />
            </div>
          </div>

          {/* Información general */}
          <div className="general-info">
            {/* Información de la habitación */}
            {cartItems.room && (
              <div className="room-info">
                <h4>Habitación Seleccionada</h4>
                <div className="room-details">
                  <img
                    src={getImageUrl(cartItems.room.Imagenes)} 
                    alt={cartItems.room.Nombre_Habitacion} 
                    className="img-fluid room-img"
                  />
                  <div className="room-text">
                    <p><strong>Nombre:</strong> {cartItems.room.Nombre_Habitacion}</p>
                    <p><strong>Capacidad:</strong> {cartItems.room.Capacidad_Maxima}</p>
                    <p><strong>Precio:</strong> ${cartItems.room.Precio_Base}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Información de la mascota */}
            {cartItems.mascota && (
              <div className="pet-info">
                <h4>Mascota</h4>
                <div className="pet-details">
                  <img
                    src={getPetImageUrl(cartItems.mascota[10])} 
                    alt={cartItems.mascota[2]} 
                    className="img-fluid pet-img"
                  />
                  <div className="pet-text">
                    <p><strong>Nombre:</strong> {cartItems.mascota[2]}</p>
                    <p><strong>Especie:</strong> {cartItems.mascota[3]}</p>
                    <p><strong>Edad:</strong> {cartItems.mascota[7]} años</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mostrar servicios seleccionados */}
          {cartItems.services.length > 0 && (
            <div className="services-info">
              <h4>Servicios Seleccionados</h4>
              {cartItems.services.map((service, index) => (
                <div key={index} className="service-item">
                  <img
                    src="https://img.icons8.com/?size=30&id=121439&format=png&color=000000"
                    alt="Service Icon"
                    className="service-icon"
                  />
                  <p className="service-text">
                    <strong>{service.Nombre_Servicio}</strong>: ${service.Precio}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Mostrar el total a pagar */}
          <div className="total-info">
            <h4>Total a Pagar: ${formData.total}</h4>
          </div>

          {/* Formulario adicional para notas */}
          <div className="form-group">
            <label htmlFor="notas">Notas Adicionales:</label>
            <textarea
              id="notas"
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              placeholder="Escribe alguna instrucción especial"
              className="form-control"
              disabled={isFormDisabled} // Deshabilitar cuando el formulario esté congelado
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" onClick={handleSubmit} disabled={isFormDisabled}>
            Confirmar Reserva
          </button>

          {/* Mostrar formulario de pago después de confirmar reserva */}
          {isPaymentVisible && (
            <div className="payment-section">
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  reservationId={reservationId}
                  total={formData.total}
                  onSuccess={handlePaymentSuccess} // Pasa la función onSuccess
                />
              </Elements>
            </div>
          )}
        </div>

        {/* Mostramos el mensaje de éxito o error */}
        {message && <p className="message">{message}</p>}
      </div>

      {/* Notificación personalizada de éxito */}
      {showSuccessNotification && (
        <div className="success-notification">
          <img src="https://i.redd.it/b3ko6n060kmz.png" alt="Logo" className="success-logo" />
          <p>Pago recibido con éxito</p>
        </div>
      )}
    </>
  );
}
