import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Spin, Button, Row, Col, Card } from "antd"; // Import necessary Ant Design components

const ProfilePage = () => {
  const [userData, setUserData] = useState(null); // State for user profile data
  const [loading, setLoading] = useState(true); // Loading state for spinner
  const [showQr, setShowQr] = useState(false); // Toggle QR code visibility

  // Fetch user profile data
  const getUserProfile = async () => {
    try {
      const res = await axios.get("/api/v1/user/getUserData", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setUserData(res.data.data);
      } else {
        console.log("Error fetching user profile data");
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false); // Stop loading when data is fetched
    }
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  return (
    <Layout>
      <h1 className="text-center">Profile Page</h1>

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
      {showQr && userData && userData.qrCode && (
        <div
          className="qr-code-container"
          style={{ textAlign: "center", marginBottom: "20px" }}
        >
          <h3>Your QR Code</h3>
          <img
            src={userData.qrCode}
            alt="User QR Code"
            style={{ width: "200px", height: "200px" }}
          />
        </div>
      )}

      {/* Display User Profile Data */}
      <Row justify="center">
        {loading ? (
          <Spin size="large" /> // Display loading spinner
        ) : (
          userData && (
            <Col xs={24} sm={16} md={12}>
              <Card title="Profile Information" bordered={false}>
                <p>
                  <strong>Name:</strong> {userData.name}
                </p>
                <p>
                  <strong>Email:</strong> {userData.email}
                </p>
                <p>
                  <strong>Contact:</strong> {userData.contact || "N/A"}
                </p>
                <p>
                  <strong>Specialization:</strong>{" "}
                  {userData.specialization || "N/A"}
                </p>
              </Card>
            </Col>
          )
        )}
      </Row>
    </Layout>
  );
};

export default ProfilePage;
