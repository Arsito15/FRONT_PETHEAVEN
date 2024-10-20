import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import "./MascotaForm.css";  // Archivo CSS específico para los estilos

export default function MascotaForm() {
  const { userData } = useAuth();  // Datos del usuario desde el contexto
  const [mascotaFormData, setMascotaFormData] = useState({
    nombreMascota: "",
    especie: "",
    raza: "",
    edad: "",
    peso: "",
    sexo: "",
    categoria: "",
    avatarUrl: "",
    propietarioId: "",  // Para asociar la mascota con el propietario
    emailPropietario: "",  // Mostrar el correo del propietario
  });
  const [mascotas, setMascotas] = useState([]);  // Estado para almacenar mascotas registradas
  const [selectedFile, setSelectedFile] = useState(null);  // Estado para el archivo de imagen
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editing, setEditing] = useState(false);  // Estado para controlar si se está editando
  const [selectedMascotaId, setSelectedMascotaId] = useState(null);  // Mascota seleccionada para editar
  const [showAlert, setShowAlert] = useState(false);  // Estado para controlar la alerta
  const [mascotaToDelete, setMascotaToDelete] = useState(null);  // Mascota seleccionada para eliminar
  const fileInputRef = useRef(null);  // Referencia al input para subir imágenes

  // Listados de opciones para especie y categoría
  const especiesDisponibles = ["Perro", "Gato", "Cerdo", "Serpiente", "Erizo"];
  const categoriasDisponibles = ["Domestico", "Exotico", "Salvaje"];

  useEffect(() => {
    if (userData) {
      setMascotaFormData({
        ...mascotaFormData,
        propietarioId: userData.USUARIO_ID || "",
        emailPropietario: userData.CORREO || "",
      });

      // Obtener las mascotas registradas para el propietario
      axios.get(`http://localhost:3000/api/mascotas/${userData.USUARIO_ID}`)
        .then((response) => {
          console.log('Mascotas obtenidas:', response.data);
          setMascotas(response.data);
        })
        .catch((error) => {
          console.error("Error al obtener las mascotas del usuario:", error);
        });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMascotaFormData({
      ...mascotaFormData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);  // Guardar el archivo en el estado
      const imageUrl = URL.createObjectURL(file);  // Crear una URL temporal para mostrar la imagen seleccionada
      setMascotaFormData({
        ...mascotaFormData,
        avatarUrl: imageUrl,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombreMascota", mascotaFormData.nombreMascota);
    formData.append("especie", mascotaFormData.especie);
    formData.append("raza", mascotaFormData.raza);
    formData.append("edad", mascotaFormData.edad);
    formData.append("peso", mascotaFormData.peso);
    formData.append("sexo", mascotaFormData.sexo);
    formData.append("categoria", mascotaFormData.categoria);
    formData.append("propietarioId", mascotaFormData.propietarioId);

    // Si no se seleccionó un nuevo archivo, enviar la URL existente de la imagen
    if (selectedFile) {
      formData.append("file", selectedFile);
    } else if (mascotaFormData.avatarUrl) {
      formData.append("fotoUrl", mascotaFormData.avatarUrl);  // Enviar la URL existente si no se selecciona una nueva imagen
    }

    try {
      if (editing && selectedMascotaId) {
        // Si está editando, asegúrate de enviar el ID correctamente en la URL
        await axios.put(`http://localhost:3000/api/mascotas/${selectedMascotaId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccessMessage("Mascota editada correctamente.");
      } else {
        // Si no está editando, crea una nueva mascota
        await axios.post("http://localhost:3000/api/mascotas/nueva", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccessMessage("Mascota registrada correctamente.");
      }

      window.location.reload();  // Recargar la página para mostrar los cambios
    } catch (error) {
      setErrorMessage("Error al procesar la solicitud. Intenta nuevamente.");
      console.error("Error al procesar la solicitud:", error);
    }
  };

  const handleViewDetails = (mascota) => {
    if (mascota && mascota[0]) {
      setMascotaFormData({
        nombreMascota: mascota[2],
        especie: mascota[3],
        raza: mascota[4] || "",
        edad: mascota[7],
        peso: mascota[5],
        sexo: mascota[8],
        categoria: mascota[9],
        avatarUrl: mascota[10] ? `http://localhost:3000${mascota[10]}` : "",
        propietarioId: userData.USUARIO_ID,
        emailPropietario: userData.CORREO,
      });
      setSelectedMascotaId(mascota[0]);
      setEditing(true);
    }
  };

  const handleDeleteMascota = (mascotaId) => {
    setMascotaToDelete(mascotaId);
    setShowAlert(true);  // Mostrar alerta personalizada
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/mascotas/${mascotaToDelete}`);
      setSuccessMessage("Mascota eliminada correctamente.");
      window.location.reload();  // Recargar la página para mostrar los cambios
    } catch (error) {
      setErrorMessage("Error al eliminar la mascota.");
      console.error("Error al eliminar la mascota:", error);
    }
    setShowAlert(false);  // Cerrar alerta
  };

  return (
    <div className="mascota-form__container">
      {showAlert && (
        <>
          <div className="alert-overlay"></div>
          <div className="custom-alert">
            <p>¿Estás seguro de que deseas eliminar esta mascota?</p>
            <button className="btn-confirmar" onClick={confirmDelete}>Confirmar</button>
            <button className="btn-cancelar" onClick={() => setShowAlert(false)}>Cancelar</button>
          </div>
        </>
      )}
      <div className="mascota-form__profile">
        <div
          className="mascota-form__avatar-container"
          onClick={() => fileInputRef.current.click()}  // Al hacer clic, abrimos el selector de archivos
        >
          <img
            src={mascotaFormData.avatarUrl || "https://via.placeholder.com/150"}
            alt="Mascota Avatar"
            className="mascota-form__avatar"
          />
          <div className="mascota-form__avatar-overlay">
            <span>Agregar Foto</span>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}  // Ocultamos el input de archivo
          onChange={handleFileChange}
          accept="image/*"
        />
        <p className="mascota-form__email">Propietario: {mascotaFormData.emailPropietario}</p> {/* Mostramos el email del propietario */}
      </div>
      <div className="mascota-form__form-wrapper">
        <h2 className="mascota-form__title">{editing ? `Detalles de ${mascotaFormData.nombreMascota}` : "Registrar Nueva Mascota"}</h2>
        <form onSubmit={handleSubmit} className="mascota-form__form">
          <div className="mascota-form__form-group">
            <label htmlFor="nombreMascota" className="mascota-form__label">Nombre *</label>
            <input
              type="text"
              id="nombreMascota"
              name="nombreMascota"
              className="mascota-form__input"
              value={mascotaFormData.nombreMascota}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mascota-form__form-group">
            <label htmlFor="especie" className="mascota-form__label">Especie *</label>
            <input
              list="especies"
              id="especie"
              name="especie"
              className="mascota-form__input"
              value={mascotaFormData.especie}
              onChange={handleInputChange}
              required
            />
            <datalist id="especies">
              {especiesDisponibles.map((especie, index) => (
                <option key={index} value={especie} />
              ))}
            </datalist>
          </div>

          <div className="mascota-form__form-group">
            <label htmlFor="raza" className="mascota-form__label">Raza (opcional)</label>
            <input
              type="text"
              id="raza"
              name="raza"
              className="mascota-form__input"
              value={mascotaFormData.raza}
              onChange={handleInputChange}
            />
          </div>

          <div className="mascota-form__form-group">
            <label htmlFor="edad" className="mascota-form__label">Edad *</label>
            <input
              type="number"
              id="edad"
              name="edad"
              className="mascota-form__input"
              value={mascotaFormData.edad}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mascota-form__form-group">
            <label htmlFor="peso" className="mascota-form__label">Peso (opcional)</label>
            <input
              type="text"
              id="peso"
              name="peso"
              className="mascota-form__input"
              value={mascotaFormData.peso}
              onChange={handleInputChange}
            />
          </div>

          <div className="mascota-form__form-group">
            <label htmlFor="sexo" className="mascota-form__label">Sexo *</label>
            <input
              type="text"
              id="sexo"
              name="sexo"
              className="mascota-form__input"
              value={mascotaFormData.sexo}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mascota-form__form-group">
            <label htmlFor="categoria" className="mascota-form__label">Categoría *</label>
            <input
              list="categorias"
              id="categoria"
              name="categoria"
              className="mascota-form__input"
              value={mascotaFormData.categoria}
              onChange={handleInputChange}
              required
            />
            <datalist id="categorias">
              {categoriasDisponibles.map((categoria, index) => (
                <option key={index} value={categoria} />
              ))}
            </datalist>
          </div>

          <button type="submit" className="mascota-form__btn btn btn-primary mt-3">
            {editing ? "Editar Mascota" : "Registrar Mascota"}
          </button>
          {successMessage && <p className="mascota-form__success-message text-success">{successMessage}</p>}
          {errorMessage && <p className="mascota-form__error-message text-danger">{errorMessage}</p>}
        </form>
      </div>

      {/* Sección para mostrar las mascotas registradas */}
      <div className="mascotas__container">
        {mascotas.length > 0 ? (
          <div className="mascotas__list">
            {mascotas.map((mascota) => {
              const avatarUrl = mascota[10] || "https://via.placeholder.com/150";
              const completeAvatarUrl = avatarUrl.startsWith('http')
                ? avatarUrl
                : `http://localhost:3000${avatarUrl}`;

              return (
                <div className="mascota__card" key={mascota[0]}>
                  <img src={completeAvatarUrl} alt="Mascota Avatar" className="mascota__card-img" />
                  <div className="mascota__card-info">
                    <h3>{mascota[2]}</h3>
                    <p>Especie: {mascota[3]}</p>
                    <p>Edad: {mascota[7]} años</p>
                    <p>Peso: {mascota[5]} kg</p>
                    <p>Categoría: {mascota[9]}</p>
                    <div className="mascota__card-actions">
                      <button className="btn btn-primary" onClick={() => handleViewDetails(mascota)}>Ver Detalles</button>
                      <button className="btn btn-danger" onClick={() => handleDeleteMascota(mascota[0])}>Eliminar</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No tienes mascotas registradas.</p>
        )}
      </div>
    </div>
  );
}
