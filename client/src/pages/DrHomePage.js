import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Button, Card, Tabs, Input, message, List, Spin } from "antd";
import { Html5QrcodeScanner } from "html5-qrcode";
import { EditOutlined, SaveOutlined, RedoOutlined, PlusOutlined } from "@ant-design/icons";
import DoctorList from "../components/DoctorList";
import "./DrHomePage.css";

const DrHomePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const [scanResult, setScanResult] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const qrScannerRef = useRef(null);
  const scannerInitializedRef = useRef(false);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [editing, setEditing] = useState(false);

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

  useEffect(() => {
    return () => cleanupScanner();
  }, []);

  useEffect(() => {
    if (activeTab === "2") {
      initializeScanner();
    } else {
      cleanupScanner();
    }
  }, [activeTab]);

  const initializeScanner = () => {
    cleanupScanner();
    setTimeout(() => {
      try {
        const qrElement = document.getElementById("qr-reader");
        if (!qrElement) return;
        const scanner = new Html5QrcodeScanner("qr-reader", {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        });
        scanner.render(onScanSuccess);
        qrScannerRef.current = scanner;
        scannerInitializedRef.current = true;
      } catch (error) {
        console.error("Error initializing QR scanner:", error);
      }
    }, 500);
  };

  const cleanupScanner = () => {
    if (qrScannerRef.current && scannerInitializedRef.current) {
      try {
        qrScannerRef.current.clear();
      } catch (error) {
        console.error("Error clearing QR scanner:", error);
      }
      qrScannerRef.current = null;
      scannerInitializedRef.current = false;
    }
  };

  const onScanSuccess = async (decodedText) => {
    console.log("QR Code Scanned:", decodedText);
    const rollNumber = decodedText.split("/").pop();
    if (!rollNumber) {
      message.error("Invalid QR Code");
      return;
    }
    setScanResult(rollNumber);
    setScanLoading(true);

    try {
      const response = await axios.get(`/api/v1/doctor/user-medical-history/${rollNumber}`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      if (response.data.success) {
        message.success("Medical records loaded successfully");
        setMedicalRecords(response.data.data || []);
        setActiveTab("3");
      } else {
        message.error("Failed to fetch medical records");
      }
    } catch (error) {
      console.error("API error:", error);
      message.error("Error fetching data");
    } finally {
      setScanLoading(false);
    }
  };

  const handleEditChange = (index, field, value) => {
    const updatedRecords = [...medicalRecords];
    updatedRecords[index][field] = field === "symptoms" ? value.split(",").map(s => s.trim()) : value;
    setMedicalRecords(updatedRecords);
  };

  const handleSave = async () => {
    try {
      if (!scanResult) {
        message.error("No patient selected");
        return;
      }
      const res = await axios.post(`/api/v1/doctor/update-medical-history/${scanResult}`,
        { records: medicalRecords },
        { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
      );
      if (res.data.success) {
        message.success("Medical records updated");
        setEditing(false);
      } else {
        message.error("Failed to update");
      }
    } catch (error) {
      console.error("Update error:", error);
      message.error("Error saving data");
    }
  };

  const handleRescan = () => {
    setScanResult("");
    setActiveTab("2");
    setTimeout(() => initializeScanner(), 300);
  };

  const addNewRecord = () => {
    setMedicalRecords([
      ...medicalRecords,
      {
        diagnosis: "",
        symptoms: [], // Fixed: Symptoms should always be an array
        prescription: "",
        notes: "",
        followUpDate: "",
      },
    ]);
    setEditing(true);
  };

  const tabItems = [
    { key: "1", label: "Home", children: <Button onClick={() => setActiveTab("2")}>Scan QR</Button> },
    {
      key: "2", label: "QR Scanner",
      children: (
        <div>
          <div id="qr-reader" style={{ maxWidth: "500px", margin: "0 auto" }} />
          {scanLoading && <Spin />}
        </div>
      ),
    },
    {
      key: "3", label: "Patient Medical Records",
      children: (
        <Card title="Patient Medical History" style={{ margin: "20px", padding: "20px" }}>
          <p><strong>Patient ID:</strong> {scanResult}</p>
          <List
            bordered
            dataSource={medicalRecords}
            renderItem={(record, index) => (
              <List.Item>
                <div style={{ width: "100%" }}>
                  <p><strong>Diagnosis:</strong></p>
                  <Input value={record.diagnosis} onChange={(e) => handleEditChange(index, "diagnosis", e.target.value)} disabled={!editing} />

                  <p><strong>Symptoms:</strong></p>
                  <Input.TextArea
                    value={Array.isArray(record.symptoms) ? record.symptoms.join(", ") : ""}
                    onChange={(e) => handleEditChange(index, "symptoms", e.target.value)}
                    disabled={!editing}
                  />

                  <p><strong>Prescription:</strong></p>
                  <Input value={record.prescription} onChange={(e) => handleEditChange(index, "prescription", e.target.value)} disabled={!editing} />

                  <p><strong>Notes:</strong></p>
                  <Input.TextArea value={record.notes} onChange={(e) => handleEditChange(index, "notes", e.target.value)} disabled={!editing} />

                  <p><strong>Follow-up Date:</strong></p>
                  <Input type="date" value={record.followUpDate?.split("T")[0] || ""} onChange={(e) => handleEditChange(index, "followUpDate", e.target.value)} disabled={!editing} />
                </div>
              </List.Item>
            )}
          />
          <Button icon={<EditOutlined />} onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : "Edit"}
          </Button>
          {editing && <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>Save</Button>}
          <Button icon={<PlusOutlined />} onClick={addNewRecord}>Add New Record</Button>
          <Button icon={<RedoOutlined />} onClick={handleRescan}>Scan New Patient</Button>
        </Card>
      ),
    },
    { key: "4", label: "All Doctors", children: <DoctorList doctors={doctors} /> },
  ];

  return (
    <Layout>
      <h1>Doctor Dashboard</h1>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </Layout>
  );
};

export default DrHomePage;
