import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/HotelCard.css';
import { FaStar, FaCheck, FaTimes } from 'react-icons/fa';

const HotelCard = ({ hotel }) => {
    const navigate = useNavigate();
    const defaultImage = process.env.PUBLIC_URL + "/hotel.png"; // Correct path for images in public/

    return (
        <div className="hotel-card" onClick={() => navigate(`/hotel/${hotel.id}`)} data-testid="hotel-item">
            <img 
                src={hotel.image ? hotel.image : defaultImage} 
                alt={hotel.name} 
                className="hotel-image" 
                onError={(e) => { e.target.src = defaultImage; }} // Fallback if image URL is broken
            />
            <div className="hotel-info">
                <h3>{hotel.name}</h3>
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
        </div>
    );
};

export default HotelCard;