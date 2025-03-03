import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import { Button, Row, Spin, Card, Tabs } from "antd";
import DoctorList from "../components/DoctorList";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

const DrHomePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");

  // QR Scanner States
  const [scanResult, setScanResult] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState("");
  const qrScannerRef = useRef(null);
  const navigate = useNavigate();

  // Fetch doctors list
  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await axios.get("/api/v1/doctor/getDoctors", {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        if (res.data.success) setDoctors(res.data.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, []);

  // Initialize QR Scanner when QR Tab is active
  useEffect(() => {
    if (activeTab === "2") {
      setTimeout(() => {
        const qrElement = document.getElementById("qr-reader");
        if (!qrElement) {
          console.error("QR Scanner element not found.");
          return;
        }

        const scanner = new Html5QrcodeScanner("qr-reader", {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        });

        scanner.render(
          async (decodedText) => {
            if (decodedText) await handleScan(decodedText);
          },
          (error) => {
            console.error("QR Scan Error:", error);
          }
        );

        qrScannerRef.current = scanner;
      }, 500); // Delay ensures DOM is updated
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.clear();
        qrScannerRef.current = null;
      }
    };
  }, [activeTab]);

  // Handle successful scan
  const handleScan = async (userId) => {
    if (!userId) return;
    setScanLoading(true);
    setScanResult(userId);

    try {
      const response = await axios.get(
        `/api/v1/doctor/user-medical-history/${userId}`,
        {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        }
      );

      if (response.data.success) {
        navigate(`/doctor/user/${userId}`, {
          state: { userData: response.data.data, fromScanner: true },
        });
      } else {
        setScanError("Failed to fetch user data.");
      }
    } catch (err) {
      setScanError("Failed to fetch user data. Please try again.");
      console.error(err);
    } finally {
      setScanLoading(false);
    }
  };

  const tabItems = [
    {
      key: "1",
      label: "Home",
      children: loading ? (
        <div className="text-center my-5">
          <Spin size="large" />
        </div>
      ) : (
        <Row className="mt-3">
          <Card title="Welcome to your Dashboard" className="w-100">
            <p>Use the QR Scanner to quickly access user records.</p>
            <Button type="primary" onClick={() => setActiveTab("2")}>
              Scan User QR
            </Button>
            <Button className="ms-2" onClick={() => setActiveTab("3")}>
              View All Doctors
            </Button>
          </Card>
        </Row>
      ),
    },
    {
      key: "2",
      label: "QR Scanner",
      children: (
        <div className="doctor-qr-scanner">
          <h2>Scan User QR Code</h2>
          <p>Scan the user's QR code to access their medical history.</p>

          <div id="qr-reader" style={{ maxWidth: "500px", margin: "0 auto" }} />

          {scanLoading && (
            <div className="text-center my-3">
              <Spin tip="Loading user data..." />
            </div>
          )}

          {scanError && (
            <div className="error-message mt-3 p-3 bg-danger text-white text-center">
              <p>{scanError}</p>
              <Button type="primary" onClick={() => setScanError("")}>
                Dismiss
              </Button>
            </div>
          )}

          {scanResult && !scanLoading && !scanError && (
            <div className="scan-result mt-3 p-3 bg-success text-white text-center">
              <p>User ID: {scanResult}</p>
              <p>Redirecting to user details...</p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "3",
      label: "All Doctors",
      children: <DoctorList doctors={doctors} />,
    },
  ];

  return (
    <Layout>
      <h1 className="text-center">Doctor Dashboard</h1>

      <Tabs
        defaultActiveKey="1"
        activeKey={activeTab}
        onChange={setActiveTab}
        className="mt-4"
        items={tabItems}
      />
    </Layout>
  );
};

export default DrHomePage;
