import React, { useEffect, useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../redux/features/alertSlice";
import { setUser } from "../redux/features/userSlice";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const getUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    const loginType = localStorage.getItem("loginType");

    if (!token) {
      console.log("No token found. Redirecting to login...");
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      dispatch(showLoading());
      const endpoint =
        loginType === "doctor"
          ? `${process.env.REACT_APP_API_URL}/api/v1/doctor/auth`
          : `${process.env.REACT_APP_API_URL}/api/v1/user/getUserData`;

      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(hideLoading());

      if (res.data.success) {
        dispatch(setUser({ ...res.data.data, isDoctor: loginType === "doctor" }));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem("token"); // Remove invalid token
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error fetching user:", error);
      setIsAuthenticated(false);
      localStorage.removeItem("token"); // Ensure invalid tokens are cleared
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!user) {
      getUser();
    } else {
      setIsAuthenticated(true);
      setLoading(false);
    }
  }, [user, getUser]);

  useEffect(() => {
    if (isAuthenticated) {
      const loginType = localStorage.getItem("loginType");
      const currentPath = window.location.pathname;

      if (loginType === "doctor" && currentPath === "/") {
        navigate("/doctor-homepage", { replace: true });
      } else if (loginType !== "doctor" && currentPath === "/doctor-homepage") {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
