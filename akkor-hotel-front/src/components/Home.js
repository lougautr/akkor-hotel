import React, { useState, useEffect } from 'react';
import '../css/Home.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import HotelCard from '../components/HotelCard';

const Home = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all hotels when component loads (same as clicking search with empty fields)
    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await fetch('http://localhost:8000/hotels/search?name=&address=&limit=10');

                if (!response.ok) {
                    throw new Error('Failed to fetch hotels');
                }

                const hotelData = await response.json();
                setHotels(hotelData);
            } catch (error) {
                console.error('Error fetching hotels:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, []);

    const handleSearch = (searchResults) => {
        setHotels(searchResults);
    };

    return (
        <>
            <Header />

            <div className="home">
                <div className="home-content">
                    <h1>Book Smart, Stay Better</h1>
                    <p>Find Your Perfect Stay Today</p>

                    <SearchBar onSearch={handleSearch} />

                    {/* Display Hotels */}
                    <div className="hotel-list" data-testid="hotel-list">
                        {loading ? (
                            <p data-testid="loading">Loading hotels...</p>
                        ) : error ? (
                            <p className="error-message" data-testid="error-message">{error}</p>
                        ) : hotels.length > 0 ? (
                            hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} data-testid="hotel-item" />)
                        ) : (
                            <p data-testid="no-hotels">No hotels found. Try a different search.</p>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Home;