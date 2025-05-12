import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch }) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [locations, setLocations] = useState([]); // List of available locations
    const [filteredLocations, setFilteredLocations] = useState([]); // Filtered suggestions
    const [showDropdown, setShowDropdown] = useState(false); // ✅ Utilisation de showDropdown

    // Fetch locations on mount
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch('http://localhost:8000/hotels');
                if (!response.ok) {
                    throw new Error('Failed to fetch locations');
                }
                const hotels = await response.json();
                const uniqueLocations = [...new Set(hotels.map((hotel) => hotel.address))]; // Extract unique addresses
                setLocations(uniqueLocations);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };
        fetchLocations();
    }, []);

    // Handle location input change
    const handleLocationChange = (e) => {
        const value = e.target.value;
        setLocation(value);

        // Filter suggestions based on input
        if (value.length > 0) {
            const filtered = locations.filter((loc) =>
                loc.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredLocations(filtered);
            setShowDropdown(filtered.length > 0); // ✅ Afficher le dropdown seulement si des résultats existent
        } else {
            setShowDropdown(false);
        }
    };

    // Handle selecting a location from suggestions
    const selectLocation = (selected) => {
        setLocation(selected);
        setShowDropdown(false);
    };

    // Handle search button click
    const handleSearch = async () => {
        try {
            const response = await fetch(
                `http://localhost:8000/hotels/search?name=${encodeURIComponent(name)}&address=${encodeURIComponent(location)}&limit=10`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch hotels');
            }

            const hotels = await response.json();
            onSearch(hotels);
        } catch (error) {
            console.error('Error fetching hotels:', error);
            onSearch([]); // Return empty array on error
        }
    };

    return (
        <div className="search-bar">
            {/* Hotel Name Input */}
            <div className="input-container">
                <FaSearch className="icon" />
                <input
                    type="text"
                    placeholder="Hotel Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            {/* Location Autocomplete Input */}
            <div className="input-container" style={{ position: 'relative' }}>
                <FaSearch className="icon" />
                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={handleLocationChange}
                    onFocus={() => setShowDropdown(filteredLocations.length > 0)} // ✅ Gérer l'affichage
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // ✅ Fermer après un délai
                    data-testid="location-input"
                />

                {/* Affichage conditionnel du dropdown */}
                {showDropdown && (
                    <ul className="autocomplete-dropdown" data-testid="autocomplete-list">
                        {filteredLocations.map((loc, index) => (
                            <li key={index} onClick={() => selectLocation(loc)} data-testid={`location-${index}`}>
                                {loc}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Search Button */}
            <button onClick={handleSearch} data-testid="search-button">Search</button>
        </div>
    );
};

export default SearchBar;