import { Link } from "react-router-dom";
import { footerContact, footerItem } from "../data/Data"; // Eliminamos socialIcons

export default function Footer() {
  return (
    <>
      <div
        className="container-fluid bg-dark text-light footer wow fadeIn"
        data-wow-delay="0.1s"
      >
        <div className="container pb-5">
          <div className="row g-5">
            {/* Sección de Información */}
            <div className="col-md-6 col-lg-4">
              <div className="bg-primary rounded p-4">
                <Link to="/">
                  <h1 className="text-white text-uppercase mb-3">PETHEAVEN</h1>
                </Link>
                <p className="text-white mb-0">
                  El lugar perfecto para tus mascotas
                </p>
              </div>
            </div>

            {/* Sección de Contacto */}
            <div className="col-md-6 col-lg-3">
              <h6 className="section-title text-start text-primary text-uppercase mb-4">
                Contáctanos
              </h6>
              {footerContact.map((val, index) => (
                <p className="mb-2" key={index}>
                  {val.icon} {val.name}
                </p>
              ))}
            </div>

            {/* Sección de Enlaces Rápidos */}
            <div className="col-lg-5 col-md-12">
              <div className="row gy-5 g-4">
                {footerItem.map((section, sectionIndex) => (
                  <div className="col-md-6" key={sectionIndex}>
                    <h6 className="section-title text-start text-primary text-uppercase mb-4">
                      {section.header}
                    </h6>
                    {section.UnitItem.map((item, itemIndex) => (
                      <button className="btn btn-link" key={itemIndex}> {/* Usar botón en lugar de enlace */}
                        {item.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Espacio adicional */}
      <div className="container-fluid bg-dark">
        <div className="container py-1">
          <p className="text-center text-white mb-0">
            © 2024 PetHeaven. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </>
  );
}
