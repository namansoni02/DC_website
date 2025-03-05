import React, { useState, useEffect } from "react";
import { DatePicker, message, Card, Button, Tag, Typography, Divider, Row, Col } from "antd";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";
import Layout from "../components/Layout";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { CalendarOutlined, DollarOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const getSpecializationColor = (spec) => {
  if (!spec) return "default";
  const specLower = spec.toLowerCase();
  if (specLower.includes("dentist")) return "blue";
  if (specLower.includes("neurology")) return "purple";
  if (specLower.includes("all rounder")) return "green";
  if (specLower.includes("general")) return "cyan";
  return "geekblue";
};

const BookingPage = () => {
  const { user } = useSelector((state) => state.user);
  const params = useParams();
  const dispatch = useDispatch();
  
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(null); // Use null instead of an empty string
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/doctor/getDoctorById`,
          { doctorId: params.doctorId },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        if (res.data.success) setDoctor(res.data.data);
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      }
    };
    fetchDoctorData();
  }, [params.doctorId]);

  const handleDateChange = (value) => {
    setDate(value); // Store the moment object directly
    setSelectedTime(null);
  };

  const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    let currentTime = moment(startTime, "HH:mm");
    const endTimeMoment = moment(endTime, "HH:mm");
    while (currentTime.isBefore(endTimeMoment)) {
      slots.push(currentTime.format("HH:mm"));
      currentTime = currentTime.add(10, "minutes");
    }
    return slots;
  };

  const handleBooking = async () => {
    if (!date || !selectedTime) {
      return message.warning("Please select a date and time.");
    }
    try {
      dispatch(showLoading());
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/user/book-appointment`,
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctor,
          userInfo: user,
          date: date.format("DD-MM-YYYY"), // Send the appointment date in the correct format
          time: selectedTime,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      dispatch(hideLoading());
      if (res.data.success) message.success(res.data.message);
    } catch (error) {
      dispatch(hideLoading());
      console.error("Booking error:", error);
    }
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "1000px",
    height: "auto",
    maxHeight: "100%",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
    borderRadius: "12px",
    background: "#fff",
    padding: "24px",
    margin: "0 auto"
  };

  const titleStyle = {
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#1a1a1a"
  };

  const infoTextStyle = {
    fontSize: "16px",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center"
  };

  const iconStyle = {
    marginRight: "8px",
    fontSize: "16px",
    color: "#1890ff"
  };

  const timeSlotGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    marginTop: "12px",
    maxHeight: "150px",
    overflowY: "auto",
  };

  const sectionTitleStyle = {
    fontSize: "18px",
    fontWeight: "500",
    marginBottom: "12px",
    color: "#333"
  };

  return (
    <Layout>
      <div className="container mt-4 d-flex justify-content-center">
        {doctor && (
          <Card style={cardStyle} bordered={false}>
            <Title level={2} style={titleStyle}>
              Appointment with Dr. {doctor.name}
            </Title>
            
            <Tag color={getSpecializationColor(doctor.specialization)} style={{ fontSize: "14px", padding: "4px 12px", marginBottom: "16px" }}>
              {doctor.specialization}
            </Tag>
            
            <div style={{ marginBottom: "24px" }}>
              <Text style={infoTextStyle}>
                <DollarOutlined style={iconStyle} /> 
                <Text strong style={{ fontSize: "16px" }}>Consultation Fee:</Text> 
                <Text style={{ fontSize: "16px", marginLeft: "8px" }}>₹{doctor.feesPerConsultation}</Text>
              </Text>
              
              <Text style={infoTextStyle}>
                <ClockCircleOutlined style={iconStyle} /> 
                <Text strong style={{ fontSize: "16px" }}>Available Hours:</Text> 
                <Text style={{ fontSize: "16px", marginLeft: "8px" }}>{doctor.timings?.[0]} - {doctor.timings?.[1]}</Text>
              </Text>
            </div>
            
            <Divider />
            
            <div style={{ marginBottom: "24px" }}>
              <Title level={4} style={sectionTitleStyle}>
                <CalendarOutlined style={{ marginRight: "8px" }} /> Select Appointment Date
              </Title>
              <DatePicker 
                format="DD-MM-YYYY" 
                onChange={handleDateChange}
                style={{ width: "100%", height: "40px", fontSize: "16px" }}
                placeholder="Select a date" 
              />
            </div>

            {date && doctor.timings && (
              <div style={{ marginTop: "24px", marginBottom: "24px" }}>
                <Divider />
                <Title level={4} style={sectionTitleStyle}>Select Time Slot</Title>
                <div style={timeSlotGridStyle}>
                  {generateTimeSlots(doctor.timings[0], doctor.timings[1]).map((slot, index) => (
                    <Button
                      key={index}
                      type={selectedTime === slot ? "primary" : "default"}
                      onClick={() => setSelectedTime(slot)}
                      style={{ 
                        fontSize: "15px",
                        height: "36px",
                        fontWeight: selectedTime === slot ? "600" : "normal"
                      }}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <Divider />
            
            <Row justify="center">
              <Col>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={handleBooking}
                  disabled={!date || !selectedTime}
                  style={{ 
                    fontSize: "16px", 
                    height: "45px", 
                    padding: "0 32px",
                    fontWeight: "500" 
                  }}
                >
                  Book Appointment
                </Button>
              </Col>
            </Row>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default BookingPage;