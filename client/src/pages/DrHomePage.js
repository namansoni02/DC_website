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
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [editing, setEditing] = useState(false);
  const [newRecord, setNewRecord] = useState({ diagnosis: "", prescription: "" });

  const qrScannerRef = useRef(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("/api/v1/doctor/getDoctors", { headers: { Authorization: "Bearer " + localStorage.getItem("token") } });
        if (res.data.success) setDoctors(res.data.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (activeTab === "2") initializeScanner();
    else cleanupScanner();
  }, [activeTab]);

  const initializeScanner = () => {
    cleanupScanner();
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } });
        scanner.render(onScanSuccess);
        qrScannerRef.current = scanner;
      } catch (error) {
        console.error("Error initializing QR scanner:", error);
      }
    }, 500);
  };

  const cleanupScanner = () => {
    if (qrScannerRef.current) {
      try { qrScannerRef.current.clear(); } catch (error) {}
      qrScannerRef.current = null;
    }
  };

  const onScanSuccess = async (decodedText) => {
    const rollNumber = decodedText.split("/").pop();
    if (!rollNumber) return message.error("Invalid QR Code");

    setScanResult(rollNumber);
    setScanLoading(true);

    try {
      const response = await axios.get(`/api/v1/doctor/user-medical-history/${rollNumber}`, { headers: { Authorization: "Bearer " + localStorage.getItem("token") } });
      if (response.data.success) {
        message.success("Medical records loaded");
        setMedicalRecords(response.data.data || []);
        setActiveTab("3");
      } else {
        message.error("Failed to fetch medical records");
      }
    } catch (error) {
      message.error("Error fetching data");
    } finally {
      setScanLoading(false);
    }
  };

  const handleEditChange = (index, field, value) => {
    const updatedRecords = [...medicalRecords];
    updatedRecords[index][field] = value;
    setMedicalRecords(updatedRecords);
  };

  const handleSave = async () => {
    try {
      if (!scanResult) return message.error("No patient selected");

      const res = await axios.put(`/api/v1/doctor/update-medical-history/${scanResult}`, { records: medicalRecords }, { headers: { Authorization: "Bearer " + localStorage.getItem("token") } });

      if (res.data.success) {
        message.success("Medical records updated");
        setEditing(false);
      } else {
        message.error("Failed to update");
      }
    } catch (error) {
      message.error("Error saving data");
    }
  };

  const handleAddRecord = async () => {
    try {
      const res = await axios.post("/api/v1/doctor/create-medical-history", {
        rollNumber: scanResult,
        ...newRecord,
      }, { headers: { Authorization: "Bearer " + localStorage.getItem("token") } });

      if (res.data.success) {
        message.success("New record added");
        setMedicalRecords([...medicalRecords, res.data.data]);
        setNewRecord({ diagnosis: "", prescription: "" });
      } else {
        message.error("Failed to add record");
      }
    } catch (error) {
      message.error("Error adding record");
    }
  };

  return (
    <Layout>
      <h1>Doctor Dashboard</h1>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        { key: "1", label: "Home", children: <Button onClick={() => setActiveTab("2")}>Scan QR</Button> },
        { key: "2", label: "QR Scanner", children: <div><div id="qr-reader" /></div> },
        { key: "3", label: "Medical Records", children: (
          <div>
            <Card><p><strong>Patient ID:</strong> {scanResult}</p></Card>
            <List
              dataSource={medicalRecords}
              renderItem={(record, index) => (
                <Card>
                  <p><strong>Diagnosis:</strong> <Input value={record.diagnosis} onChange={(e) => handleEditChange(index, "diagnosis", e.target.value)} /></p>
                  <p><strong>Prescription:</strong> <Input value={record.prescription} onChange={(e) => handleEditChange(index, "prescription", e.target.value)} /></p>
                </Card>
              )}
            />
            <Card>
              <h3>Add New Record</h3>
              <p><strong>Diagnosis:</strong> <Input value={newRecord.diagnosis} onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })} /></p>
              <p><strong>Prescription:</strong> <Input value={newRecord.prescription} onChange={(e) => setNewRecord({ ...newRecord, prescription: e.target.value })} /></p>
              <Button icon={<PlusOutlined />} onClick={handleAddRecord}>Add Record</Button>
            </Card>
            <Button icon={<SaveOutlined />} onClick={handleSave}>Save All</Button>
            <Button icon={<RedoOutlined />} onClick={() => setActiveTab("2")}>Rescan</Button>
          </div>
        )},
        { key: "4", label: "All Doctors", children: <DoctorList doctors={doctors} /> }
      ]} />
    </Layout>
  );
};

export default DrHomePage;
