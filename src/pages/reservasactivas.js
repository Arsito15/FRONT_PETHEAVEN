import React, { useState, useEffect } from "react";
import Heading from "../components/common/Heading";  // Usa tu componente de Heading
import axios from "axios";
import "./ReservasActivas.css";  // Archivo CSS para el diseño personalizado

export default function ReservasActivas() {
  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Función para obtener las reservas activas
    const obtenerReservasActivas = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/reservaciones");
        setReservas(response.data);
      } catch (error) {
        setError("Error al obtener las reservas activas.");
        console.error(error);
      }
    };

    obtenerReservasActivas();
  }, []);

  // Función para formatear las fechas
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) {
      return "Fecha no válida";  // Maneja fechas inválidas
    }
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;  // Formato legible de fecha y hora
  };

  return (
    <>
      <Heading heading="Reservas Activas" title="Home" subtitle="Reservas Activas" />
      <div className="reservas-activas-container">
        <h1>Reservas Activas</h1>
        {error && <p className="error-message">{error}</p>}
        {reservas.length === 0 ? (
          <p>No hay reservas activas en este momento.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID Reservación</th>
                <th>ID Mascota</th>
                <th>ID Habitación</th>
                <th>Fecha Entrada</th>
                <th>Fecha Salida</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva, index) => (
                <tr key={index}>
                  <td>{reserva[0]}</td>
                  <td>{reserva[1]}</td>
                  <td>{reserva[2]}</td>
                  <td>{formatDate(reserva[3])}</td> {/* Formatear Fecha Entrada */}
                  <td>{formatDate(reserva[4])}</td> {/* Formatear Fecha Salida */}
                  <td>{reserva[5]}</td>
                  <td>${reserva[6]}</td>
                  <td>{reserva[7]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
