// src/components/MedicalHistoryPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const MedicalHistoryPage = () => {
  const { rollNumber } = useParams();  // Extract roll number from URL
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        const response = await axios.get(`/api/v1/medical-history/${rollNumber}`);  // API call to get the medical history
        setMedicalHistory(response.data.medicalHistory);
      } catch (err) {
        setError("Error fetching medical history");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMedicalHistory();
  }, [rollNumber]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Medical History for Roll Number: {rollNumber}</h1>
      {medicalHistory ? (
        <div>{medicalHistory}</div>
      ) : (
        <p>No medical history available for this user.</p>
      )}
    </div>
  );
};

export default MedicalHistoryPage;
