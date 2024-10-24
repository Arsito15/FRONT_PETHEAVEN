import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./G_usuario.css";  // Archivo CSS para los estilos

export default function AdminUserForm() {
  const [userFormData, setUserFormData] = useState({
    nombreUsuario: "",
    email: "",
    avatarUrl: "",
    telefono: "",
    rol: "usuario",  // Valor predeterminado
    contraseña: "",  // Incluí el campo de contraseña
  });

  const [users, setUsers] = useState([]);  // Estado para almacenar usuarios registrados
  const [selectedFile, setSelectedFile] = useState(null);  // Estado para el archivo de imagen
  const [editing, setEditing] = useState(false);  // Estado para controlar si se está editando
  const [selectedUserId, setSelectedUserId] = useState(null);  // Usuario seleccionado para editar
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");  // Estado para almacenar el texto de búsqueda
  const fileInputRef = useRef(null);  // Referencia al input para subir imágenes

  useEffect(() => {
    // Obtener todos los usuarios registrados
    axios.get("http://localhost:3000/api/usuarios")
      .then((response) => {
        setUsers(response.data);  // Establecer los usuarios obtenidos en el estado
      })
      .catch((error) => {
        console.error("Error al obtener los usuarios:", error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData({
      ...userFormData,
      [name]: value,
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);  // Actualiza el texto de búsqueda
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editing && selectedUserId) {
        // Editar el usuario existente
        const formData = new FormData();
        formData.append("usuarioId", selectedUserId);
        formData.append("nombreUsuario", userFormData.nombreUsuario);
        formData.append("email", userFormData.email);
        formData.append("telefono", userFormData.telefono);
        formData.append("rol", userFormData.rol);
        formData.append("avatarUrl", userFormData.avatarUrl);

        // Solo agregar el archivo si se seleccionó uno
        if (selectedFile) {
          formData.append("file", selectedFile);
        }

        await axios.put("http://localhost:3000/api/usuarios/update", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSuccessMessage("Usuario editado correctamente.");
      } else {
        // Crear nuevo usuario
        const formData = new FormData();
        formData.append("nombreUsuario", userFormData.nombreUsuario);
        formData.append("email", userFormData.email);
        formData.append("telefono", userFormData.telefono);
        formData.append("rol", userFormData.rol);
        formData.append("avatarUrl", userFormData.avatarUrl);
        formData.append("contraseña", userFormData.contraseña);

        // Solo agregar el archivo si se seleccionó uno
        if (selectedFile) {
          formData.append("file", selectedFile);
        }

        await axios.post("http://localhost:3000/api/usuarios", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSuccessMessage("Usuario registrado correctamente.");
      }
      window.location.reload();  // Recargar la página para mostrar los cambios
    } catch (error) {
      setErrorMessage("Error al procesar la solicitud. Intenta nuevamente.");
      console.error("Error al procesar la solicitud:", error);
    }
  };

  const handleEditUser = (user) => {
    const avatarUrl = user.AVATAR_URL ? (user.AVATAR_URL.startsWith('http') ? user.AVATAR_URL : `http://localhost:3000${user.AVATAR_URL}`) : "https://via.placeholder.com/150";

    setUserFormData({
      nombreUsuario: user.NOMBRE_USUARIO,
      email: user.CORREO,
      avatarUrl: avatarUrl,
      telefono: user.TELEFONO || "",  // Si no hay teléfono, deja vacío
      rol: user.ROL,
      contraseña: "",  // No llenar la contraseña al editar
    });
    setSelectedUserId(user.USUARIO_ID);  // Guardar el ID del usuario
    setEditing(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:3000/api/usuarios/${userId}`);
      setSuccessMessage("Usuario eliminado correctamente.");
      window.location.reload();
    } catch (error) {
      setErrorMessage("Error al eliminar el usuario.");
      console.error("Error al eliminar el usuario:", error);
    }
  };

  // Filtrar usuarios según el texto de búsqueda
  const filteredUsers = users.filter((user) => {
    return (
      user.NOMBRE_USUARIO.toLowerCase().includes(searchQuery.toLowerCase()) ||  // Buscar por nombre de usuario
      user.TELEFONO?.toString().includes(searchQuery)  // Buscar por teléfono (convertido a string por si es numérico)
    );
  });

  return (
    <div className="admin-user-form__container">
      <div className="admin-user-form__form-wrapper">
        <h2 className="admin-user-form__title">{editing ? `Editar Usuario` : "Registrar Nuevo Usuario"}</h2>
        <form onSubmit={handleSubmit} className="admin-user-form__form">
          <div className="admin-user-form__form-group">
            <label htmlFor="nombreUsuario" className="admin-user-form__label">Nombre *</label>
            <input
              type="text"
              id="nombreUsuario"
              name="nombreUsuario"
              className="admin-user-form__input"
              value={userFormData.nombreUsuario}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="admin-user-form__form-group">
            <label htmlFor="email" className="admin-user-form__label">Correo *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="admin-user-form__input"
              value={userFormData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {!editing && (
            <div className="admin-user-form__form-group">
              <label htmlFor="contraseña" className="admin-user-form__label">Contraseña *</label>
              <input
                type="password"
                id="contraseña"
                name="contraseña"
                className="admin-user-form__input"
                value={userFormData.contraseña}
                onChange={handleInputChange}
                required={!editing}  // Solo requerir cuando no estés editando
              />
            </div>
          )}

          <div className="admin-user-form__form-group">
            <label htmlFor="rol" className="admin-user-form__label">Rol *</label>
            <select
              id="rol"
              name="rol"
              className="admin-user-form__input"
              value={userFormData.rol}
              onChange={handleInputChange}
            >
              <option value="usuario">Usuario</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="admin-user-form__form-group">
            <label htmlFor="avatar" className="admin-user-form__label">Avatar</label>
            <div className="admin-user-form__avatar-container" onClick={() => fileInputRef.current.click()}>
              <img
                src={userFormData.avatarUrl}
                alt="User Avatar"
                className="admin-user-form__avatar"
              />
              <div className="admin-user-form__avatar-overlay">
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
          </div>

          <button type="submit" className="admin-user-form__btn btn btn-primary mt-3">
            {editing ? "Editar Usuario" : "Registrar Usuario"}
          </button>
          {successMessage && <p className="admin-user-form__success-message text-success">{successMessage}</p>}
          {errorMessage && <p className="admin-user-form__error-message text-danger">{errorMessage}</p>}
        </form>
      </div>

      {/* Sección para mostrar los usuarios registrados */}
      <div className="users__container">
        {/* Barra de búsqueda arriba del listado */}
        <div className="search__container">
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono"
            value={searchQuery}
            onChange={handleSearchChange}
            className="search__input"
          />
        </div>

        {filteredUsers.length > 0 ? (
          <div className="users__list">
            {filteredUsers.map((user) => (
              <div className="user__card" key={user.USUARIO_ID}>
                <img
                  src={user.AVATAR_URL ? (user.AVATAR_URL.startsWith('http') ? user.AVATAR_URL : `http://localhost:3000${user.AVATAR_URL}`) : "https://via.placeholder.com/150"}
                  alt="User Avatar"
                  className="user__avatar"
                />
                <div className="user__details">
                  <h3>{user.NOMBRE_USUARIO}</h3>
                  <p>Email: {user.CORREO}</p>
                  <p>Teléfono: {user.TELEFONO}</p>
                  <p>Rol: {user.ROL}</p>
                </div>
                <div className="user__card-actions">
                  <button className="btn btn-primary" onClick={() => handleEditUser(user)}>Editar</button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.NOMBRE_USUARIO}?`)) {
                        handleDeleteUser(user.USUARIO_ID);
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay usuarios registrados.</p>
        )}
      </div>
    </div>
  );
}
