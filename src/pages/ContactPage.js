import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import Heading from "../components/common/Heading";
import CommonHeading from "../components/common/CommonHeading";
import axios from "axios";

export default function Contact() {
  const { userData } = useAuth(); // Obtén los datos del usuario desde AuthContext
  const [formData, setFormData] = useState({
    name: "",
    email: userData ? userData.email : "", // Usa el correo del usuario autenticado
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/send-email", formData);
      console.log("Correo enviado: ", response.data);
      alert("Correo enviado con éxito");
    } catch (error) {
      console.error("Error enviando el correo: ", error);
      alert("Hubo un error enviando el correo");
    }
  };

  return (
    <>
      <Heading heading="Contactanos" title="PETHEAVEN" />

      <div className="container-xxl py-5">
        <div className="container">
          <CommonHeading
            heading="Contactanos"
            subtitle="Contactanos"
            title="Para cualquier consulta"
          />
          <div className="row g-4">
            <div className="col-md-6">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                      />
                      <label htmlFor="name">Tu nombre</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Tu correo"
                        readOnly
                      />
                      <label htmlFor="email">Tu correo</label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        id="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Asunto"
                      />
                      <label htmlFor="subject">Asunto</label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-floating">
                      <textarea
                        className="form-control"
                        placeholder="Deja tu mensaje"
                        id="message"
                        style={{ height: "150px" }}
                        value={formData.message}
                        onChange={handleChange}
                      ></textarea>
                      <label htmlFor="message">Mensaje</label>
                    </div>
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary w-100 py-3" type="submit">
                      Enviar mensaje
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-md-6">
              {/* Mapa y otros elementos */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
