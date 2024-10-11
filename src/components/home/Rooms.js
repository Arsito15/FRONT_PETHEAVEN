import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Alert } from "react-bootstrap";
import CommonHeading from "../common/CommonHeading";
import { useCart } from "../../pages/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import Cart from "../../pages/Cart";
import "./Rooms.css";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mascotas, setMascotas] = useState([]);
  const [showAlert, setShowAlert] = useState(false); // Para mostrar la alerta personalizada
  const { userData } = useAuth();
  const { addRoomToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false); // Nueva bandera para habilitar reservas solo después de filtrar
  const [datesLocked, setDatesLocked] = useState(false); // Bloquear las fechas después de seleccionarlas

  // Obtener habitaciones
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/habitaciones")
      .then((response) => {
        setRooms(response.data);
        setFilteredRooms(response.data); // Mostrar todas las habitaciones al cargar
      })
      .catch((error) => {
        console.error("Error fetching room data:", error);
      });
  }, []);

  // Obtener las mascotas del dueño
  useEffect(() => {
    if (userData) {
      axios
        .get(`http://localhost:3000/api/mascotas/${userData.USUARIO_ID}`)
        .then((response) => {
          setMascotas(response.data);
        })
        .catch((error) => {
          console.error("Error al obtener las mascotas del usuario:", error);
        });
    }
  }, [userData]);

  const handleDetailsClick = (room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  const handleReserveClick = (room) => {
    if (!selectedMascota) {
      setShowAlert(true); // Mostrar la alerta personalizada
      return;
    }

    // Añadir la habitación, mascota y las fechas al carrito
    addRoomToCart(room, selectedMascota, checkIn, checkOut);
    navigate("/services"); // Redirigir a la página de servicios
  };

  const getImageUrl = (imagePath) => {
    if (imagePath && typeof imagePath === "string" && imagePath.length > 0) {
      return `http://localhost:3000${imagePath}`;
    }
    return "https://via.placeholder.com/300x200";
  };

  const getRoomClass = (estado) => {
    return estado === "Disponible" ? "room-item available" : "room-item not-available";
  };

  const handleMascotaSelect = (mascota) => {
    setSelectedMascota(mascota);
    setShowAlert(false); // Ocultar la alerta cuando se seleccione una mascota
  };

  // Filtrar habitaciones según las fechas seleccionadas
  const handleFilterRooms = () => {
    if (!checkIn || !checkOut) {
      alert("Por favor, selecciona las fechas de entrada y salida.");
      return;
    }

    // Bloquear la selección de fechas una vez que se han seleccionado
    setDatesLocked(true);

    axios
      .post("http://localhost:3000/api/filtrar", {
        fechaInicio: checkIn,
        fechaFin: checkOut,
      })
      .then((response) => {
        setFilteredRooms(response.data);
        setIsFiltered(true); // Habilitar reservas después de filtrar
      })
      .catch((error) => {
        console.error("Error al filtrar habitaciones:", error);
      });
  };

  return (
    <div className="container-xxl py-5">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-9">
            <CommonHeading
              heading="Nuestras Habitaciones"
              title="Habitaciones"
              subtitle="Explora nuestras"
            />

            {/* Selector de fechas con título */}
            <h4>Selecciona tus Fechas</h4>
            <div className="date-selection-container">
              <input
                type="datetime-local"
                className="form-control"
                placeholder="Check in"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                disabled={datesLocked} // Bloquear el cambio de fecha una vez seleccionada
              />
              <input
                type="datetime-local"
                className="form-control"
                placeholder="Check out"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                disabled={datesLocked} // Bloquear el cambio de fecha una vez seleccionada
              />
              <button className="btn btn-primary" onClick={handleFilterRooms} disabled={datesLocked}>
                Filtrar Habitaciones
              </button>
            </div>

            {/* Alerta personalizada si no se selecciona mascota */}
            {showAlert && (
              <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
                <Alert.Heading>¡Atención!</Alert.Heading>
                <p>Por favor, selecciona una mascota antes de continuar con la reserva.</p>
              </Alert>
            )}

            {/* Sección de Mascotas */}
            <h3 className="section-title">Tus Mascotas</h3>
            <div className="mascotas__horizontal-container">
              {mascotas.length > 0 ? (
                mascotas.map((mascota) => {
                  const avatarUrl = mascota[10] || "https://via.placeholder.com/150";
                  const completeAvatarUrl = avatarUrl.startsWith('http')
                    ? avatarUrl
                    : `http://localhost:3000${avatarUrl}`;

                  return (
                    <div
                      className={`mascota__card-horizontal ${selectedMascota === mascota ? 'selected' : ''}`}
                      key={mascota[0]}
                      onClick={() => handleMascotaSelect(mascota)}
                    >
                      <img
                        src={completeAvatarUrl}
                        alt="Mascota Avatar"
                        className="mascota__card-img-horizontal"
                      />
                      <div className="mascota__card-info-horizontal">
                        <h5>{mascota[2]}</h5>
                        <p>Especie: {mascota[3]}</p>
                        <p>Edad: {mascota[7]} años</p>
                        <p>Peso: {mascota[5]} kg</p>
                        <p>Categoría: {mascota[9]}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-mascotas">
                  <p>No tienes mascotas registradas.</p>
                  <Button variant="primary" onClick={() => window.location.href = '/MascotaForm'}>
                    Registrar Mascota
                  </Button>
                </div>
              )}
            </div>

            {/* Listado de habitaciones filtradas */}
            <div className="row g-4">
              {filteredRooms.length > 0 && filteredRooms.map((room, key) => (
                <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s" key={key}>
                  <div className={getRoomClass(room.Estado) + " shadow rounded overflow-hidden"}>
                    <div className="position-relative">
                      <img
                        className="img-fluid room-img"
                        src={getImageUrl(room.Imagenes)}
                        alt={room.Nombre_Habitacion}
                      />
                      <small className="position-absolute start-0 top-100 translate-middle-y bg-primary text-white rounded py-1 px-3 ms-4">
                        ${room.Precio_Base || "N/A"}
                      </small>
                    </div>
                    <div className="p-4 mt-2">
                      <div className="d-flex justify-content-between mb-3">
                        <h5 className="mb-0">{room.Nombre_Habitacion}</h5>
                        <div className="ps-2">{room.Estado === "Disponible" ? "🟢" : "🔴"}</div>
                      </div>
                      <div className="d-flex mb-3">
                        <small className="border-end me-3 pe-3">
                          Capacidad: {room.Capacidad_Maxima} Mascotas
                        </small>
                        <small className="border-end me-3 pe-3">
                          Camas: {room.Cantidad_Camas || "N/A"}
                        </small>
                        <small>Baños Privados: {room.Banos_Propios ? "Sí" : "No"}</small>
                      </div>
                      <p className="text-body mb-3">{room.Descripcion || "Descripción no disponible"}</p>
                      <div className="d-flex justify-content-between">
                        <button
                          className="btn btn-sm btn-primary rounded py-2 px-4"
                          onClick={() => handleDetailsClick(room)}
                        >
                          Ver Detalles
                        </button>
                        <button
                          className="btn btn-sm btn-dark rounded py-2 px-4"
                          onClick={() => handleReserveClick(room)}
                          disabled={!isFiltered} // Deshabilitar el botón de reservar hasta que se filtren las habitaciones
                        >
                          Reservar Ahora
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedRoom && (
              <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                  <Modal.Title>{selectedRoom.Nombre_Habitacion}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <img
                    className="img-fluid mb-4"
                    src={getImageUrl(selectedRoom.Imagenes)}
                    alt={selectedRoom.Nombre_Habitacion}
                  />
                  <h5>Descripción</h5>
                  <p>{selectedRoom.Descripcion}</p>
                  <h5>Detalles</h5>
                  <ul>
                    <li>Estado: {selectedRoom.Estado}</li>
                    <li>Capacidad: {selectedRoom.Capacidad_Maxima} mascotas</li>
                    <li>Tipo de habitación: {selectedRoom.Tipo_Habitacion}</li>
                    <li>Ubicación: {selectedRoom.Ubicacion}</li>
                    <li>Precio: ${selectedRoom.Precio_Base}</li>
                    <li>Baños Privados: {selectedRoom.Banos_Propios ? "Sí" : "No"}</li>
                    <li>Cantidad de camas: {selectedRoom.Cantidad_Camas || "N/A"}</li>
                  </ul>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cerrar
                  </Button>
                </Modal.Footer>
              </Modal>
            )}
          </div>

          {/* Cart Section - Solo mostrar si hay elementos en el carrito */}
          {cartItems && cartItems.room && cartItems.mascota && (
            <div className="col-lg-3 cart-container">
              <Cart />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
