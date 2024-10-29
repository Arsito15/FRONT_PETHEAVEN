import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import "./CheckoutForm.css";

export default function CheckoutForm({ reservationId, total, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState(""); // Almacenar el clientSecret de Stripe
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  useEffect(() => {
    // Crear una intención de pago en el backend y obtener el clientSecret
    const createPaymentIntent = async () => {
      const formattedTotal = parseFloat(total.replace(',', '.'));
      const response = await axios.post("http://localhost:3000/api/crear-intencion", {
        amount: formattedTotal,
      });
      setClientSecret(response.data.clientSecret); // Guardar el clientSecret para confirmar el pago
    };

    createPaymentIntent();
  }, [total]);

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsPaymentProcessing(true);

    const cardElement = elements.getElement(CardElement);

    try {
      // Confirmar el pago con el clientSecret obtenido del backend
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (!error) {
        await axios.post("http://localhost:3000/api/pagos", {
          Reservacion_ID: reservationId,
          Monto_Total: parseFloat(total.replace(',', '.')).toFixed(2),
          Metodo_Pago: "card",
          Estado_Pago: "completado",
        });

        setIsPaymentSuccessful(true);
        onSuccess();

        setTimeout(() => {
          setIsPaymentSuccessful(false);
        }, 5000);
      } else {
        console.error(error);
        alert("Error al procesar el pago.");
      }
    } catch (error) {
      console.error("Error al realizar el pago:", error);
      alert("Ocurrió un error al procesar el pago.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  return (
    <>
      <form onSubmit={handlePaymentSubmit} className="payment-form">
        <CardElement className="card-element" />
        <button
          type="submit"
          disabled={!stripe || isPaymentProcessing || isPaymentSuccessful}
          className="btn-pay"
        >
          Pagar {total} €
        </button>
      </form>

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
