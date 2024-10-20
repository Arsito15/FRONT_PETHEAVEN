import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import "./UserForm.css";  // Archivo CSS específico para los estilos

export default function UserForm() {
  const { userData } = useAuth();  // Datos del usuario desde el contexto
  const [userFormData, setUserFormData] = useState({
    nombreUsuario: "",
    email: "",
    avatarUrl: "",
    telefono: "",
    rol: "usuario",  // Predeterminado como "usuario"
  });
  const [selectedFile, setSelectedFile] = useState(null);  // Estado para el archivo de imagen
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);  // Referencia al input para subir imágenes

  useEffect(() => {
    if (userData) {
      console.log("Datos del usuario recibidos en el formulario:", userData); // Verificar si 'telefono' está aquí
      
      // Verificamos si 'AVATAR_URL' es null o undefined, y si no lo es, lo procesamos
      const avatarUrl = userData.AVATAR_URL || "https://via.placeholder.com/150";  // Valor predeterminado si es nulo
  
      // Comprobar si es una URL externa o del servidor
      const completeAvatarUrl = avatarUrl.startsWith('http')
        ? avatarUrl  // Si es una URL externa
        : `http://localhost:3000${avatarUrl}`;  // Si es una imagen en el servidor
  
      setUserFormData({
        nombreUsuario: userData.NOMBRE_USUARIO,
        email: userData.CORREO,
        avatarUrl: completeAvatarUrl,
        telefono: userData.TELEFONO || "",  // Si el teléfono existe, lo usamos; si no, valor predeterminado vacío
        rol: userData.ROL || "usuario",
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData({
      ...userFormData,
      [name]: value,
    });
  };

  // Manejo del archivo seleccionado
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);  // Guardar el archivo en el estado
      const imageUrl = URL.createObjectURL(file);  // Crear una URL temporal para mostrar la imagen seleccionada
      setUserFormData({
        ...userFormData,
        avatarUrl: imageUrl,
      });
    }
  };

  // Enviar datos al backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Crear un FormData para enviar los datos y la imagen
    const formData = new FormData();
    formData.append("nombreUsuario", userFormData.nombreUsuario);
    formData.append("telefono", userFormData.telefono);
    formData.append("avatarUrl", userFormData.avatarUrl);  // Agregar la URL actual si no se ha subido una imagen
    formData.append("usuarioId", userData.USUARIO_ID);

    // Solo agregar el archivo si se seleccionó uno
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      // Realizar la petición PUT al servidor
      await axios.put("http://localhost:3000/api/usuarios/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage("Perfil actualizado correctamente.");
    } catch (error) {
      setErrorMessage("Error al actualizar el perfil. Intenta nuevamente.");
      console.error("Error al actualizar el perfil:", error);
    }
  };

  return (
    <div className="user-form__container">
      <div className="user-form__profile">
        <div
          className="user-form__avatar-container"
          onClick={() => fileInputRef.current.click()}  // Al hacer clic, abrimos el selector de archivos
        >
          <img
            src={userFormData.avatarUrl}
            alt="User Avatar"
            className="user-form__avatar"
          />
          <div className="user-form__avatar-overlay">
            <span>Editar</span>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}  // Ocultamos el input de archivo
          onChange={handleFileChange}
          accept="image/*"
        />
        <p className="user-form__email">{userFormData.email}</p>  {/* El correo es visible pero no editable */}
      </div>
      <div className="user-form__form-wrapper">
        <h2 className="user-form__title">Mi Perfil</h2>
        <form onSubmit={handleSubmit} className="user-form__form">
          <div className="user-form__form-group">
            <label htmlFor="nombreUsuario" className="user-form__label">Nombre *</label>
            <input
              type="text"
              id="nombreUsuario"
              name="nombreUsuario"
              className="user-form__input"
              value={userFormData.nombreUsuario}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="user-form__form-group">
            <label htmlFor="telefono" className="user-form__label">Teléfono (opcional)</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              className="user-form__input"
              value={userFormData.telefono}
              onChange={handleInputChange}
            />
          </div>

          <div className="user-form__form-group">
            <label htmlFor="rol" className="user-form__label">Rol</label>
            <input
              type="text"
              id="rol"
              name="rol"
              className="user-form__input"
              value={userFormData.rol}
              disabled  // El rol no debe ser editable por el usuario
            />
          </div>

          <div className="user-form__form-group">
            <label htmlFor="email" className="user-form__label">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="user-form__input"
              value={userFormData.email}
              disabled  // No permitimos cambiar el email
            />
          </div>

          <button type="submit" className="user-form__btn btn btn-primary mt-3">
            Guardar Perfil
          </button>
          {successMessage && <p className="user-form__success-message text-success">{successMessage}</p>}
          {errorMessage && <p className="user-form__error-message text-danger">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
}
