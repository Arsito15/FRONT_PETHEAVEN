import React, { useState, useEffect } from 'react';
import './graficas.css';
import axios from 'axios';
import { Pie, Line, Bar } from 'react-chartjs-2'; // Agregado Bar para la gráfica de barras
import 'chart.js/auto';
import jsPDF from 'jspdf'; // Importamos jsPDF
import 'jspdf-autotable'; // Importamos la extensión de autotable para tablas

const Graficas = () => {
  const [selectedCategory, setSelectedCategory] = useState('reservas');
  const [reservas, setReservas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]); // Estado para habitaciones
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Número de items por página (Reservas/Pagos/Habitaciones)

  // Función para manejar la selección de categoría
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reiniciar la página actual al cambiar de categoría
  };

  // Función para manejar la carga de reservas desde la API
  useEffect(() => {
    const fetchReservas = async () => {
      const result = await axios.get('http://localhost:3000/api/reservaciones');
      setReservas(result.data);
    };
    fetchReservas();
  }, []);

  // Función para manejar la carga de pagos desde la API
  useEffect(() => {
    const fetchPagos = async () => {
      const result = await axios.get('http://localhost:3000/api/pagos');
      setPagos(result.data);
    };
    fetchPagos();
  }, []);

  // Función para manejar la carga de habitaciones desde la API
  useEffect(() => {
    const fetchHabitaciones = async () => {
      const result = await axios.get('http://localhost:3000/api/habitaciones');
      setHabitaciones(result.data);
    };
    fetchHabitaciones();
  }, []);

  // Calcular los índices de los elementos a mostrar según la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservas = reservas.slice(indexOfFirstItem, indexOfLastItem);
  const currentPagos = pagos.slice(indexOfFirstItem, indexOfLastItem);
  const currentHabitaciones = habitaciones.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const nextPage = () => {
    const totalItems = selectedCategory === 'reservas' ? reservas.length
      : selectedCategory === 'pagos' ? pagos.length
      : habitaciones.length;

    if (currentPage < Math.ceil(totalItems / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Función para descargar el PDF de las tablas
  const downloadPDF = (title, headers, data) => {
    const doc = new jsPDF();
    doc.text(title, 20, 10);
    doc.autoTable({
      head: [headers],
      body: data,
    });
    doc.save(`${title}.pdf`);
  };

  // Función para preparar los datos de cada tabla para el PDF
  const handleDownload = (category) => {
    let headers = [];
    let data = [];

    if (category === 'reservas') {
      headers = ['ID', 'Mascota ID', 'Habitación ID', 'Fecha Entrada', 'Fecha Salida', 'Estado', 'Total'];
      data = reservas.map(reserva => reserva.slice(0, 7)); // Filtramos los primeros 7 elementos
      downloadPDF('Reservas', headers, data);
    }

    if (category === 'pagos') {
      headers = ['ID', 'Reservación ID', 'Monto', 'Fecha de Pago', 'Método de Pago', 'Estado'];
      data = pagos.map(pago => [
        pago[0], pago[1], pago[2], new Date(pago[3]).toLocaleDateString(), pago[4], pago[5]
      ]);
      downloadPDF('Pagos', headers, data);
    }

    if (category === 'habitacion') {
      headers = ['ID', 'Nombre', 'Estado', 'Capacidad Máxima', 'Tipo de Habitación', 'Ubicación', 'Precio Base'];
      data = habitaciones.map(habitacion => [
        habitacion.Habitacion_ID, habitacion.Nombre_Habitacion, habitacion.Estado, habitacion.Capacidad_Maxima,
        habitacion.Tipo_Habitacion, habitacion.Ubicacion, habitacion.Precio_Base
      ]);
      downloadPDF('Habitaciones', headers, data);
    }
  };

  // Configuración para la gráfica de Pie (Reservas)
  const completedCount = reservas.filter(reserva => reserva[5] === 'completado').length;
  const pendingCount = reservas.length - completedCount;
  const pieData = {
    labels: ['Completado', 'Pendiente'],
    datasets: [
      {
        data: [completedCount, pendingCount],
        backgroundColor: ['#36A2EB', '#FFCE56'],
      },
    ],
  };

  // Configuración para la gráfica de Línea (Pagos)
  const lineData = {
    labels: pagos.map(pago => new Date(pago[3]).toLocaleDateString()), // Convertir fechas a formato legible
    datasets: [
      {
        label: 'Monto de Pagos',
        data: pagos.map(pago => pago[2]), // Usar el campo de monto de cada pago
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  // Calcular el monto total de pagos
  const totalPagos = pagos.reduce((sum, pago) => sum + pago[2], 0);

  // Configuración para la gráfica de Barras (Habitaciones)
  const habitacionesPorTipo = habitaciones.reduce((acc, habitacion) => {
    const { Tipo_Habitacion, Estado } = habitacion;
    if (!acc[Tipo_Habitacion]) {
      acc[Tipo_Habitacion] = { ocupadas: 0, disponibles: 0 };
    }
    acc[Tipo_Habitacion][Estado === 'Ocupada' ? 'ocupadas' : 'disponibles'] += 1;
    return acc;
  }, {});

  const barData = {
    labels: Object.keys(habitacionesPorTipo),
    datasets: [
      {
        label: 'Ocupadas',
        data: Object.values(habitacionesPorTipo).map(tipo => tipo.ocupadas),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Disponibles',
        data: Object.values(habitacionesPorTipo).map(tipo => tipo.disponibles),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Calcular el total de habitaciones y las ocupadas
  const totalHabitaciones = habitaciones.length;
  const habitacionesOcupadas = habitaciones.filter(habitacion => habitacion.Estado === 'Ocupada').length;
  const habitacionesDisponibles = totalHabitaciones - habitacionesOcupadas;

  return (
    <div className="report-container">
      <h1>Reportes y Gráficas</h1>

      <div className="layout">
        {/* Barra lateral */}
        <div className="sidebar">
          <h3>Categorías</h3>
          <ul>
            <li
              className={selectedCategory === 'reservas' ? 'active' : ''}
              onClick={() => handleCategoryClick('reservas')}
            >
              Reservas
            </li>
            <li
              className={selectedCategory === 'pagos' ? 'active' : ''}
              onClick={() => handleCategoryClick('pagos')}
            >
              Pagos
            </li>
            <li
              className={selectedCategory === 'habitacion' ? 'active' : ''}
              onClick={() => handleCategoryClick('habitacion')}
            >
              Habitaciones
            </li>
          </ul>
        </div>

        {/* Área principal donde se mostrará el contenido */}
        <div className="content">
          {selectedCategory === 'reservas' && (
            <div className="reservas-section">
              {/* Título de la gráfica */}
              <h2>Gráfica de Reservas</h2>

              <div className="graph-and-summary">
                {/* Gráfica de Pie */}
                <div className="graph-container">
                  <Pie data={pieData} />
                </div>

                {/* Resumen de Reservas */}
                <div className="summary-section">
                  {/* Total de Reservas */}
                  <div className="summary-box">
                    <h4>Total de Reservas</h4>
                    <p>{reservas.length}</p>
                  </div>

                  {/* Reservas Completadas */}
                  <div className="summary-box">
                    <h4>Reservas Completadas</h4>
                    <p>{completedCount}</p>
                  </div>

                  {/* Reservas Pendientes */}
                  <div className="summary-box">
                    <h4>Reservas Pendientes</h4>
                    <p>{pendingCount}</p>
                  </div>
                </div>
              </div>

              {/* Título de la tabla */}
              <h3>Detalles de las Reservas</h3>

              {/* Tabla de Reservas */}
              <table className="reservas-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Mascota ID</th>
                    <th>Habitación ID</th>
                    <th>Fecha Entrada</th>
                    <th>Fecha Salida</th>
                    <th>Estado</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReservas.map((reserva, index) => (
                    <tr key={index}>
                      <td>{reserva[0]}</td>
                      <td>{reserva[1]}</td>
                      <td>{reserva[2]}</td>
                      <td>{reserva[3]}</td>
                      <td>{reserva[4]}</td>
                      <td>{reserva[5]}</td>
                      <td>{reserva[6]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Botón para descargar la tabla */}
              <button onClick={() => handleDownload('reservas')}>Descargar Reservas (PDF)</button>

              {/* Controles de Paginación */}
              <div className="pagination">
                <button onClick={prevPage} disabled={currentPage === 1}>
                  &#9664; {/* Flecha izquierda */}
                </button>
                <span>
                  Página {currentPage} de {Math.ceil(reservas.length / itemsPerPage)}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage >= Math.ceil(reservas.length / itemsPerPage)}
                >
                  &#9654; {/* Flecha derecha */}
                </button>
              </div>
            </div>
          )}

          {/* Sección para los pagos */}
          {selectedCategory === 'pagos' && (
            <div className="pagos-section">
              {/* Título de la gráfica */}
              <h2>Gráfica de Pagos</h2>

              <div className="graph-and-summary">
                {/* Gráfica Lineal */}
                <div className="graph-container">
                  <Line data={lineData} />
                </div>

                {/* Resumen de Pagos */}
                <div className="summary-section">
                  {/* Monto Total de Pagos */}
                  <div className="summary-box">
                    <h4>Monto Total de Pagos</h4>
                    <p>${totalPagos}</p>
                  </div>

                  {/* Número Total de Pagos */}
                  <div className="summary-box">
                    <h4>Número Total de Pagos</h4>
                    <p>{pagos.length}</p>
                  </div>
                </div>
              </div>

              {/* Título de la tabla */}
              <h3>Detalles de los Pagos</h3>

              {/* Tabla de Pagos */}
              <table className="reservas-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Reservación ID</th>
                    <th>Monto</th>
                    <th>Fecha de Pago</th>
                    <th>Método de Pago</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPagos.map((pago, index) => (
                    <tr key={index}>
                      <td>{pago[0]}</td>
                      <td>{pago[1]}</td>
                      <td>${pago[2]}</td>
                      <td>{new Date(pago[3]).toLocaleDateString()}</td>
                      <td>{pago[4]}</td>
                      <td>{pago[5]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Botón para descargar la tabla */}
              <button onClick={() => handleDownload('pagos')}>Descargar Pagos (PDF)</button>

              {/* Controles de Paginación */}
              <div className="pagination">
                <button onClick={prevPage} disabled={currentPage === 1}>
                  &#9664; {/* Flecha izquierda */}
                </button>
                <span>
                  Página {currentPage} de {Math.ceil(pagos.length / itemsPerPage)}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage >= Math.ceil(pagos.length / itemsPerPage)}
                >
                  &#9654; {/* Flecha derecha */}
                </button>
              </div>
            </div>
          )}

          {/* Sección para las habitaciones */}
          {selectedCategory === 'habitacion' && (
            <div className="habitacion-section">
              {/* Título de la gráfica */}
              <h2>Gráfica de Habitaciones</h2>

              <div className="graph-and-summary">
                {/* Gráfica de Barras */}
                <div className="graph-container">
                  <Bar data={barData} />
                </div>

                {/* Resumen de Habitaciones */}
                <div className="summary-section">
                  {/* Total de Habitaciones */}
                  <div className="summary-box">
                    <h4>Total de Habitaciones</h4>
                    <p>{totalHabitaciones}</p>
                  </div>

                  {/* Habitaciones Ocupadas */}
                  <div className="summary-box">
                    <h4>Habitaciones Ocupadas</h4>
                    <p>{habitacionesOcupadas}</p>
                  </div>

                  {/* Habitaciones Disponibles */}
                  <div className="summary-box">
                    <h4>Habitaciones Disponibles</h4>
                    <p>{habitacionesDisponibles}</p>
                  </div>
                </div>
              </div>

              {/* Título de la tabla */}
              <h3>Detalles de las Habitaciones</h3>

              {/* Tabla de Habitaciones */}
              <table className="reservas-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Capacidad Máxima</th>
                    <th>Tipo de Habitación</th>
                    <th>Ubicación</th>
                    <th>Precio Base</th>
                  </tr>
                </thead>
                <tbody>
                  {currentHabitaciones.map((habitacion, index) => (
                    <tr key={index}>
                      <td>{habitacion.Habitacion_ID}</td>
                      <td>{habitacion.Nombre_Habitacion}</td>
                      <td>{habitacion.Estado}</td>
                      <td>{habitacion.Capacidad_Maxima}</td>
                      <td>{habitacion.Tipo_Habitacion}</td>
                      <td>{habitacion.Ubicacion}</td>
                      <td>${habitacion.Precio_Base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Botón para descargar la tabla */}
              <button onClick={() => handleDownload('habitacion')}>Descargar Habitaciones (PDF)</button>

              {/* Controles de Paginación */}
              <div className="pagination">
                <button onClick={prevPage} disabled={currentPage === 1}>
                  &#9664; {/* Flecha izquierda */}
                </button>
                <span>
                  Página {currentPage} de {Math.ceil(habitaciones.length / itemsPerPage)}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage >= Math.ceil(habitaciones.length / itemsPerPage)}
                >
                  &#9654; {/* Flecha derecha */}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Graficas;
