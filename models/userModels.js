const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isDoctor: {
    type: Boolean,
    default: false,
  },
  notification: {
    type: Array,
    default: [],
  },
  seennotification: {
    type: Array,
    default: [],
  },
  qrCode: {
    type: String, // Store the QR code as a string (Base64-encoded image or a URL)
    default: "",
  },
  rollNumber: { type: String, required: true, unique: true }, // Unique identifier
  medicalHistory: { type: String, default: "" }, // Medical history field

});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
