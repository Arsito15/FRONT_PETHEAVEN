import React, { useState, useEffect } from "react";
import Heading from "../components/common/Heading";
import axios from "axios";
import { useAuth } from "../AuthContext";
import "./ReservasActivas.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

export default function ReservasActivas() {
  const { userData } = useAuth();
  const [reservasAgrupadas, setReservasAgrupadas] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userData) return;

    const obtenerReservasActivas = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/reservaciones/usuario/${userData.USUARIO_ID}`);
        const reservas = response.data;

        const reservasPorID = reservas.reduce((acc, reserva) => {
          const { RESERVACION_ID } = reserva;
          if (!acc[RESERVACION_ID]) {
            acc[RESERVACION_ID] = {
              info: reserva,
              servicios: []
            };
          }
          acc[RESERVACION_ID].servicios.push({
            NOMBRE_SERVICIO: reserva.NOMBRE_SERVICIO,
            DESCRIPCION_SERVICIO: reserva.DESCRIPCION_SERVICIO,
            DURACION_SERVICIO: reserva.DURACION_SERVICIO,
            PRECIO_SERVICIO: reserva.PRECIO_SERVICIO,
          });
          return acc;
        }, {});

        setReservasAgrupadas(reservasPorID);
      } catch (error) {
        setError("Error al obtener las reservas activas.");
        console.error(error);
      }
    };

    obtenerReservasActivas();
  }, [userData]);

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Fecha no válida";
    }
    const date = new Date(dateString);
    if (isNaN(date)) {
      return "Fecha no válida";
    }
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Función para exportar la reserva como PDF
  const exportPDF = (reservaId) => {
    const input = document.getElementById(`reserva-${reservaId}`);
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`Reserva_${reservaId}.pdf`);
    });
  };

  return (
    <>
      <Heading heading="Reservas Activas" title="Home" subtitle="Reservas Activas" />
      <div className="reservas-activas-container">
        <h1>Reservas Activas</h1>
        {error && <p className="error-message">{error}</p>}
        {Object.keys(reservasAgrupadas).length === 0 ? (
          <p>No hay reservas activas en este momento.</p>
        ) : (
          Object.values(reservasAgrupadas).map((reservaAgrupada, index) => {
            const reserva = reservaAgrupada.info;
            const servicios = reservaAgrupada.servicios;

            return (
              <div key={index} className="reserva-card" id={`reserva-${reserva.RESERVACION_ID}`}>
                <div className="reserva-info">
                  <img src={getPetImageUrl(reserva.FOTO)} alt={`Foto de ${reserva.NOMBRE_MASCOTA}`} className="foto-mascota" />
                  <img src={getImageUrl(reserva.IMAGENES)} alt={`Foto de ${reserva.NOMBRE_HABITACION}`} className="foto-habitacion" />

                  <h2>Reserva #{reserva.RESERVACION_ID}</h2>
                  <p><strong>Mascota:</strong> {reserva.NOMBRE_MASCOTA}</p>
                  <p><strong>Habitación:</strong> {reserva.NOMBRE_HABITACION}</p>
                  <p><strong>Fecha Entrada:</strong> {formatDate(reserva.FECHA_ENTRADA)}</p>
                  <p><strong>Fecha Salida:</strong> {formatDate(reserva.FECHA_SALIDA)}</p>
                  <p><strong>Estado:</strong> {reserva.ESTADO}</p>
                  <p><strong>Total:</strong> Q{reserva.TOTAL}</p>
                  <p><strong>Notas:</strong> {reserva.NOTAS}</p>
                </div>

                <div className="servicios-reserva">
                  <h3>Servicios incluidos</h3>
                  <ul>
                    {servicios.map((servicio, idx) => (
                      <li key={idx}>
                        <p><strong>Servicio:</strong> {servicio.NOMBRE_SERVICIO}</p>
                        <p><strong>Descripción:</strong> {servicio.DESCRIPCION_SERVICIO}</p>
                        <p><strong>Duración:</strong> {servicio.DURACION_SERVICIO} horas</p>
                        <p><strong>Precio:</strong> Q{servicio.PRECIO_SERVICIO}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botón para exportar PDF */}
                <button onClick={() => exportPDF(reserva.RESERVACION_ID)} className="export-pdf-button">
                  Exportar como PDF
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
