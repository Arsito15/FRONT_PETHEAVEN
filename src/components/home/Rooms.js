import React from "react";
import CommonHeading from "../common/CommonHeading";
import { facility, roomItems } from "../data/Data";
import { useNavigate } from "react-router-dom";

export default function Rooms() {
  const navigate = useNavigate();

  const handleDetailsClick = (id) => {
    navigate(`/room/${id}`);
  };

  return (
    <div className="container-xxl py-5">
      <div className="container">
        <CommonHeading
          heading="Nuestras Habitaciones"
          title="Habitaciones"
          subtitle="Explora nuestras"
        />
        <div className="row g-4">
          {roomItems.map((item, key) => (
            <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s" key={key}>
              <div className="room-item shadow rounded overflow-hidden">
                <div className="position-relative">
                  <img className="img-fluid" src={item.img} alt="img" />
                  <small className="position-absolute start-0 top-100 translate-middle-y bg-primary text-white rounded py-1 px-3 ms-4">
                    {item.price}
                  </small>
                </div>
                <div className="p-4 mt-2">
                  <div className="d-flex justify-content-between mb-3">
                    <h5 className="mb-0">{item.name}</h5>
                    <div className="ps-2">{item.star}</div>
                  </div>
                  <div className="d-flex mb-3">
                    {facility.map((facilityItem, index) => (
                      <small className="border-end me-3 pe-3" key={index}>
                        {facilityItem.icon}
                        {facilityItem.quantity} {facilityItem.facility}
                      </small>
                    ))}
                  </div>
                  <p className="text-body mb-3">{item.description}</p>
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-sm btn-primary rounded py-2 px-4"
                      onClick={() => handleDetailsClick(item.id)}  // Evento de clic
                    >
                      Ver Detalles
                    </button>
                    <a className="btn btn-sm btn-dark rounded py-2 px-4" href="#">
                      {item.darkbtn}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
