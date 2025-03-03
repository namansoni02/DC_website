import React, { useState } from "react";
import { QrReader } from "react-qr-reader"; // Corrected import for named export
import "../styles/ScanQR.css"; // Import the ScanQR styles
import { useNavigate } from "react-router-dom"; // Import the hook to handle navigation


//GenerateQR.js
const ScanQR = () => {
  const [scanResult, setScanResult] = useState("");
  const navigate = useNavigate(); // To navigate to the medical history page

  const handleScan = (data) => {
    if (data) {
      setScanResult(data);
      alert(`QR Code scanned: ${data}`);
      
      // Assuming the scanned data contains the roll number or ID to fetch medical history
      const rollNumber = data; // Extract the roll number or medical history ID from the scanned QR code
      
      // Redirect to the medical history page using the scanned roll number or ID
      navigate(`/medical-history/${rollNumber}`);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div className="scan-qr-container">
      <h2>Scan QR Code</h2>
      <QrReader
        delay={300}
        style={{ width: "100%" }}
        onResult={(result, error) => {
          if (!!result) {
            handleScan(result?.text); // Updated to use the correct handler
          }

          if (!!error) {
            handleError(error);
          }
        }}
      />
      {scanResult && (
        <div>
          <h3>Scan Result: {scanResult}</h3>
        </div>
      )}
    </div>
  );
};

export default ScanQR;
