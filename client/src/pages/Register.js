import React from "react";
import "../styles/Registerstyle.css";
import { Form, Input, message } from "antd";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // form handler
  const onFinishHandler = async (values) => {
    try {
      dispatch(showLoading());
      const res = await axios.post("/api/v1/user/register", values);
      dispatch(hideLoading());
      if (res.data.success) {
        message.success("Registered Successfully!");
        // Display the QR code (optional)
        if (res.data.qrCode) {
          const qrWindow = window.open();
          qrWindow.document.write(
            `<h1>Your QR Code</h1><img src="${res.data.qrCode}" alt="QR Code" />`
          );
        }
        navigate("/login");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Something Went Wrong");
    }
  };

  return (
    <div className="form-container">
      {/* Header Section */}
      <header className="header-section">
        <div className="logo-container">
          <img src="/logo.png" alt="IIT Jodhpur Logo" className="logo-image" />
          <h1 className="heading">
            Health Centre - Indian Institute Of Technology Jodhpur
          </h1>
        </div>
        <hr className="header-divider" />
      </header>

      {/* Registration Form Section */}
      <main className="form-section">
        <div className="form-wrapper">
          <h2 className="form-title2">Patient Register</h2>
          <Form
            layout="vertical"
            onFinish={onFinishHandler}
            className="register-form"
          >
            {/* Name Field */}
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name!" }]}
            >
              <Input type="text" placeholder="Enter your name" />
            </Form.Item>


            {/* Roll No Field (Now as String) */}
          <Form.Item
          label="Roll No"
          name="rollNo"
          rules={[
          { required: true, message: "Please enter your Roll No!" },
          { type: "string", message: "Roll No must be a valid string!" }, // Ensuring it's a string
          ]}
          >
           <Input placeholder="Enter your Roll No" />
           </Form.Item>


            {/* Email Field */}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input type="email" placeholder="Enter your email" />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password!" },
              ]}
            >
              <Input.Password placeholder="Enter your password" />
            </Form.Item>

            {/* Register Button */}
            <button className="btn btn-primary" type="submit">
              Register
            </button>
          </Form>

          {/* Additional Link */}
          <div className="extra-links">
            <Link to="/login">Already a user? Login here</Link>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="footer-section">
        <p className="footer-text">
          © {new Date().getFullYear()} Indian Institute of Technology Jodhpur
        </p>
      </footer>
    </div>
  );
};

export default Register;
