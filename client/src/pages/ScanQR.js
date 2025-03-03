// pages/ScanQR.js
import React, { useState } from "react";
import Layout from "../components/Layout";
import { QrReader } from "react-qr-reader";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

function ScanQR() {
  const [scannedData, setScannedData] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const handleScan = (result, error) => {
    if (error) {
      console.error(error);
      toast.error("Error accessing camera");
      return;
    }

    if (result?.text && !loading) {
      setLoading(true);
      setScannedData(result.text);
      
      // Simulating a small delay before navigating
      setTimeout(() => {
        navigate(`/doctor/user/${result.text}`);
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <Layout>
      <h1 className="page-title">Scan Patient QR Code</h1>
      <div className="qr-scanner-container">
        {user?.isDoctor ? (
          <>
            <QrReader
              constraints={{ facingMode: "environment" }} // Back camera
              onResult={handleScan}
              style={{ width: "100%" }}
            />
            <p>Scan a patient's QR code to view their details</p>
            {scannedData && <p>Scanned: {scannedData}</p>}
            {loading && <p>Loading...</p>}
          </>
        ) : (
          <p>Only doctors can access this feature</p>
        )}
      </div>
    </Layout>
  );
}

export default ScanQR;
