// pages/UserMedicalHistory.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import moment from "moment";

function UserMedicalHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.user);

  const getMedicalRecords = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/medical-records/user/${user?._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (response.data.success) {
        setRecords(response.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching medical records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      getMedicalRecords();
    }
  }, [user]);

  return (
    <Layout>
      <h1 className="page-title">My Medical History</h1>
      
      {loading ? (
        <p>Loading medical records...</p>
      ) : records.length === 0 ? (
        <div className="empty-records">
          <p>No medical records found.</p>
        </div>
      ) : (
        <div className="medical-records-list">
          {records.map((record) => (
            <div key={record._id} className="record-card">
              <div className="record-header">
                <h3>Visit Date: {moment(record.visitDate).format("MMMM Do YYYY")}</h3>
                <p>Doctor: {record.doctor.name}</p>
              </div>
              
              <div className="record-body">
                <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                
                {record.symptoms.length > 0 && (
                  <div>
                    <p><strong>Symptoms:</strong></p>
                    <ul>
                      {record.symptoms.map((symptom, index) => (
                        <li key={index}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {record.prescription && (
                  <p><strong>Prescription:</strong> {record.prescription}</p>
                )}
                
                {record.notes && (
                  <p><strong>Notes:</strong> {record.notes}</p>
                )}
                
                {record.followUpDate && (
                  <p><strong>Follow Up:</strong> {moment(record.followUpDate).format("MMMM Do YYYY")}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default UserMedicalHistory;