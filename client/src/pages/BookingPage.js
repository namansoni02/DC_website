import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";

import Layout from "../components/Layout";
import { useParams } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";

const BookingPage = () => {
  const { user } = useSelector((state) => state.user);
  const params = useParams();
  const [doctors, setDoctors] = useState([]);
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState(null); // state for selected time
  const [isAvailable, setIsAvailable] = useState(false);
  const dispatch = useDispatch();

  // Get doctor data
  const getUserData = async () => {
    try {
      const res = await axios.post(
        "/api/v1/doctor/getDoctorById",
        { doctorId: params.doctorId },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle availability check
  const handleAvailability = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/booking-availbility",
        { doctorId: params.doctorId, date, time: selectedTime },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        setIsAvailable(true);
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
    }
  };

  // Handle booking
  const handleBooking = async () => {
    try {
      if (!date || !selectedTime) {
        return alert("Date & Time Required");
      }
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctors,
          userInfo: user,
          date: date,
          time: selectedTime,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
    }
  };

  // Generate time slots for the doctor based on available timings
  const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    let currentTime = moment(startTime, "HH:mm");
    const endTimeMoment = moment(endTime, "HH:mm");

    while (currentTime.isBefore(endTimeMoment)) {
      slots.push(currentTime.format("HH:mm"));
      currentTime = currentTime.add(10, "minutes");
    }

    return slots;
  };

  // Handle date selection and show available time slots
  const handleDateChange = (value) => {
    setDate(moment(value).format("DD-MM-YYYY"));
    setSelectedTime(null);  // Reset selected time when changing the date
  };

  useEffect(() => {
    getUserData();
    //eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <h3>Booking Page</h3>
      <div className="container m-2">
        {doctors && (
          <div>
            <h4>
              Dr.{doctors.name}
            </h4>
            <h4>Fees : {doctors.feesPerConsultation}</h4>
            <h4>
              Timings : {doctors.timings && doctors.timings[0]} -{" "}
              {doctors.timings && doctors.timings[1]}
            </h4>

            <div className="d-flex flex-column w-50">
              {/* Date Picker */}
              <DatePicker
                aria-required={"true"}
                className="m-2"
                format="DD-MM-YYYY"
                onChange={handleDateChange}
              />

              {/* Time Slot Grid (Will show after selecting a date) */}
              {date && doctors.timings && (
                <div className="mt-3">
                  <h5>Select a Time Slot</h5>
                  <div className="grid-container">
                    {generateTimeSlots(doctors.timings[0], doctors.timings[1]).map((slot, index) => (
                      <button
                        key={index}
                        className={`grid-item ${selectedTime === slot ? "selected" : ""}`}
                        onClick={() => setSelectedTime(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              

              <button className="btn btn-dark mt-2" onClick={handleBooking}>
                Book Now
              </button>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 10px;
          }

          .grid-item {
            padding: 10px;
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            cursor: pointer;
            text-align: center;
          }

          .grid-item:hover {
            background-color: #ddd;
          }

          .grid-item.selected {
            background-color: #4caf50;
            color: white;
          }
        `}
      </style>
    </Layout>
  );
};

export default BookingPage;
