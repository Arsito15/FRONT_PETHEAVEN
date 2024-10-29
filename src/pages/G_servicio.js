import React, { useEffect, useState } from "react";
import axios from "axios";
import "./G_servicio.css"; // Archivo CSS específico para los estilos

export default function AdminServiceForm() {
  const [serviceFormData, setServiceFormData] = useState({
    nombreServicio: "",
    descripcion: "",
    precio: "",
    duracion: "",
    tipo: ""
  });

  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(false); // Estado para controlar si se está editando
  const [selectedServiceId, setSelectedServiceId] = useState(null); // Servicio seleccionado para editar
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Estado para almacenar el texto de búsqueda

  useEffect(() => {
    // Obtener todos los servicios registrados
    axios
      .get("http://localhost:3000/api/servicios")
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
        console.error("Error al obtener los servicios:", error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setServiceFormData({
      ...serviceFormData,
      [name]: value
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); // Actualiza el texto de búsqueda
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editing && selectedServiceId) {
        // Editar el servicio existente
        const updatedService = {
          nombreServicio: serviceFormData.nombreServicio,
          descripcion: serviceFormData.descripcion,
          precio: parseFloat(serviceFormData.precio),
          duracion: parseFloat(serviceFormData.duracion),
          tipo: serviceFormData.tipo
        };

        await axios.put(`http://localhost:3000/api/servicios/${selectedServiceId}`, updatedService);
        setSuccessMessage("Servicio editado correctamente.");
      } else {
        // Crear nuevo servicio
        const newService = {
          nombreServicio: serviceFormData.nombreServicio,
          descripcion: serviceFormData.descripcion,
          precio: parseFloat(serviceFormData.precio),
          duracion: parseFloat(serviceFormData.duracion),
          tipo: serviceFormData.tipo
        };

        await axios.post("http://localhost:3000/api/servicios", newService);
        setSuccessMessage("Servicio registrado correctamente.");
      }
      window.location.reload(); // Recargar la página para mostrar los cambios
    } catch (error) {
      setErrorMessage("Error al procesar la solicitud. Intenta nuevamente.");
      console.error("Error al procesar la solicitud:", error);
    }
  };

  const handleEditService = (service) => {
    setServiceFormData({
      nombreServicio: service.Nombre_Servicio,
      descripcion: service.Descripcion,
      precio: service.Precio,
      duracion: service.Duracion,
      tipo: service.Tipo
    });
    setSelectedServiceId(service.Servicio_ID); // Guardar el ID del servicio
    setEditing(true);
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await axios.delete(`http://localhost:3000/api/servicios/${serviceId}`);
      setSuccessMessage("Servicio eliminado correctamente.");
      window.location.reload();
    } catch (error) {
      setErrorMessage("Error al eliminar el servicio.");
      console.error("Error al eliminar el servicio:", error);
    }
  };

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

  const filteredServices = services.filter((service) => {
    return (
      service.Nombre_Servicio.toLowerCase().includes(searchQuery.toLowerCase()) || // Buscar por nombre de servicio
      service.Tipo.toLowerCase().includes(searchQuery.toLowerCase()) // Buscar por tipo de servicio
    );
  });

  return (
    <div className="admin-service-form__container">
      {/* Barra de búsqueda */}
      <div className="search__container">
        <input
          type="text"
          placeholder="Buscar por nombre o tipo de servicio"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search__input"
        />
      </div>

      {/* Formulario para crear o editar servicios */}
      <div className="admin-service-form__form-wrapper">
        <h2 className="admin-service-form__title">{editing ? `Editar Servicio` : "Registrar Nuevo Servicio"}</h2>
        <form onSubmit={handleSubmit} className="admin-service-form__form">
          <div className="admin-service-form__form-group">
            <label htmlFor="nombreServicio" className="admin-service-form__label">Nombre *</label>
            <input
              type="text"
              id="nombreServicio"
              name="nombreServicio"
              className="admin-service-form__input"
              value={serviceFormData.nombreServicio}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="admin-service-form__form-group">
            <label htmlFor="descripcion" className="admin-service-form__label">Descripción *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              className="admin-service-form__input"
              value={serviceFormData.descripcion}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="admin-service-form__form-group">
            <label htmlFor="precio" className="admin-service-form__label">Precio *</label>
            <input
              type="number"
              id="precio"
              name="precio"
              className="admin-service-form__input"
              value={serviceFormData.precio}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="admin-service-form__form-group">
            <label htmlFor="duracion" className="admin-service-form__label">Duración (horas) *</label>
            <input
              type="number"
              id="duracion"
              name="duracion"
              className="admin-service-form__input"
              value={serviceFormData.duracion}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="admin-service-form__form-group">
            <label htmlFor="tipo" className="admin-service-form__label">Tipo de Servicio *</label>
            <select
              id="tipo"
              name="tipo"
              className="admin-service-form__input"
              value={serviceFormData.tipo}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Cuidados">Cuidados</option>
              <option value="Clases">Clases</option>
              <option value="Recreacion">Recreación</option>
              <option value="Ejercitacion">Ejercitación</option>
            </select>
          </div>

          <button type="submit" className="admin-service-form__btn btn btn-primary mt-3">
            {editing ? "Editar Servicio" : "Registrar Servicio"}
          </button>
          {successMessage && <p className="admin-service-form__success-message text-success">{successMessage}</p>}
          {errorMessage && <p className="admin-service-form__error-message text-danger">{errorMessage}</p>}
        </form>
      </div>

      {/* Sección para mostrar los servicios registrados */}
      <div className="services__container">
        {Object.keys(groupedServices).map((tipo, index) => (
          <div key={index} className="service-group">
            <h3 className="text-center my-4">{tipo}</h3>
            <div className="row g-4">
              {groupedServices[tipo].map((service, idx) => (
                <div className="col-lg-4 col-md-6" key={idx}>
                  <div className="service__card">
                    <div className="service-icon">
                      <img
                        src={getIconUrl(service.Tipo)}
                        alt={service.Nombre_Servicio}
                        className="service-icon-img"
                      />
                    </div>
                    <h5 className="mb-3">{service.Nombre_Servicio}</h5>
                    <p>{service.Descripcion}</p>
                    <p><strong>Precio:</strong> ${service.Precio.toFixed(2)}</p>
                    <p><strong>Duración:</strong> {service.Duracion} horas</p>
                    <div className="service__card-actions">
                      <button className="btn btn-primary" onClick={() => handleEditService(service)}>Editar</button>
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          if (window.confirm(`¿Estás seguro de que deseas eliminar el servicio ${service.Nombre_Servicio}?`)) {
                            handleDeleteService(service.Servicio_ID);
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
