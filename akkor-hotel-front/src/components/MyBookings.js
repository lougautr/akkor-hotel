import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/MyBookings.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  FaBed, 
  FaDollarSign, 
  FaMapMarkerAlt, 
  FaChevronRight, 
  FaCalendarAlt, 
  FaUsers,
  FaCoffee,
  FaEdit,
  FaTrash
} from "react-icons/fa";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Modal state for edit & delete
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editedBooking, setEditedBooking] = useState({
    start_date: "",
    end_date: "",
    nbr_people: 1,
    breakfast: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserAndBookings = async () => {
      try {
        // Retrieve current user info
        const userResponse = await fetch("http://localhost:8000/users/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!userResponse.ok) {
          throw new Error("Failed to fetch current user");
        }
        const userData = await userResponse.json();
        const userId = userData.id;

        // Fetch the bookings for this user
        const bookingsResponse = await fetch(`http://localhost:8000/bookings/user/${userId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!bookingsResponse.ok) {
          throw new Error("Failed to fetch user bookings");
        }
        const bookingData = await bookingsResponse.json();

        // Enrich each booking with room and hotel details if needed
        const enrichedBookings = await Promise.all(
          bookingData.map(async (booking) => {
            const roomRes = await fetch(`http://localhost:8000/rooms/${booking.room_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!roomRes.ok) {
              throw new Error("Failed to fetch room info");
            }
            const roomData = await roomRes.json();

            const hotelRes = await fetch(`http://localhost:8000/hotels/${roomData.hotel_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!hotelRes.ok) {
              throw new Error("Failed to fetch hotel info");
            }
            const hotelData = await hotelRes.json();

            return {
              ...booking,
              hotelName: hotelData.name,
              location: hotelData.address,
              image: hotelData.image,
              price: roomData.price,
              beds: roomData.number_of_beds,
              number_of_people: booking.nbr_people,
            };
          })
        );

        setBookings(enrichedBookings);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
      }
    };

    fetchUserAndBookings();
  }, [navigate]);

  // Open the Edit Modal and pre-populate with booking details
  const openEditModal = (booking) => {
    setSelectedBooking(booking);
    setEditedBooking({
      start_date: booking.start_date,
      end_date: booking.end_date,
      nbr_people: booking.number_of_people,
      breakfast: booking.breakfast, // Adjust if necessary
    });
    setIsEditModalOpen(true);
  };

  // Open the Delete Modal
  const openDeleteModal = (booking) => {
    setSelectedBooking(booking);
    setIsDeleteModalOpen(true);
  };

  // Handle the edit submission (PATCH)
  const handleEditSubmit = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8000/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedBooking),
      });
      if (!response.ok) {
        throw new Error("Failed to update booking");
      }

      window.location.reload();
      
      const updatedBooking = await response.json();
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id ? { ...booking, ...updatedBooking } : booking
        )
      );
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating booking:", error);
      setError(error.message);
    }
  };

  // Handle deletion of the booking (DELETE)
  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8000/bookings/${selectedBooking.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete booking");
      }
      setBookings((prev) =>
        prev.filter((booking) => booking.id !== selectedBooking.id)
      );
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting booking:", error);
      setError(error.message);
    }
  };

  return (
    <>
      <Header />
      <div className="my-bookings-page">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb">
          <Link to="/profile" className="breadcrumb-link">My Profile</Link>
          <FaChevronRight className="breadcrumb-icon" />
          <span className="breadcrumb-current">My Bookings</span>
        </nav>

        <h2>My Bookings</h2>
        {error && <p className="error-message">{error}</p>}
        {bookings.length === 0 ? (
          <p>
            No bookings yet. <Link to="/">Book a stay now!</Link>
          </p>
        ) : (
          <div className="my-bookings-list">
            {bookings.map((booking, index) => (
              <div key={index} className="my-booking-card">
                <div className="booking-card-actions">
                  <FaEdit 
                    className="action-icon edit-icon" 
                    onClick={() => openEditModal(booking)} 
                  />
                  <FaTrash 
                    className="action-icon delete-icon" 
                    onClick={() => openDeleteModal(booking)} 
                  />
                </div>
                <img
                  src={booking.image || process.env.PUBLIC_URL + "/hotel.png"}
                  alt={booking.hotelName}
                  className="my-booking-image"
                  onError={(e) => {
                    e.target.src = process.env.PUBLIC_URL + "/hotel.png";
                  }}
                />
                <div className="my-booking-info">
                  <h3>{booking.hotelName}</h3>
                  <p><FaMapMarkerAlt /> {booking.location}</p>
                  <p><FaBed /> Beds: {booking.beds}</p>
                  <p><FaDollarSign /> Price: ${booking.price} per night</p>
                  <p><FaUsers /> Guests: {booking.number_of_people}</p>
                  <p><FaCalendarAlt /> {booking.start_date} - {booking.end_date}</p>
                  <p><FaCoffee /> {booking.breakfast ? "Breakfast Included" : "Breakfast not included"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="my-bookings-modal-overlay">
            <div className="my-bookings-modal-content">
                <h3>Edit Booking</h3>
                <form className="my-bookings-modal-form">
                    <label htmlFor="edit-booking-start-date">Start Date*:</label>
                    <DatePicker 
                        selected={editedBooking.start_date ? new Date(editedBooking.start_date) : null}
                        onChange={(date) => setEditedBooking({ ...editedBooking, start_date: date.toISOString().split("T")[0] })}
                        placeholderText="Start Date"
                        dateFormat="dd/MM/yyyy"
                        className="my-bookings-date-picker"
                    />
                    
                    <label htmlFor="edit-booking-end-date">End Date*:</label>
                    <DatePicker 
                        selected={editedBooking.end_date ? new Date(editedBooking.end_date) : null}
                        onChange={(date) => setEditedBooking({ ...editedBooking, end_date: date.toISOString().split("T")[0] })}
                        placeholderText="End Date"
                        dateFormat="dd/MM/yyyy"
                        className="my-bookings-date-picker"
                    />
                    
                    <label htmlFor="edit-booking-number-of-people">Number of people*:</label>
                    <input
                        type="number"
                        data-testid="edit-booking-number-of-people" 
                        id="edit-booking-number-of-people"
                        value={editedBooking.nbr_people}
                        onChange={(e) => setEditedBooking({ ...editedBooking, nbr_people: e.target.value })}
                    />

                    <div className="my-bookings-modal-checkbox">
                        <label htmlFor="edit-booking-breakfast">Breakfast:</label>
                        <input
                            type="checkbox"
                            data-testid="edit-booking-breakfast" 
                            id="edit-booking-breakfast"
                            checked={editedBooking.breakfast}
                            onChange={(e) => setEditedBooking({ ...editedBooking, breakfast: e.target.checked })}
                        />
                    </div>

                    <div className="my-bookings-modal-buttons">
                        <button data-testid="submit-edit-booking" type="button" className="cancel-button" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                        <button data-testid="cancel-edit-booking" type="button" className="save-button" onClick={handleEditSubmit}>Save</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="my-bookings-modal-overlay">
            <div className="my-bookings-modal-content">
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete this booking?</p>
                <div className="my-bookings-modal-buttons">
                    <button data-testid="cancel-delete-booking" className="cancel-button" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                    <button data-testid="submit-delete-booking" className="save-button" onClick={handleDelete}>Yes, Delete</button>
                </div>
            </div>
        </div>
    )}

      <Footer />
    </>
  );
};

export default MyBookings;