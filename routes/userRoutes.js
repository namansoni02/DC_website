const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDocotrsController,
  bookeAppointmnetController,
  bookingAvailabilityController,
  userAppointmentsController,
  getCurrentUserDataController,
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddlewares");

//router onject
const router = express.Router();

//routes
//LOGIN || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);

//Auth || POST
router.post("/getUserData", authMiddleware, authController);

//userdata || GEt
router.get("/getUserData", authMiddleware, getCurrentUserDataController);

//APply Doctor || POST
router.post("/apply-doctor", authMiddleware, applyDoctorController);

//Notifiaction  Doctor || POST
router.post(
  "/get-all-notification",
  authMiddleware,
  getAllNotificationController
);
//Notifiaction  Doctor || POST
router.post(
  "/delete-all-notification",
  authMiddleware,
  deleteAllNotificationController
);

//GET ALL DOC
router.get("/getAllDoctors", authMiddleware, getAllDocotrsController);

//BOOK APPOINTMENT
router.post("/book-appointment", authMiddleware, bookeAppointmnetController);

//Booking Avliability
router.post(
  "/booking-availbility",
  authMiddleware,
  bookingAvailabilityController
);


router.get("/medical-history/:rollNumber", authMiddleware, async (req, res) => {
  try {
    const user = await userModel.findOne({ rollNumber: req.params.rollNumber });
    if (!user) return res.status(404).send({ message: "User not found" });

    res.status(200).send({ success: true, data: user });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching history", error });
  }
});

router.post("/medical-history/:rollNumber", authMiddleware, async (req, res) => {
  try {
    const user = await userModel.findOneAndUpdate(
      { rollNumber: req.params.rollNumber },
      { medicalHistory: req.body.medicalHistory },
      { new: true }
    );
    if (!user) return res.status(404).send({ message: "User not found" });

    res.status(200).send({ success: true, message: "History updated", data: user });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error updating history", error });
  }
});






//Appointments List
router.get("/user-appointments", authMiddleware, userAppointmentsController);

module.exports = router;
