import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import DrHomePage from "./pages/DrHomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useSelector } from "react-redux";
import Spinner from "./components/Spinner";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ApplyDoctor from "./pages/ApplyDoctor";
import NotificationPage from "./pages/NotificationPage";
import Users from "./pages/admin/Users";
import Doctors from "./pages/admin/Doctors";
import Profile from "./pages/doctors/Profile";
import BookingPage from "./pages/BookingPage";
import Appointments from "./pages/Appointments";
import DoctorAppointments from "./pages/doctors/DoctorAppointments";
import DoctorRegister from "./pages/doctorregister";
import ScanQR from "./pages/ScanQR"; // Import the ScanQR component
import MedicalHistory from "./components/MedicalHistory";
import PatientProfile from "./pages/UserProfile"; // Import the PatientProfile component

function App() {
  const { loading } = useSelector((state) => state.alerts);
  return (
    <>
      <BrowserRouter>
        {loading ? (
          <Spinner />
        ) : (
          <Routes>
            <Route
              path="/scan-qr"
              element={
                <ProtectedRoute>
                  <ScanQR />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apply-doctor"
              element={
                <ProtectedRoute>
                  <ApplyDoctor />
                </ProtectedRoute>
              }
            />
            <Route path="/medical-history/:rollNumber" element={<MedicalHistory />} />
            <Route path="/:rollNumber" element={<MedicalHistory />} />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/doctors"
              element={
                <ProtectedRoute>
                  <Doctors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/profile/:id"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/book-appointment/:doctorId"
              element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notification"
              element={
                <ProtectedRoute>
                  <NotificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/doctor-register"
              element={
                <PublicRoute>
                  <DoctorRegister />
                </PublicRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor-appointments"
              element={
                <ProtectedRoute>
                  <DoctorAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/doctor-homepage"
              element={
                <ProtectedRoute>
                  <DrHomePage />
                </ProtectedRoute>
              }
            />

             <Route
              path="/patient-homepage"
              element={
                <ProtectedRoute>
                  <HomePage/>
                </ProtectedRoute>
              }
            />
            
            {/* New Route for User Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PatientProfile />
                </ProtectedRoute>
              }
            />
          </Routes>
        )}
      </BrowserRouter>
    </>
  );
}

export default App;
