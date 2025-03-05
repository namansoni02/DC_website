import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import { Row, Spin, Button, Typography, Card, Divider, Empty } from "antd";
import { QrcodeOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import DoctorList from "../components/DoctorList";

const { Title, Text } = Typography;

const HomePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [showQr, setShowQr] = useState(false);

  const getDoctors = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/doctor/getDoctor`, {
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
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/user/getUserData`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        console.log("User QR Code:", res.data.data.qrCode);
        setQrCode(res.data.data.qrCode);
      } else {
        console.log("No Qr code in the response");
      }
    } catch (error) {
      console.log("Error fetching user data:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([getDoctors(), getUserData()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="page-container" style={{ padding: "24px" }}>
        {/* Header Section */}
        <div className="page-header" style={{ marginBottom: "32px", textAlign: "center" }}>
          <Title 
            level={2} 
            style={{ 
              color: "#1890ff", 
              marginBottom: "16px",
              fontWeight: "600"
            }}
          >
            <MedicineBoxOutlined style={{ marginRight: "12px" }} />
            Healthcare Dashboard
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Find and connect with the best healthcare professionals
          </Text>
        </div>

        {/* QR Code Section */}
        <Card 
          style={{ 
            marginBottom: "32px", 
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={4} style={{ margin: 0 }}>Your Digital Health ID</Title>
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              onClick={() => setShowQr(!showQr)}
              size="large"
              style={{ borderRadius: "6px" }}
            >
              {showQr ? "Hide QR Code" : "Show QR Code"}
            </Button>
          </div>

          {showQr && qrCode && (
            <div
              className="qr-code-container"
              style={{ 
                textAlign: "center", 
                marginTop: "24px",
                padding: "16px",
                background: "#f9f9f9",
                borderRadius: "8px" 
              }}
            >
              <Text type="secondary" style={{ display: "block", marginBottom: "12px" }}>
                Show this QR code to your healthcare provider
              </Text>
              <img
                src={qrCode}
                alt="User QR Code"
                style={{ 
                  width: "200px", 
                  height: "200px",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  padding: "8px",
                  background: "white"
                }}
              />
            </div>
          )}
        </Card>

        {/* Doctors List Section */}
        <Card 
          title={
            <Title level={4} style={{ margin: 0 }}>
              Available Doctors
            </Title>
          }
          style={{ 
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
              <Text style={{ display: "block", marginTop: "16px" }}>
                Loading available doctors...
              </Text>
            </div>
          ) : doctors && doctors.length > 0 ? (
            <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
              {doctors.map((doctor) => (
                <DoctorList key={doctor._id} doctor={doctor} />
              ))}
            </Row>
          ) : (
            <Empty
              description="No doctors available at the moment"
              style={{ padding: "40px 0" }}
            />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default HomePage;