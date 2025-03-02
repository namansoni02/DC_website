import React from "react";
import { Card, Avatar, Tag, Divider, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { ClockCircleOutlined, DollarOutlined, UserOutlined, MedicineBoxOutlined } from "@ant-design/icons";

const DoctorList = ({ doctor }) => {
  const navigate = useNavigate();

  // Handle card click to navigate to the appointment booking page
  const handleCardClick = () => {
    navigate(`/doctor/book-appointment/${doctor._id}`);
  };

  // Get appropriate specialization color
  const getSpecializationColor = (spec) => {
    if (!spec) return "default";
    
    const specLower = spec.toLowerCase();
    if (specLower.includes("dentist")) return "blue";
    if (specLower.includes("neurology")) return "purple";
    if (specLower.includes("all rounder")) return "green";
    if (specLower.includes("general")) return "cyan";
    return "geekblue";
  };

  return (
    <Card
      className="m-2"
      style={{ 
        cursor: "pointer",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
      }}
      onClick={handleCardClick}
      hoverable
      cover={
        <div style={{ 
          height: "140px", 
          background: "linear-gradient(135deg,rgb(55, 152, 243) 0%, rgb(55, 152, 243) 100%)",
          padding: "20px 0",
          textAlign: "center"
        }}>
          <Avatar 
            size={100} 
            icon={<UserOutlined />} 
            src="https://via.placeholder.com/300"
            style={{ 
              border: "4px solid white",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
            }} 
          />
        </div>
      }
    >
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: "600", 
          marginBottom: "8px",
          color: "#0B2447" 
        }}>
          {`Dr. ${doctor.name}`}
        </h3>
        <Tag color={getSpecializationColor(doctor.specialization)}>
          {doctor.specialization || "Specialization not specified"}
        </Tag>
      </div>
      
      <Divider style={{ margin: "12px 0" }} />
      
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <UserOutlined style={{ color: "#19376D", marginRight: "8px" }} />
          <span>
            <b>Experience:</b> {doctor.experience} years
          </span>
        </div>
        
        <div style={{ display: "flex", alignItems: "center" }}>
          <DollarOutlined style={{ color: "#19376D", marginRight: "8px" }} />
          <span>
            <b>Fees Per Consultation:</b> ₹{doctor.feesPerConsultation}
          </span>
        </div>
        
        <div style={{ display: "flex", alignItems: "center" }}>
          <ClockCircleOutlined style={{ color: "#19376D", marginRight: "8px" }} />
          <span>
            <b>Timings:</b> {doctor.timings[0]} - {doctor.timings[1]}
          </span>
        </div>
      </Space>
    </Card>
  );
};

export default DoctorList;