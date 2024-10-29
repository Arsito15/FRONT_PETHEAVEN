import React, { useState, useEffect } from "react";
import Heading from "../components/common/Heading";
import { useCart } from "../pages/CartContext";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { useNavigate } from "react-router-dom";
import "./Booking.css";
import { useAuth } from "../AuthContext";

// Cargar la clave pública de Stripe
const stripePromise = loadStripe("pk_test_51Q7rPlP9VBpcKRyaBmd4WsoCTnitpOzGOfxhD5tmGOMoN0BL9tAhubAvVSNI6qXPOtKkuenRwPp4SjknLP8TwCFI00Vco5GyZW");

export default function Booking() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [formData, setFormData] = useState({
    mascotaId: cartItems.mascota ? cartItems.mascota[0] : "",
    habitacionId: cartItems.room ? cartItems.room.Habitacion_ID : "",
    fechaEntrada: cartItems.checkIn || "",
    fechaSalida: cartItems.checkOut || "",
    estadoReservacion: "Pendiente",
    total: "",
    notas: "",
  });

  const [message, setMessage] = useState("");
  const [reservationId, setReservationId] = useState(null);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [isPaymentVisible, setIsPaymentVisible] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Función para calcular la diferencia en días entre la fecha de entrada y salida
  const calcularDiasHospedaje = (fechaEntrada, fechaSalida) => {
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    const diferenciaTiempo = salida - entrada;
    const diferenciaDias = diferenciaTiempo / (1000 * 3600 * 24);
    return Math.max(diferenciaDias, 1);
  };

  // Actualizar el total cuando cambian las fechas o los servicios
  useEffect(() => {
    if (formData.fechaEntrada && formData.fechaSalida && cartItems.room) {
      const diasHospedaje = calcularDiasHospedaje(formData.fechaEntrada, formData.fechaSalida);
      const totalServicios = cartItems.services.reduce(
        (total, service) => total + service.Precio * diasHospedaje,
        0
      );
      const totalHabitacion = cartItems.room.Precio_Base * diasHospedaje;
      const totalPrice = totalHabitacion + totalServicios;

      setFormData((prevFormData) => ({
        ...prevFormData,
        total: totalPrice.toFixed(2),
      }));
    }
  }, [formData.fechaEntrada, formData.fechaSalida, cartItems]);

  // Formatear fecha a DD/MM/YY HH24:MI:SS
  const formatearFechaOracle = (fecha) => {
    const dateObj = new Date(fecha);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = String(dateObj.getFullYear()).slice(-2);
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const seconds = String(dateObj.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds},000000000`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedEntrada = formatearFechaOracle(formData.fechaEntrada);
    const formattedSalida = formatearFechaOracle(formData.fechaSalida);
    const totalWithComma = formData.total.replace(".", ",");

    try {
      const reservaResponse = await axios.post("http://localhost:3000/api/reservaciones", {
        Mascota_ID: formData.mascotaId,
        Habitacion_ID: formData.habitacionId,
        FECHA_ENTRADA: formattedEntrada,
        FECHA_SALIDA: formattedSalida,
        ESTADO: "Pendiente",
        TOTAL: totalWithComma,
        NOTAS: formData.notas,
      });

      const reservacionID = reservaResponse.data.RESERVACION_ID;

      if (!reservacionID) {
        throw new Error("No se pudo obtener el ID de la reservación");
      }

      const servicios = cartItems.services.map((service) => ({
        Reservacion_ID: reservacionID,
        Servicio_ID: service.Servicio_ID,
        Cantidad: 1,
        Precio: service.Precio.toFixed(2).replace(".", ","),
      }));

      await axios.post("http://localhost:3000/api/servicios_reservaciones", { servicios });

      setReservationId(reservacionID);
      setIsFormDisabled(true);
      setIsPaymentVisible(true);

      setMessage("Reserva y servicios registrados con éxito. Proceda al pago.");
    } catch (error) {
      console.error("Error al realizar la reserva o registrar los servicios:", error);
      setMessage("Ocurrió un error al realizar la reserva o registrar los servicios. Inténtalo de nuevo.");
    }
  };

  // Función para manejar el éxito del pago
  const handlePaymentSuccess = () => {
    setShowSuccessNotification(true);
    setIsPaymentVisible(false);
    clearCart();
    navigate("/ReservasActivas");
  };

  const getImageUrl = (imagePath) => {
    if (imagePath && typeof imagePath === "string" && !imagePath.startsWith("http")) {
      return `http://localhost:3000${imagePath}`;
    }
    return imagePath || "https://via.placeholder.com/300x200";
  };

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
                disabled={true}
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
                disabled={true}
              />
            </div>
          </div>

          {/* Información general */}
          <div className="general-info">
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

          <div className="total-info">
            <h4>Total a Pagar: Q{formData.total}</h4>
          </div>

          <div className="form-group">
            <label htmlFor="notas">Notas Adicionales:</label>
            <textarea
              id="notas"
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              placeholder="Escribe alguna instrucción especial"
              className="form-control"
              disabled={isFormDisabled}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" onClick={handleSubmit} disabled={isFormDisabled}>
            Confirmar Reserva
          </button>

          {isPaymentVisible && (
            <div className="payment-section">
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  reservationId={reservationId}
                  total={formData.total}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>
          )}
        </div>

        {message && <p className="message">{message}</p>}
      </div>

      {showSuccessNotification && (
        <div className="success-notification">
          <img src="https://i.redd.it/b3ko6n060kmz.png" alt="Logo" className="success-logo" />
          <p>Pago recibido con éxito</p>
        </div>
      )}
    </>
  );
}
