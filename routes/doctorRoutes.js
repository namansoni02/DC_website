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
const doctorModel = require("../models/doctorModel.js"); // ✅ Ensure correct doctor model is used

// ✅ Fetch Medical History by Roll Number
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

// ✅ Update or Create Medical History by Roll Number
router.put("/v1/doctor/update-medical-history/:rollNumber", authMiddleware, async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const { diagnosis, symptoms, prescription, notes, followUpDate, attachments, doctorId } = req.body;

    console.log(`Updating medical history for Roll Number: ${rollNumber}`, req.body);

    // ✅ Ensure Doctor ID is provided
    if (!doctorId) {
      return res.status(400).json({ success: false, message: "Doctor ID is required" });
    }

    // ✅ Find patient by roll number
    let patient = await userModel.findOne({ rollNumber });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // ✅ Find doctor by doctorId
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // ✅ Convert symptoms into an array if necessary
    const formattedSymptoms = Array.isArray(symptoms) ? symptoms : symptoms ? [symptoms] : [];

    // ✅ Find the most recent medical record for this patient
    let existingRecord = await MedicalRecord.findOne({ patient: patient._id }).sort({ createdAt: -1 });

    if (!existingRecord) {
      // ✅ Create a new medical record if none exists
      existingRecord = new MedicalRecord({
        patient: patient._id,
        doctor: doctor._id,
        diagnosis,
        symptoms: formattedSymptoms,
        prescription,
        notes,
        followUpDate,
        attachments,
      });
    } else {
      // ✅ Update the latest existing record
      existingRecord.diagnosis = diagnosis;
      existingRecord.symptoms = formattedSymptoms;
      existingRecord.prescription = prescription;
      existingRecord.notes = notes;
      existingRecord.followUpDate = followUpDate;
      existingRecord.attachments = attachments;
      existingRecord.doctor = doctor._id;
    }

    // ✅ Save the record
    await existingRecord.save();

    res.status(200).json({ success: true, message: "Medical record updated successfully" });
  } catch (error) {
    console.error("Error saving medical record:", error);
    res.status(500).json({ success: false, message: "Error saving medical record" });
  }
});
// Add this route to your doctor router
router.post("/create-medical-history", authMiddleware, async (req, res) => {
  try {
    const { rollNumber, diagnosis, prescription, symptoms, notes, followUpDate, attachments } = req.body;
    const doctorId = req.body.userId; // This comes from the auth middleware
    
    // Find patient by roll number
    let patient = await userModel.findOne({ rollNumber });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }
    
    // Format symptoms to array if needed
    const formattedSymptoms = Array.isArray(symptoms) ? symptoms : symptoms ? [symptoms] : [];
    
    // Create new medical record
    const newRecord = new MedicalRecord({
      patient: patient._id,
      doctor: doctorId,
      diagnosis,
      symptoms: formattedSymptoms,
      prescription,
      notes,
      followUpDate,
      attachments
    });
    
    await newRecord.save();
    
    res.status(201).json({ 
      success: true, 
      message: "Medical record created successfully",
      data: newRecord
    });
  } catch (error) {
    console.error("Error creating medical record:", error);
    res.status(500).json({ success: false, message: "Error creating medical record" });
  }
});

// ✅ Doctor Routes
router.post("/login", doctorloginController);
router.post("/doctorregister", doctorregisterController);
router.get("/auth", authMiddleware, doctorauthController);
router.get("/getDoctors", authMiddleware, getAllDoctorsController);
router.post("/updateProfile", authMiddleware, updateProfileController);
router.post("/getDoctorById", authMiddleware, getDoctorByIdController);
router.get("/doctor-appointments", authMiddleware, doctorAppointmentsController);
router.post("/update-status", authMiddleware, updateStatusController);

module.exports = router;
