import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/RoomBooking.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { 
  FaBed, 
  FaDollarSign, 
  FaMapMarkerAlt, 
  FaStar, 
  FaCheck, 
  FaTimes,
  FaCalendarAlt,
  FaUsers,
  FaCoffee
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const RoomBooking = () => {
    const { roomId } = useParams(); 
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [hotel, setHotel] = useState(null);
    const [error, setError] = useState(null);

    // New booking details state
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [numPeople, setNumPeople] = useState(1);
    const [breakfast, setBreakfast] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        // Fetch room details
        const fetchRoomDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8000/rooms/${roomId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch room details");
                }
                const roomData = await response.json();
                setRoom(roomData);

                // Fetch hotel details separately
                const hotelResponse = await fetch(`http://localhost:8000/hotels/${roomData.hotel_id}`);
                if (!hotelResponse.ok) {
                    throw new Error("Failed to fetch hotel details");
                }
                const hotelData = await hotelResponse.json();
                setHotel(hotelData);
            } catch (error) {
                console.error("Error:", error);
                setError(error.message);
            }
        };

        fetchRoomDetails();
    }, [roomId, navigate]);

    if (!localStorage.getItem("token")) return null;
    if (error) return <p className="error-message">{error}</p>;
    if (!room || !hotel) return <p>Loading...</p>;

    // Utility to format dates as yyyy-MM-dd
    const formatDate = (date) => {
        if (!date) return "";
        return date.toISOString().split("T")[0];
    };

    const handleConfirmBooking = async () => {
        if (!startDate || !endDate) {
            alert("Please select start and end dates.");
            return;
        }
        const bookingData = {
            room_id: parseInt(roomId),
            start_date: formatDate(startDate),
            end_date: formatDate(endDate),
            nbr_people: Number(numPeople),
            breakfast: breakfast
        };

        console.log("Booking data:", bookingData);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/bookings", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bookingData),
            });
            if (!response.ok) {
                throw new Error("Failed to create booking");
            }
            // Optionally handle response data if needed
            navigate("/my-bookings");
        } catch (error) {
            console.error("Booking error:", error);
            alert("An error occurred while processing your booking. Please try again.");
        }
    };

    return (
        <>
            <Header />
            <div className="room-booking-page">
                <h2>Book Your Stay</h2>
                <p>Complete your booking for this room.</p>

                <div className="room-booking-hotel-overview">
                    <img 
                        src={hotel.image || process.env.PUBLIC_URL + "/hotel.png"} 
                        alt={hotel.name} 
                        className="room-booking-hotel-image"
                        onError={(e) => { e.target.src = process.env.PUBLIC_URL + "/hotel.png"; }} 
                    />
                    <div className="room-booking-hotel-info">
                        <h3>{hotel.name}</h3>
                        <p><FaMapMarkerAlt /> {hotel.address}</p>
                        <p>{hotel.description}</p>
                        <p><FaStar className="room-booking-star-icon" /> {hotel.rating} Stars</p>
                        <p>
                            {hotel.breakfast ? <FaCheck className="room-booking-check-icon" /> : <FaTimes className="room-booking-cross-icon" />}
                            Breakfast Included
                        </p>
                        <div className="room-booking-info">
                            <h3>Room Information</h3>
                            <p><FaBed /> Beds: {room.number_of_beds}</p>
                            <p><FaDollarSign /> Price: ${room.price} per night</p>
                        </div>
                    </div>
                </div>

                <h3 className="room-booking-details">Booking Details</h3>
                <div className="room-booking-form">
                    <div className="room-booking-input-container">
                        <FaCalendarAlt className="icon" />
                        <DatePicker 
                            selected={startDate} 
                            onChange={(date) => setStartDate(date)} 
                            placeholderText="Start Date"
                            dateFormat="dd/MM/yyyy"
                            className="room-booking-date-picker"
                            required
                        />
                    </div>

                    <div className="room-booking-input-container">
                        <FaCalendarAlt className="icon" />
                        <DatePicker 
                            selected={endDate} 
                            onChange={(date) => setEndDate(date)} 
                            placeholderText="End Date"
                            dateFormat="dd/MM/yyyy"
                            className="room-booking-date-picker"
                            required
                        />
                    </div>

                    <div className="room-booking-input-container">
                        <FaUsers className="icon" />
                        <input 
                            type="number" 
                            min="1" 
                            value={numPeople} 
                            onChange={(e) => setNumPeople(e.target.value)} 
                        />
                    </div>

                    <div className="room-booking-input-container">
                        
                    <label>
                        <input 
                            type="checkbox" 
                            checked={breakfast} 
                            onChange={(e) => setBreakfast(e.target.checked)} 
                            disabled={!hotel.breakfast}
                        />
                        <FaCoffee className="icon" />
                        Breakfast
                    </label>
                    </div>
                </div>

                <div className="room-booking-button">
                    <button onClick={handleConfirmBooking}>Confirm Booking</button>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default RoomBooking;