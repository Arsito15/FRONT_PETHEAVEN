import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import "./CheckoutForm.css"; // Importamos el CSS

export default function CheckoutForm({ reservationId, total, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false); // Para manejar el estado de éxito del pago
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false); // Estado para evitar pagos múltiples

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return; // Stripe.js aún no se ha cargado
    }

    // Deshabilitar el botón mientras se procesa el pago
    setIsPaymentProcessing(true);

    const cardElement = elements.getElement(CardElement);

    try {
      // Crea el pago en Stripe
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (!error) {
        // Convertimos el total a un número decimal
        const formattedTotal = parseFloat(total.replace(',', '.'));

        // Enviar los datos de pago al backend para crear el pago
        await axios.post("http://localhost:3000/api/pagos", {
          Reservacion_ID: reservationId, // Usamos el ID de la reservación
          Monto_Total: formattedTotal.toFixed(2), // El total del pago formateado a dos decimales
          Metodo_Pago: "card",
          Estado_Pago: "completado",
        });

        // Marcar el pago como exitoso
        setIsPaymentSuccessful(true);

        // Llamar al callback de éxito
        onSuccess();

        // Mostrar la notificación de éxito
        setTimeout(() => {
          setIsPaymentSuccessful(false); // Ocultar la notificación después de unos segundos
        }, 5000); // Ocultar después de 5 segundos
      } else {
        console.error(error);
        alert("Error al procesar el pago.");
        setIsPaymentProcessing(false); // Volver a habilitar el botón si hay un error
      }
    } catch (error) {
      console.error("Error al realizar el pago:", error);
      alert("Ocurrió un error al procesar el pago.");
      setIsPaymentProcessing(false); // Volver a habilitar el botón si hay un error
    }
  };

  return (
    <>
      <form onSubmit={handlePaymentSubmit} className="payment-form">
        <CardElement className="card-element" />
        <button
          type="submit"
          disabled={!stripe || isPaymentProcessing || isPaymentSuccessful} // Deshabilitar si el pago está en proceso o ya fue exitoso
          className="btn-pay"
        >
          Pagar {total} €
        </button>
      </form>

      {/* Notificación de pago exitoso */}
      {isPaymentSuccessful && (
        <div className="success-notification">
          <img
            src="https://i.redd.it/b3ko6n060kmz.png"
            alt="Logo"
            className="success-logo"
          />
          <div>
            <h4>Pago recibido con éxito</h4>
            <p>Gracias por su compra</p>
          </div>
        </div>
      )}
    </>
  );
}
