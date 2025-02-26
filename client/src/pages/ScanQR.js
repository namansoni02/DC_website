import React, { useState } from "react";
import { QrReader } from "react-qr-reader"; // Corrected import for named export
import "../styles/ScanQR.css"; // Import the ScanQR styles

const ScanQR = () => {
  const [scanResult, setScanResult] = useState("");

  const handleScan = (data) => {
    if (data) {
      setScanResult(data);
      alert(`QR Code scanned: ${data}`);
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
        onScan={handleScan}
        onError={handleError}
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
