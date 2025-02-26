import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Input, Button, message } from "antd";

const MedicalHistory = () => {
  const { rollNumber } = useParams();
  const [medicalHistory, setMedicalHistory] = useState("");
  const [isDoctor, setIsDoctor] = useState(false);

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        const res = await axios.get(`/api/v1/user/medical-history/${rollNumber}`, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        if (res.data.success) {
          setMedicalHistory(res.data.data.medicalHistory);
          setIsDoctor(localStorage.getItem("isDoctor") === "true");
        }
      } catch (error) {
        message.error("Error fetching medical history");
      }
    };

    fetchMedicalHistory();
  }, [rollNumber]);

  const handleUpdate = async () => {
    try {
      const res = await axios.post(
        `/api/v1/user/medical-history/${rollNumber}`,
        { medicalHistory },
        { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
      );
      if (res.data.success) message.success("Medical history updated");
    } catch (error) {
      message.error("Error updating history");
    }
  };

  return (
    <div>
      <h2>Medical History of Roll No: {rollNumber}</h2>
      {isDoctor ? (
        <Input.TextArea
          rows={6}
          value={medicalHistory}
          onChange={(e) => setMedicalHistory(e.target.value)}
        />
      ) : (
        <p>{medicalHistory}</p>
      )}
      {isDoctor && <Button type="primary" onClick={handleUpdate}>Save</Button>}
    </div>
  );
};

export default MedicalHistory;
