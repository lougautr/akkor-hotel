import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../css/AdminBookings.css"; 
import { useNavigate, Link } from "react-router-dom";
import { FaChevronRight, FaEye } from "react-icons/fa";

const AdminBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Suppression de selectedBooking
  const [isViewedModalOpen, setIsViewedModalOpen] = useState(false);
  const [viewedBooking, setViewedBooking] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost:8000/bookings", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [navigate]);

  const openViewedModal = async (booking) => {
    // Suppression de l'appel à setSelectedBooking
    const token = localStorage.getItem("token");
    try {
      // Récupérer l'utilisateur
      const userResponse = await fetch(`http://localhost:8000/users/${booking.user_id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user");
      }
      const userData = await userResponse.json();

      // Récupérer la chambre
      const roomResponse = await fetch(`http://localhost:8000/rooms/${booking.room_id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!roomResponse.ok) {
        throw new Error("Failed to fetch room");
      }
      const roomData = await roomResponse.json();

      // Récupérer l'hôtel via roomData.hotel_id
      const hotelResponse = await fetch(`http://localhost:8000/hotels/${roomData.hotel_id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!hotelResponse.ok) {
        throw new Error("Failed to fetch hotel");
      }
      const hotelData = await hotelResponse.json();

      // Mise à jour du state avec les infos enrichies
      setViewedBooking({
        start_date: booking.start_date,
        end_date: booking.end_date,
        nbr_people: booking.nbr_people,
        breakfast: booking.breakfast,
        userPseudo: userData.pseudo,
        hotelName: hotelData.name,
        hotelAddress: hotelData.address,
      });
      setIsViewedModalOpen(true);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  return (
    <div className="admin-bookings">
      <Header />

      <div className="admin-bookings-content">
        <nav className="breadcrumb">
          <Link to="/admin" className="breadcrumb-link">Admin Dashboard</Link>
          <FaChevronRight className="breadcrumb-icon" />
          <span className="breadcrumb-current">Bookings Management</span>
        </nav>

        <h2>Bookings Management</h2>

        <div className="admin-bookings-table-container">
          {loading ? (
            <p>Loading bookings...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <table className="admin-bookings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Start date</th>
                  <th>End date</th>
                  <th>Number of people</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.start_date}</td>
                    <td>{booking.end_date}</td>
                    <td>{booking.nbr_people}</td>
                    <td>
                      <FaEye 
                        data-testid={`see-booking-button-${booking.id}`} 
                        className="admin-bookings-action-icon admin-bookings-see-icon" 
                        onClick={() => openViewedModal(booking)} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Modal de visualisation */}
          {isViewedModalOpen && viewedBooking && (
            <div className="admin-bookings-modal-overlay">
              <div className="admin-bookings-modal-content view-booking-modal">
                <h3>Booking Details</h3>
                <div className="view-booking-details">
                  <div className="view-booking-item">
                    <strong>User:</strong> {viewedBooking.userPseudo}
                  </div>
                  <div className="view-booking-item">
                    <strong>Start Date:</strong> {viewedBooking.start_date}
                  </div>
                  <div className="view-booking-item">
                    <strong>End Date:</strong> {viewedBooking.end_date}
                  </div>
                  <div className="view-booking-item">
                    <strong>People:</strong> {viewedBooking.nbr_people}
                  </div>
                  <div className="view-booking-item">
                    <strong>Breakfast:</strong> {viewedBooking.breakfast ? "Included" : "Not included"}
                  </div>
                  <div className="view-booking-item">
                    <strong>Hotel:</strong> {viewedBooking.hotelName}
                  </div>
                  <div className="view-booking-item">
                    <strong>Address:</strong> {viewedBooking.hotelAddress}
                  </div>
                </div>
                <div className="admin-bookings-modal-buttons">
                  <button 
                    data-testid="submit-see-booking" 
                    type="button" 
                    className="cancel-button" 
                    onClick={() => setIsViewedModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminBookings;