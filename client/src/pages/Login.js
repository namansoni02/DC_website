import React, { useState, useEffect } from "react";
import "../styles/LoginStyle.css"; 
import { Form, Input, message, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import axios from "axios";
import { MailOutlined, LockOutlined, UserOutlined, MedicineBoxOutlined } from '@ant-design/icons';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginType, setLoginType] = useState("doctor");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Reset form when login type changes
  useEffect(() => {
    form.resetFields();
  }, [loginType, form]);

  // Handle form submission with improved error handling
  const onFinishHandler = async (values) => {
    try {
      setLoading(true);
      dispatch(showLoading());
      
      const endpoint = loginType === "doctor" 
        ? "/api/v1/doctor/login" 
        : "/api/v1/user/login";
        
      const res = await axios.post(endpoint, values);
      
      if (res?.data?.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("loginType", loginType);
        
        message.success({
          content: `${loginType === "doctor" ? "Doctor" : "Patient"} Login Successful`,
          style: { marginTop: '20px' },
        });
        
        // Redirect with slight delay for better UX
        setTimeout(() => {
          if (loginType === "doctor") {
            navigate("/doctor-homepage");
          } else {
            navigate("/");
          }
        }, 500);
      } else {
        message.error({
          content: res?.data?.message || "Login failed",
          style: { marginTop: '20px' },
        });
      }
    } catch (error) {
      message.error({
        content: error.response?.data?.message || "Something went wrong",
        style: { marginTop: '20px' },
      });
    } finally {
      dispatch(hideLoading());
      setLoading(false);
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
          aria-label="Doctor Login"
        >
          <MedicineBoxOutlined className="toggle-icon" />
          Doctor Login
        </button>
        <button
          className={`toggle-button ${loginType === "patient" ? "active" : ""}`}
          onClick={() => setLoginType("patient")}
          aria-label="Patient Login"
        >
          <UserOutlined className="toggle-icon" />
          Patient Login
        </button>
      </div>

      {/* Main Content Section */}
      <main className="form-section">
        <div className="form-wrapper">
          <h2 className="form-title2">
            {loginType === "doctor" 
              ? <><MedicineBoxOutlined /> Doctor Login</>
              : <><UserOutlined /> Patient Login</>
            }
          </h2>
          
          <Spin spinning={loading} tip="Logging in...">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinishHandler}
              className="login-form"
              requiredMark={false}
              size="large"
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
                <Input 
                  prefix={<MailOutlined className="form-icon" />} 
                  placeholder="Enter your email" 
                  autoComplete="email"
                />
              </Form.Item>

              {/* Password Field */}
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Please enter your password!" }]}
              >
                <Input.Password 
                  prefix={<LockOutlined className="form-icon" />}
                  placeholder="Enter your password" 
                  autoComplete="current-password"
                />
              </Form.Item>

              {/* Login Button */}
              <Form.Item>
                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Logging in...' : `Login as ${loginType === "doctor" ? "Doctor" : "Patient"}`}
                </button>
              </Form.Item>
            </Form>
          </Spin>

          {/* Additional Links */}
          <div className="extra-links">
            {loginType === "doctor" ? (
              <>
                <Link to="/doctor-register">Not a registered doctor? Sign up here</Link>
                <div className="divider"></div>
                <Link to="/forgot-password">Forgot password?</Link>
              </>
            ) : (
              <>
                <Link to="/register">Not a registered patient? Sign up here</Link>
                <div className="divider"></div>
                <Link to="/forgot-password">Forgot password?</Link>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="footer-section">
        <p className="footer-text">
          © {new Date().getFullYear()} Indian Institute of Technology Jodhpur. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Login;