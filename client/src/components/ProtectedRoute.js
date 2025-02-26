import React, { useEffect, useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../redux/features/alertSlice";
import { setUser } from "../redux/features/userSlice";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Using useNavigate for navigation
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // To track authentication status

  // Memoize the getUser function
  const getUser = useCallback(async () => {
    try {
      dispatch(showLoading());
      const loginType = localStorage.getItem("loginType");
      const token = localStorage.getItem("token");
      console.log("Retrieved Token:", token);

      if (!token) {
        console.log("No token found. Redirecting to login...");
        setIsAuthenticated(false);
        setLoading(false);
        navigate("/login"); // Redirect using useNavigate
        return;
      }

      // Choose the appropriate endpoint based on login type
      const endpoint =
        loginType === "doctor"
          ? "/api/v1/doctor/auth"
          : "/api/v1/user/getUserData";

      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(hideLoading());

      if (res.data.success) {
        dispatch(
          setUser({
            ...res.data.data,
            isDoctor: loginType === "doctor",
          })
        );
        setIsAuthenticated(true);

        // Handle redirections based on user type
        const currentPath = window.location.pathname;
        if (loginType === "doctor" && currentPath === "/") {
          navigate("/doctor-homepage", { replace: true });
          return;
        } else if (loginType !== "doctor" && currentPath === "/doctor-homepage") {
          navigate("/", { replace: true });
          return;
        }
      } else {
        setIsAuthenticated(false);
        navigate("/login"); // Redirect on failed authentication
      }
    } catch (error) {
      dispatch(hideLoading());
      setIsAuthenticated(false);

      if (error.response?.status === 401) {
        console.log("Unauthorized! Redirecting to login...");
        localStorage.removeItem("token");
        setLoading(false);
        navigate("/login", { replace: true }); // Redirect using useNavigate
      } else {
        console.log("Error fetching user data:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    if (!user) {
      getUser();
    } else {
      // If user exists in Redux state, check if they're on the correct route
      const loginType = localStorage.getItem("loginType");
      const currentPath = window.location.pathname;

      if (loginType === "doctor" && currentPath === "/") {
        navigate("/doctor-homepage", { replace: true });
        return;
      } else if (loginType !== "doctor" && currentPath === "/doctor-homepage") {
        navigate("/", { replace: true });
        return;
      }

      setIsAuthenticated(true);
      setLoading(false);
    }
  }, [user, getUser, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated === false || !localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
