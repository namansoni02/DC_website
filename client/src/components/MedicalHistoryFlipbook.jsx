import React from "react";
import { Typography } from "antd";
import "./MedicalHistoryFlipbook.css"; // Make sure to create this CSS file

const { Title, Text } = Typography;

const MedicalHistoryFlipbook = ({ medicalRecords }) => {
  const prescriptionImages = medicalRecords
    .filter((record) => record.prescriptionImage)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((record) => ({
      image: record.prescriptionImage.startsWith("data:image")
        ? record.prescriptionImage
        : `data:image/png;base64,${record.prescriptionImage}`,
      date: record.createdAt,
      diagnosis: record.diagnosis,
      id: record._id,
    }));

  return (
    <div>
      {prescriptionImages.length === 0 ? (
        <Text>No prescription images found.</Text>
      ) : (
        <div className="vertical-scroll-container-flipbook">
          {prescriptionImages.map((record, index) => (
            <div key={record.id} className="vertical-image-card-flipbook">
              <Text strong className="date-text-flipbook">
                {new Date(record.date).toLocaleDateString()}
              </Text>
              {/* <Text className="diagnosis-text-flipbook">
                Diagnosis: {record.diagnosis}
              </Text> */}
              <img
                src={record.image}
                alt={`Prescription ${index + 1}`}
                className="vertical-history-image-flipbook"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalHistoryFlipbook;
