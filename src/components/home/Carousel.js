import React, { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { carouselData } from "../data/Data";
import { useNavigate } from "react-router-dom";  // Importamos el hook de navegación

export default function Carousel() {
  const sliderRef = useRef(null);
  const navigate = useNavigate();  // Inicializamos el hook de navegación

  const next = () => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  };

  const previous = () => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev();
    }
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <>
      <div className="container-fluid" style={{ padding: 0, margin: 0, overflow: "hidden" }}>
        <div
          id="header-carousel"
          className="carousel slide"
          data-bs-ride="carousel"
          style={{ margin: 0, padding: 0, width: "100vw", overflow: "hidden" }} // Ajustamos el ancho del carrusel a todo el viewport
        >
          <div className="carousel-inner" style={{ margin: 0, padding: 0 }}>
            <Slider ref={sliderRef} {...settings}>
              {carouselData.map((val, index) => (
                <div
                  className="carousel-item"
                  key={index}
                  style={{ margin: 0, padding: 0 }} // Eliminamos margen y padding
                >
                  <img
                    className="w-100"
                    src={val.img}
                    alt="Image"
                    style={{
                      margin: 0,
                      padding: 0,
                      objectFit: "cover", // Asegura que la imagen cubra el contenedor sin deformarse
                      width: "100vw", // Ajustamos el ancho al 100% del viewport
                      height: "100vh", // Ocupar toda la altura del viewport
                      display: "block",
                    }}
                  />
                  <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
                    <div className="p-3" style={{ maxWidth: "700px" }}>
                      <h6 className="section-title text-white text-uppercase mb-3 animated slideInDown">
                        {val.subtitle}
                      </h6>
                      <h1 className="display-3 text-white mb-4 animated slideInDown">
                        {val.title}
                      </h1>
                      <button
                        onClick={() => navigate('/Rooms')}  // Redirige a la página de habitaciones
                        className="btn btn-primary py-md-3 px-md-5 me-3 animated slideInLeft"
                      >
                        {val.btn1}
                      </button>
                      <button
                        onClick={() => navigate('/Booking')}  // Redirige a la página de reservas activas
                        className="btn btn-light py-md-3 px-md-5 animated slideInRight"
                      >
                        {val.btn2}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            onClick={previous}
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            onClick={next}
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </>
  );
}
