// pages/UserDetail.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import moment from "moment";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    patient: userId,
    diagnosis: "",
    symptoms: "",
    prescription: "",
    notes: "",
    followUpDate: "",
  });
  const { user: currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Fetch user details and medical records
  const getUserDetails = async () => {
    try {
      const userResponse = await axios.post(
        "/api/admin/get-user-info-by-id",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (userResponse.data.success) {
        setUser(userResponse.data.data);
      }

      const recordsResponse = await axios.get(
        `/api/medical-records/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (recordsResponse.data.success) {
        setRecords(recordsResponse.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error fetching user details");
    } finally {
      setLoading(false);
    }
  };

  // Create a new medical record
  const createMedicalRecord = async (e) => {
    e.preventDefault();
    try {
      // Convert comma-separated symptoms to an array
      const formattedRecord = {
        ...newRecord,
        symptoms: newRecord.symptoms.split(",").map(s => s.trim()),
      };

      const response = await axios.post(
        "/api/medical-records/create",
        formattedRecord,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Medical record created successfully");
        setNewRecord({
          patient: userId,
          diagnosis: "",
          symptoms: "",
          prescription: "",
          notes: "",
          followUpDate: "",
        });
        setShowForm(false);
        getUserDetails(); // Refresh the records
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error creating medical record");
    }
  };

  useEffect(() => {
    if (!currentUser?.isDoctor) {
      navigate("/");
      return;
    }
    
    getUserDetails();
  }, [userId, currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord({
      ...newRecord,
      [name]: value,
    });
  };

  return (
    <Layout>
      <div className="user-detail-page">
        {loading ? (
          <p>Loading user details...</p>
        ) : !user ? (
          <p>User not found</p>
        ) : (
          <>
            <div className="user-info-section">
              <h2>Patient Information</h2>
              <div className="user-info-card">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                {/* Add other user details as needed */}
              </div>
            </div>

            <div className="medical-records-section">
              <div className="section-header">
                <h2>Medical Records</h2>
                <button 
                  className="add-record-btn"
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? "Cancel" : "Add New Record"}
                </button>
              </div>

              {showForm && (
                <div className="new-record-form">
                  <h3>Create New Medical Record</h3>
                  <form onSubmit={createMedicalRecord}>
                    <div className="form-group">
                      <label>Diagnosis</label>
                      <input
                        type="text"
                        name="diagnosis"
                        value={newRecord.diagnosis}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Symptoms (comma-separated)</label>
                      <input
                        type="text"
                        name="symptoms"
                        value={newRecord.symptoms}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Prescription</label>
                      <textarea
                        name="prescription"
                        value={newRecord.prescription}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Notes</label>
                      <textarea
                        name="notes"
                        value={newRecord.notes}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Follow-Up Date</label>
                      <input
                        type="date"
                        name="followUpDate"
                        value={newRecord.followUpDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <button type="submit" className="submit-btn">
                      Create Record
                    </button>
                  </form>
                </div>
              )}

              {records.length === 0 ? (
                <p>No medical records found for this patient.</p>
              ) : (
                <div className="records-list">
                  {records.map((record) => (
                    <div key={record._id} className="record-card">
                      <div className="record-header">
                        <h3>Date: {moment(record.visitDate).format("MMMM Do YYYY")}</h3>
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
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default UserDetail;