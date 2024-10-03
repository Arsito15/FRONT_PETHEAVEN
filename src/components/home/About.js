import React from "react";
import Heading from "../common/Heading";
import { about } from "../data/Data";
import { useNavigate } from "react-router-dom"; // Importar useNavigate

export default function About() {
  const navigate = useNavigate(); // Inicializar useNavigate

  const handleExploreMore = () => {
    navigate("/rooms"); // Redirigir a la página de habitaciones
  };

  return (
    <>
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <h6 className="section-title text-start text-primary text-uppercase">
                Acerca de nosotros
              </h6>
              <h1 className="mb-4">
                Bienvenido a{" "}
                <span className="text-primary text-uppercase">PETHEAVEN</span>
              </h1>
              <p className="mb-4">
                En Pet Heaven entendemos lo importante que es encontrar un espacio seguro y cómodo para tus mascotas.
                Por eso, hemos creado una plataforma web que simplifica el proceso de reservar espacios para mascotas
                de todos los tamaños, ya sean pequeñas, medianas o grandes. Nuestro sistema intuitivo te permite verificar 
                disponibilidad, gestionar reservas y recibir notificaciones en tiempo real, asegurando una experiencia 
                fluida tanto para ti como para tu amigo peludo. En Pet Heaven, estamos aquí para hacer que el cuidado de 
                tus mascotas sea más fácil y brindarte la tranquilidad que necesitas.
              </p>
              <div className="row g-3 pb-4">
                {about.map((item, key) => (
                  <div className="col-sm-4 wow fadeIn" data-wow-delay="0.1s" key={key}>
                    <div className="border rounded p-1">
                      <div className="border rounded text-center p-4">
                        {item.icon}
                        <h2 className="mb-1" data-toggle="counter-up">
                          {item.count}
                        </h2>
                        <p className="mb-0">{item.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary py-3 px-5 mt-2" onClick={handleExploreMore}>
                Explorar Más
              </button>
            </div>
            <div className="col-lg-6">
              <div className="row g-3">
                <div className="col-6 text-end">
                  <img
                    className="img-fluid rounded w-75 wow zoomIn"
                    data-wow-delay="0.1s"
                    src="/assets/img/felidog.jpg"
                    style={{ marginTop: "25%" }}
                    alt="felidog"
                  />
                </div>
                <div className="col-6 text-start">
                  <img
                    className="img-fluid rounded w-100 wow zoomIn"
                    data-wow-delay="0.3s"
                    src="/assets/img/chucho.jpg"
                    alt="chucho"
                  />
                </div>
                <div className="col-6 text-end">
                  <img
                    className="img-fluid rounded w-50 wow zoomIn"
                    data-wow-delay="0.5s"
                    src="/assets/img/conejo.jpg"
                    alt="conejo"
                  />
                </div>
                <div className="col-6 text-start">
                  <img
                    className="img-fluid rounded w-75 wow zoomIn"
                    data-wow-delay="0.7s"
                    src="/assets/img/erizo.jpg"
                    alt="erizo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
