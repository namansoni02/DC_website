const express = require("express");
const {
  doctorloginController,
  doctorregisterController,
  doctorauthController,
  getAllDoctorsController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
} = require("../controllers/doctorCtrl.js");
const authMiddleware = require("../middlewares/authMiddlewares.js");
const router = express.Router();
const MedicalRecord = require("../models/medicalRecordModel.js");
const userModel = require("../models/userModels.js");

// Fetch medical history by rollNumber
router.get("/user-medical-history/:rollNumber", authMiddleware, async (req, res) => {
  try {
    const { rollNumber } = req.params;
    let patient = await userModel.findOne({ rollNumber });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const records = await MedicalRecord.find({ patient: patient._id }).populate("doctor", "name");

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    console.error("Error fetching medical records:", error);
    res.status(500).json({ success: false, message: "Error fetching medical records" });
  }
});

// ✅ FIXED: Change from POST to PUT for updating medical history
router.put("/update-medical-history/:rollNumber", authMiddleware, async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const { diagnosis, symptoms, prescription, notes, followUpDate, attachments, doctorId } = req.body;

    console.log(`Updating medical history for Roll Number: ${rollNumber}`, req.body);

    let patient = await userModel.findOne({ rollNumber });
    if (!patient) {
      patient = new userModel({ rollNumber });
      await patient.save();
      console.log("✅ Created new patient record for Roll Number:", rollNumber);
    }

    const doctor = await userModel.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // ✅ FIX: Ensure symptoms is always an array
    const formattedSymptoms = Array.isArray(symptoms) ? symptoms : symptoms ? [symptoms] : [];

    // ✅ FIX: Instead of creating a new record each time, update the latest one or create if none exist
    const existingRecord = await MedicalRecord.findOne({ patient: patient._id }).sort({ createdAt: -1 });

    if (existingRecord) {
      existingRecord.diagnosis = diagnosis;
      existingRecord.symptoms = formattedSymptoms;
      existingRecord.prescription = prescription;
      existingRecord.notes = notes;
      existingRecord.followUpDate = followUpDate;
      existingRecord.attachments = attachments;
      await existingRecord.save();
    } else {
      const newRecord = new MedicalRecord({
        patient: patient._id,
        doctor: doctorId,
        diagnosis,
        symptoms: formattedSymptoms,
        prescription,
        notes,
        followUpDate,
        attachments,
      });
      await newRecord.save();
    }

    res.status(200).json({ success: true, message: "Medical record updated successfully" });
  } catch (error) {
    console.error("Error saving medical record:", error);
    res.status(500).json({ success: false, message: "Error saving medical record" });
  }
});

// Doctor routes
router.post("/login", doctorloginController);
router.post("/doctorregister", doctorregisterController);
router.get("/auth", authMiddleware, doctorauthController);
router.get("/getDoctors", authMiddleware, getAllDoctorsController);
router.post("/updateProfile", authMiddleware, updateProfileController);
router.post("/getDoctorById", authMiddleware, getDoctorByIdController);
router.get("/doctor-appointments", authMiddleware, doctorAppointmentsController);
router.post("/update-status", authMiddleware, updateStatusController);

module.exports = router;
