import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/HotelDetails.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { FaStar, FaCheck, FaTimes, FaBed, FaDollarSign } from 'react-icons/fa';

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState(null);
    
    const defaultImage = process.env.PUBLIC_URL + "/hotel.png"; // Default image

    useEffect(() => {
        const fetchHotelDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8000/hotels/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch hotel details');
                }
                const hotelData = await response.json();
                setHotel(hotelData);
            } catch (error) {
                console.error('Error fetching hotel:', error);
                setError(error.message);
            }
        };
    
        const fetchRooms = async () => {
            try {
                const response = await fetch(`http://localhost:8000/rooms/hotel/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch rooms');
                }
                const roomsData = await response.json();
                setRooms(roomsData);
            } catch (error) {
                console.error('Error fetching rooms:', error);
                setError(error.message);
            }
        };
    
        fetchHotelDetails();
        fetchRooms();
    }, [id]);

    // Function to handle room click
    const handleRoomClick = (roomId) => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate(`/hotel/${id}/room/${roomId}/book`); // Navigate to room booking page
        } else {
            navigate('/login'); // Redirect to login if not authenticated
        }
    };

    if (error) return <p className="error-message">{error}</p>;
    if (!hotel) return <p>Loading...</p>;

    return (
        <>
            <Header />
            <div className="hotel-details">
                <img 
                    src={hotel.image || defaultImage} 
                    alt={hotel.name} 
                    className="hotel-banner" 
                    onError={(e) => { e.target.src = defaultImage; }} // Fallback image
                />
                <div className="hotel-info">
                    <h2>{hotel.name}</h2>
                    <p className="location">{hotel.address}</p>
                    <p className="description">{hotel.description}</p>
                    <div className="rating">
                        <FaStar className="star-icon" /> {hotel.rating}
                    </div>
                    <p className="breakfast">
                        {hotel.breakfast ? <FaCheck className="check-icon" /> : <FaTimes className="cross-icon" />}
                        Breakfast Included
                    </p>
                </div>

                <h3 className="rooms-title">Available Rooms</h3>
                <div className="rooms-list">
                    {rooms.length > 0 ? (
                        rooms.map(room => (
                            <div 
                                key={room.id} 
                                className="room-card"
                                onClick={() => handleRoomClick(room.id)}
                            >
                                <div className='room-beds'>
                                    <FaBed className="room-icon" /> {room.number_of_beds} Beds
                                </div>
                                <div className="price">
                                    <FaDollarSign className="price-icon" /> {room.price} per night
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No rooms available.</p>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default HotelDetails;