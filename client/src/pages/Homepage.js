import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import { Row, Spin, Button } from "antd"; // Added Spin for loading indicator
import DoctorList from "../components/DoctorList";

const HomePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(""); // State for user's QR code
  const [showQr, setShowQr] = useState(false); // Define the state for toggling QR code visibility

  // login user data
  const getDoctors = async () => {
    try {
      const res = await axios.get("/api/v1/doctor/getDoctors", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.log("Error fetching doctors:", error);
    }
  };

  const getUserData = async () => {
    try {
      const res = await axios.get("/api/v1/user/getUserData", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        console.log("User QR Code:", res.data.data.qrCode); // Log the QR code response
        setQrCode(res.data.data.qrCode);
      } else {
        console.log("No Qr code in the response");
      }
    } catch (error) {
      console.log("Error fetching user data:", error);
    }
  };

  // Combine both API calls
  const fetchData = async () => {
    setLoading(true); // Start loading
    await Promise.all([getDoctors(), getUserData()]); // Fetch both doctors and user data
    setLoading(false); // Stop loading after fetching data
  };

  useEffect(() => {
    fetchData();
  }, []);


  return (
    <Layout>
      <h1 className="text-center">Home Page</h1>
      {/* Button to toggle QR Code visibility */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Button
          type="primary"
          onClick={() => setShowQr(!showQr)} // Toggle QR visibility
        >
          {showQr ? "Hide Your QR" : "Show Your QR"}
        </Button>
      </div>

      {/* Conditionally display User's QR Code */}
      {showQr && qrCode && (
        <div
          className="qr-code-container"
          style={{ textAlign: "center", marginBottom: "20px" }}
        >
          <h3>Your QR Code</h3>
          <img
            src={qrCode}
            alt="User QR Code"
            style={{ width: "200px", height: "200px" }}
          />
        </div>
      )}

      {/* Display Doctors List */}
      <Row>
        {loading ? (
          <Spin size="large" /> // Display loading spinner
        ) : (
          doctors &&
          doctors.map((doctor) => (
            <DoctorList key={doctor._id} doctor={doctor} />
          ))
        )}
      </Row>
    </Layout>
  );
};

export default HomePage;
