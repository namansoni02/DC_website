import React, { useState } from "react";
import "../styles/Registerstyle.css"; 
import { Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginType, setLoginType] = useState("doctor"); // Toggle between doctor and patient login

  // Handle form submission
  const onFinishHandler = async (values) => {
    try {
      dispatch(showLoading());
      const endpoint = loginType === "doctor" ? "/api/v1/doctor/login" : "/api/v1/user/login";
      const res = await axios.post(endpoint, values);
      dispatch(hideLoading());
      if (res?.data?.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("loginType", loginType); // Store loginType in localStorage
        message.success(`${loginType === "doctor" ? "Doctor" : "Patient"} Login Successful`);
        //navigate("/"); // Redirect without reloading
        console.log(loginType)
        if (loginType === "doctor") {
          navigate("/doctor-homepage"); // Redirect doctor to a different route
        } else {
          navigate("/"); // Redirect patient to the homepage
        }
      } else {
        message.error(res?.data?.message || "Login failed");
      }
    } catch (error) {
      dispatch(hideLoading());//dispatch
      message.error("Something went wrong"); // 
    }
  };

  return (
    <div className="login-page">
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

      {/* Toggle Section */}
      <div className="toggle-section">
        <button
          className={`toggle-button ${loginType === "doctor" ? "active" : ""}`}
          onClick={() => setLoginType("doctor")}
        >
          Doctor Login
        </button>
        <button
          className={`toggle-button ${loginType === "patient" ? "active" : ""}`}
          onClick={() => setLoginType("patient")}
        >
          Patient Login
        </button>
      </div>

      {/* Main Content Section */}
      <main className="form-section">
        <div className="form-wrapper">
          <h2 className="form-title">
            {loginType === "doctor" ? "Doctor Login" : "Patient Login"}
          </h2>
          <Form
            layout="vertical"
            onFinish={onFinishHandler}
            className="login-form"
          >
            {/* Email Field */}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please enter your password!" }]}
            >
              <Input.Password placeholder="Enter your password" />
            </Form.Item>

            {/* Login Button */}
            <button className="btn btn-primary" type="submit">
              Login as {loginType === "doctor" ? "Doctor" : "Patient"}
            </button>
          </Form>

          {/* Additional Links */}
          <div className="extra-links">
            {loginType === "doctor" ? (
              <Link to="/doctor-register">Not a registered doctor? Sign up here</Link>
            ) : (
              <Link to="/register">Not a registered patient? Sign up here</Link>
            )}
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

export default Login;