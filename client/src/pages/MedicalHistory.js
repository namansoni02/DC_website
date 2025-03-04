import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Typography, Collapse, message } from "antd";
import Layout from "../components/Layout";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const UserMedicalHistory = () => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        const res = await axios.get("/api/v1/user/user-medical-history/current", {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        });
        
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
        <Text>Loading medical records...</Text>
      ) : medicalRecords.length === 0 ? (
        <Card>
          <Text>No medical records found.</Text>
        </Card>
      ) : (
        <Collapse accordion>
          {medicalRecords
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((record, index) => (
              <Panel 
                header={`Date: ${new Date(record.createdAt).toLocaleString()}`} 
                key={index}
              >
                <Card>
                  <Text strong>Diagnosis:</Text>
                  <p>{record.diagnosis}</p>

                  {record.prescription && (
                    <>
                      <Text strong>Prescription:</Text>
                      <p>{record.prescription}</p>
                    </>
                  )}

                  {record.prescriptionImage && (
                    <div className="prescription-image-container">
                      <Text strong>Prescription Image:</Text>
                      <img 
                        src={record.prescriptionImage} 
                        alt="Prescription Drawing" 
                        style={{ maxWidth: "100%", marginTop: "10px", border: "1px solid #ddd" }} 
                      />
                    </div>
                  )}
                </Card>
              </Panel>
            ))}
        </Collapse>
      )}
    </Layout>
  );
};

export default UserMedicalHistory;