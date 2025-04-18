import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Button, Card, Tabs, Input, message, Typography, Radio } from "antd";
import { Html5QrcodeScanner } from "html5-qrcode";
import { SaveOutlined, RedoOutlined, PlusOutlined } from "@ant-design/icons";
import FabricDrawingCanvas from "../components/FabricDrawingCanvas";
import "./DrHomePage.css";
import MedicalHistoryFlipbook from "../components/MedicalHistoryFlipbook";

const { Title, Text } = Typography;

const DrHomePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const [scanResult, setScanResult] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    diagnosis: "",
    prescription: "",
    prescriptionImage: "",
  });
  const [prescriptionType, setPrescriptionType] = useState("text");
  const qrScannerRef = useRef(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/doctor/getDoctors`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.data.success) setDoctors(res.data.data);
      } catch (error) {
        message.error("Failed to fetch doctors list");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (activeTab === "2") {
      initializeScanner();
    } else {
      cleanupScanner();
    }

    return () => cleanupScanner();
  }, [activeTab]);

  const initializeScanner = () => {
    cleanupScanner();
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner("qr-reader", {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        });
        scanner.render(onScanSuccess);
        qrScannerRef.current = scanner;
      } catch (error) {
        message.error("Failed to initialize QR scanner");
      }
    }, 500);
  };

  const cleanupScanner = () => {
    if (qrScannerRef.current) {
      try {
        qrScannerRef.current.clear();
      } catch (error) {
        console.error("Error clearing scanner:", error);
      }
      qrScannerRef.current = null;
    }
  };

  const onScanSuccess = async (decodedText) => {
    if (!decodedText) return message.error("Invalid QR Code");

    const rollNumber = decodedText.split("/").pop();
    if (!rollNumber) return message.error("Invalid QR Code format");

    setScanResult(rollNumber);
    setScanLoading(true);

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/doctor/user-medical-history/${rollNumber}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      if (response.data.success) {
        message.success("Medical records loaded");
        setMedicalRecords(response.data.data || []);
        setActiveTab("3");
      } else {
        message.error(
          response.data.message || "Failed to fetch medical records"
        );
      }
    } catch (error) {
      message.error("Error fetching medical records");
    } finally {
      setScanLoading(false);
    }
  };

  const handleSaveDrawing = (imageData) => {
    if (!imageData) {
      message.warning("No drawing data to save");
      return;
    }

    const base64Image = imageData.split(",")[1]; // Store only the Base64 part
    setNewRecord((prev) => ({
      ...prev,
      prescriptionImage: base64Image,
    }));
  };

  const handleAddRecord = async () => {
    if (!scanResult) {
      message.error("No patient ID found. Please scan a QR code first.");
      return;
    }

    if (!newRecord.diagnosis.trim()) {
      message.error("Diagnosis is required");
      return;
    }

    if (prescriptionType === "text" && !newRecord.prescription.trim()) {
      message.error("Prescription text is required");
      return;
    }

    if (prescriptionType === "drawing" && !newRecord.prescriptionImage) {
      message.error("Please save a prescription drawing first");
      return;
    }

    try {
      const recordToSend = {
        rollNumber: scanResult,
        diagnosis: newRecord.diagnosis.trim(),
        prescription:
          prescriptionType === "text"
            ? newRecord.prescription.trim()
            : "See prescription image",
        prescriptionImage:
          prescriptionType === "drawing" ? newRecord.prescriptionImage : "",
      };

        console.log("Sending record:", recordToSend);

        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/doctor/create-medical-history`, recordToSend, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.data.success) {
            message.success("New record added successfully");

            // Fetch updated records instead of clearing them
            const updatedRecords = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/doctor/user-medical-history/${scanResult}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            if (updatedRecords.data.success) {
                setMedicalRecords(updatedRecords.data.data || []);
            }

            // Reset form
            setNewRecord({ diagnosis: "", prescription: "", prescriptionImage: "" });
        } else {
            message.error(res.data.message || "Failed to add record");
        }
      ;

      if (res.data.success) {
        message.success("New record added successfully");

        setScanResult("");
        setMedicalRecords([]);
        setNewRecord({ diagnosis: "", prescription: "", prescriptionImage: "" });
        setActiveTab("2");
      } else {
        message.error(res.data.message || "Failed to add record");
      }
    } catch (error) {
      message.error("Error adding record. Please try again.");
    }
  };

  const renderTabItems = () => [
    {
      key: "1",
      label: "Home",
      children: (
        <div>
          <Title level={3}>Welcome to Doctor Dashboard</Title>
          <Text>Use this dashboard to manage patient records and consultations.</Text>
          <div style={{ marginTop: "20px" }}>
            <Button
              type="primary"
              onClick={() => setActiveTab("2")}
              icon={<PlusOutlined />}
            >
              Scan Patient QR
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "QR Scanner",
      children: (
        <div>
          <Title level={4}>Scan Patient QR Code</Title>
          <div id="qr-reader" style={{ maxWidth: "500px" }} />
          {scanLoading && <Text>Loading patient data...</Text>}
        </div>
      ),
    },
    {
      key: "3",
      label: "Medical History",
      children: (
        <div>
          <Card>
            <p>
              <strong>Patient ID:</strong> {scanResult}
            </p>
          </Card>

          {medicalRecords.length === 0 ? (
            <Text>No medical records found for this patient.</Text>
          ) : (
            <MedicalHistoryFlipbook
              medicalRecords={[...medicalRecords]
               .reverse() // latest first
               .map((record) => ({
                ...record,
               prescriptionImage: record.prescriptionImage
               ? record.prescriptionImage.startsWith("data:image")
               ? record.prescriptionImage
              : `data:image/png;base64,${record.prescriptionImage}`
             : "",
          }))}
          />

          )}

          <Button
            icon={<RedoOutlined />}
            onClick={() => setActiveTab("2")}
            style={{ marginTop: "15px" }}
          >
            Scan Another Patient
          </Button>
        </div>
      ),
    },
    {
      key: "4",
      label: "Write Prescription",
      children: (
        <div>
          <Card className="new-record-card">
            <Title level={4}>Write New Prescription</Title>
            <div style={{ marginBottom: "15px" }}>
              <Text strong>Diagnosis:</Text>
              <Input
                value={newRecord.diagnosis}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, diagnosis: e.target.value })
                }
                placeholder="Enter diagnosis"
                style={{ marginTop: "5px" }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <Text strong>Prescription Type:</Text>
              <Radio.Group
                value={prescriptionType}
                onChange={(e) => setPrescriptionType(e.target.value)}
                style={{ marginLeft: "10px" }}
              >
                <Radio value="text">Text</Radio>
                <Radio value="drawing">Drawing</Radio>
              </Radio.Group>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <Text strong>Prescription:</Text>
              {prescriptionType === "text" ? (
                <Input.TextArea
                  rows={4}
                  value={newRecord.prescription}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, prescription: e.target.value })
                  }
                  placeholder="Enter prescription details"
                  style={{ marginTop: "5px" }}
                />
              ) : (
                <div
                  style={{
                    marginTop: "10px",
                    border: "1px solid #ddd",
                    padding: "10px",
                  }}
                >
                  <FabricDrawingCanvas
                    onSave={handleSaveDrawing}
                    initialImage={
                      newRecord.prescriptionImage
                        ? `data:image/png;base64,${newRecord.prescriptionImage}`
                        : ""
                    }
                  />
                </div>
              )}
            </div>

            <Button icon={<PlusOutlined />} onClick={handleAddRecord} type="primary">
              Add Record
            </Button>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <Title>Doctor Dashboard</Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={renderTabItems()} />
    </Layout>
  );
};

export default DrHomePage;
