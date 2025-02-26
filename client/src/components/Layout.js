import "../styles/LayoutStyles.css";
import { userMenu, doctorMenu } from "./../Data/data";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import React, { useState, useEffect } from 'react';
import { Badge, message } from "antd";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const storedLoginType = localStorage.getItem("loginType");
    if (storedLoginType) {
      setUserType(storedLoginType); // Set the user type based on localStorage
    }
  }, []);

  const { user } = useSelector((state) => state.user);

  // Conditional Rendering of Sidebar Menu
  const SidebarMenu = userType === "doctor" ? doctorMenu : userMenu;

  // logout function

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout Successfully");
    navigate("/login");
  };

  return (
    <>
      <div className="main">
        <div className="layout">
          <div className="sidebar">
            <div className="logo">
              <img
                src="/logo.png"
                alt="IIT Jodhpur Logo"
                className="logo-image"
              />
            </div>
            <div className="menu">
              {SidebarMenu.map((menu) => {
                const isActive = location.pathname === menu.path;
                return (
                  <div
                    key={menu.path}
                    className={`menu-item ${isActive && "active"}`}
                  >
                    <i className={menu.icon}></i>
                    <Link to={menu.path}>{menu.name}</Link>
                  </div>
                );
              })}
              <div className="menu-item" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket"></i>
                <Link to="/login">Logout</Link>
              </div>
            </div>
          </div>
          <div className="content">
            <div className="header">
              <div>
                <h3>HEALTH CENTRE - INDIAN INSTITUTE OF TECHNOLOGY Jodhpur</h3>
              </div>
              <div className="header-content" style={{ cursor: "pointer" }}>
                <Badge
                  count={user?.notifcation?.length || 0} // Added safety check here
                  onClick={() => {
                    navigate("/notification");
                  }}
                >
                  <i className="fa-solid fa-bell"></i>
                </Badge>
                <Link to="/profile" className="user-link">
                  {user?.name || 'Patient Name'}
                </Link>
              </div>
            </div>
            <div className="body">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
