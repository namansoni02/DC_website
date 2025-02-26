import React from "react";
import { Card } from "antd";
import { useNavigate } from "react-router-dom";

const DoctorList = ({ doctor }) => {
  const navigate = useNavigate();

  // Handle card click to navigate to the appointment booking page
  const handleCardClick = () => {
    navigate(`/doctor/book-appointment/${doctor._id}`);
  };

  return (
    <Card
      className="m-2"
      style={{ cursor: "pointer" }}
      onClick={handleCardClick}
      hoverable
      cover={<img alt="Doctor" src="https://via.placeholder.com/300" />}
    >
      <Card.Meta
        title={`Dr. ${doctor.name}`}
        description={`Specialization: ${doctor.specialization}`}
      />
      <div className="card-body">
        <p>
          <b>Experience:</b> {doctor.experience} years
        </p>
        <p>
          <b>Fees Per Consultation:</b> ₹{doctor.feesPerConsultation}
        </p>
        <p>
          <b>Timings:</b> {doctor.timings[0]} - {doctor.timings[1]}
        </p>
      </div>
    </Card>
  );
};

export default DoctorList;
