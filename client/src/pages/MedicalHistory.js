import "./UserMedicalHistory.css"; // Remember to add this CSS


import React, { useEffect, useState } from "react";
import axios from "axios";
import { Typography, message, Spin } from "antd";
import Layout from "../components/Layout";

const { Title, Text } = Typography;

const UserMedicalHistory = () => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        const res = await axios.get(
          "/api/v1/user/user-medical-history/current",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.data.success) {
          setMedicalRecords(res.data.data || []);
        } else {
          message.info("No medical records found");
        }
      } catch (error) {
        console.error("Error fetching medical records:", error);
        message.error("Failed to fetch medical records");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalHistory();
  }, []);

  return (
    <Layout>
      <Title level={2}>My Medical History</Title>

      {loading ? (
        <Spin size="large" />
      ) : medicalRecords.length === 0 ? (
        <Text>No medical records found.</Text>
      ) : (
        <div className="vertical-scroll-container">
          {medicalRecords
            .filter((record) => record.prescriptionImage)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((record, index) => (
              <div key={index} className="vertical-image-card">
                <Text strong className="date-text">
                  {new Date(record.createdAt).toLocaleDateString()}
                </Text>
                <img
                  src={
                    record.prescriptionImage.startsWith("data:image")
                      ? record.prescriptionImage
                      : `data:image/png;base64,${record.prescriptionImage}`
                  }
                  alt="Prescription"
                  className="vertical-history-image"
                />
              </div>
            ))}
        </div>
      )}
    </Layout>
  );
};

export default UserMedicalHistory;
