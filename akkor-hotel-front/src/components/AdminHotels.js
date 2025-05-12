import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../css/AdminHotels.css"; 
import { useNavigate, Link } from "react-router-dom";
import { FaChevronRight, FaEdit, FaTrash, FaPlus, FaBed } from "react-icons/fa";

const AdminHotels = () => {
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [editedHotel, setEditedHotel] = useState({ 
        name: "", 
        address: "", 
        description: "", 
        rating: "", 
        breakfast: false 
    });
    const [newHotel, setNewHotel] = useState({
        name: "",
        address: "",
        description: "",
        rating: "",
        breakfast: false,
    });

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        const fetchHotels = async () => {
            try {
                const response = await fetch("http://localhost:8000/hotels", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch hotels");
                }

                const data = await response.json();
                setHotels(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, [navigate]);

    // Open Edit Modal
    const openEditModal = (hotel) => {
        setSelectedHotel(hotel);
        setEditedHotel({ 
            name: hotel.name, 
            address: hotel.address, 
            description: hotel.description, 
            rating: hotel.rating, 
            breakfast: hotel.breakfast || false 
        });
        setIsEditModalOpen(true);
    };

    // Open Delete Modal
    const openDeleteModal = (hotel) => {
        setSelectedHotel(hotel);
        setIsDeleteModalOpen(true);
    };

    // Handle Edit Submission
    const handleEditSubmit = async () => {
        const token = localStorage.getItem("token");
    
        try {
            const response = await fetch(`http://localhost:8000/hotels/${selectedHotel.id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedHotel),
            });
    
            if (!response.ok) {
                throw new Error("Failed to update hotel.");
            }
    
            const updatedHotel = await response.json();
    
            setHotels((prevHotels) => {
                const newHotels = prevHotels.map(hotel =>
                    hotel.id === selectedHotel.id ? updatedHotel : hotel
                );
                return newHotels;
            });
    
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error updating hotel:", error);
            setError(error.message);
        }
    };

    const handleViewRooms = (hotelId) => {
        navigate(`/admin/hotel/${hotelId}/rooms`);
    };

    // Handle Delete
    const handleDelete = async () => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:8000/hotels/${selectedHotel.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete hotel.");
            }

            setHotels(hotels.filter(hotel => hotel.id !== selectedHotel.id));
            setIsDeleteModalOpen(false);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCreateHotel = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:8000/hotels", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newHotel),
            });

            if (!response.ok) {
                throw new Error("Failed to create hotel");
            }

            const createdHotel = await response.json();
            setHotels([...hotels, createdHotel]);
            setIsCreateModalOpen(false);
            setNewHotel({ name: "", address: "", description: "", rating: "", breakfast: false });
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="admin-hotels">
            <Header />

            <div className="admin-hotels-content">

                <nav className="breadcrumb">
                    <Link to="/admin" className="breadcrumb-link">Admin Dashboard</Link>
                    <FaChevronRight className="breadcrumb-icon" />
                    <span className="breadcrumb-current">Hotels Management</span>
                </nav>

                <h2>Hotels Management</h2>

                <div className="admin-hotels-create-button">
                    <button data-testid="create-hotel-button" onClick={() => setIsCreateModalOpen(true)}>
                        <FaPlus /> Create Hotel
                    </button>
                </div>

                <div className="admin-hotels-table-container">
                    {loading ? (
                        <p>Loading hotels...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <table className="admin-hotels-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Location</th>
                                    <th>Rating</th>
                                    <th>Breakfast</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hotels.map((hotel) => (
                                    <tr key={hotel.id}>
                                        <td>{hotel.id}</td>
                                        <td>{hotel.name}</td>
                                        <td>{hotel.address}</td>
                                        <td>{hotel.rating}</td>
                                        <td>{hotel.breakfast ? "Yes" : "No"}</td>
                                        <td>
                                            <FaEdit data-testid={`edit-hotel-button-${hotel.id}`} className="admin-hotels-action-icon admin-hotels-edit-icon" onClick={() => openEditModal(hotel)} />
                                            <FaBed data-testid={`view-rooms-button-${hotel.id}`} className="admin-hotels-action-icon admin-hotels-room-icon" onClick={() => handleViewRooms(hotel.id)} title="View Rooms"/>
                                            <FaTrash data-testid={`delete-hotel-button-${hotel.id}`} className="admin-hotels-action-icon admin-hotels-delete-icon" onClick={() => openDeleteModal(hotel)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div className="admin-hotels-modal-overlay">
                        <div className="admin-hotels-modal-content">
                            <h3>Edit Hotel</h3>
                            <form className="admin-hotels-modal-form">
                                <label htmlFor="edit-hotel-name">Name:</label>
                                <input
                                    type="text"
                                    data-testid="edit-hotel-name" 
                                    id="edit-hotel-name"
                                    value={editedHotel.name}
                                    onChange={(e) => setEditedHotel({ ...editedHotel, name: e.target.value })}
                                />

                                <label htmlFor="edit-hotel-address">Address:</label>
                                <input
                                    type="text"
                                    data-testid="edit-hotel-address" 
                                    id="edit-hotel-address"
                                    value={editedHotel.address}
                                    onChange={(e) => setEditedHotel({ ...editedHotel, address: e.target.value })}
                                />

                                <label htmlFor="edit-hotel-description">Description:</label>
                                <textarea
                                    data-testid="edit-hotel-description" 
                                    id="edit-hotel-description"
                                    value={editedHotel.description}
                                    onChange={(e) => setEditedHotel({ ...editedHotel, description: e.target.value })}
                                />

                                <label htmlFor="edit-hotel-rating">Rating:</label>
                                <input
                                    type="number"
                                    data-testid="edit-hotel-rating" 
                                    id="edit-hotel-rating"
                                    value={editedHotel.rating}
                                    onChange={(e) => setEditedHotel({ ...editedHotel, rating: e.target.value })}
                                />

                                <div className="admin-hotels-modal-checkbox">
                                    <label htmlFor="edit-hotel-breakfast">Breakfast:</label>
                                    <input
                                        type="checkbox"
                                        data-testid="edit-hotel-breakfast" 
                                        id="edit-hotel-breakfast"
                                        checked={editedHotel.breakfast}
                                        onChange={(e) => setEditedHotel({ ...editedHotel, breakfast: e.target.checked })}
                                    />
                                </div>

                                <div className="admin-hotels-modal-buttons">
                                    <button data-testid="submit-edit-hotel" type="button" className="cancel-button" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button data-testid="cancel-edit-hotel" type="button" className="save-button" onClick={handleEditSubmit}>Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {isDeleteModalOpen && (
                    <div className="admin-hotels-modal-overlay">
                        <div className="admin-hotels-modal-content">
                            <h3>Confirm Delete</h3>
                            <p>Are you sure you want to delete this hotel?</p>
                            <div className="admin-hotels-modal-buttons">
                                <button data-testid="cancel-delete-hotel" className="cancel-button" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                                <button data-testid="submit-delete-hotel" className="save-button" onClick={handleDelete}>Yes, Delete</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Modal */}
                {isCreateModalOpen && (
                    <div className="admin-hotels-modal-overlay">
                        <div className="admin-hotels-modal-content">
                            <h3>Create Hotel</h3>
                            <form className="admin-hotels-modal-form">
                                <label htmlFor="new-hotel-name">Name:</label>
                                <input
                                    type="text"
                                    data-testid="new-hotel-name" 
                                    id="new-hotel-name"
                                    value={newHotel.name}
                                    onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                                />
                                <label htmlFor="new-hotel-address">Address:</label>
                                <input
                                    type="text"
                                    data-testid="new-hotel-address" 
                                    id="new-hotel-address"
                                    value={newHotel.address}
                                    onChange={(e) => setNewHotel({ ...newHotel, address: e.target.value })}
                                />
                                <label htmlFor="new-hotel-description">Description:</label>
                                <textarea
                                    data-testid="new-hotel-description" 
                                    id="new-hotel-description"
                                    value={newHotel.description}
                                    onChange={(e) => setNewHotel({ ...newHotel, description: e.target.value })}
                                />
                                <label htmlFor="new-hotel-rating">Rating:</label>
                                <input
                                    type="number"
                                    data-testid="new-hotel-rating" 
                                    id="new-hotel-rating"
                                    value={newHotel.rating}
                                    onChange={(e) => setNewHotel({ ...newHotel, rating: e.target.value })}
                                />
                                <div className="admin-hotels-modal-checkbox">
                                    <label htmlFor="new-hotel-breakfast">Breakfast:</label>
                                    <input
                                        type="checkbox"
                                        data-testid="new-hotel-breakfast" 
                                        id="new-hotel-breakfast"
                                        checked={newHotel.breakfast}
                                        onChange={(e) => setNewHotel({ ...newHotel, breakfast: e.target.checked })}
                                    />
                                </div>
                                <div className="admin-hotels-modal-buttons">
                                    <button data-testid="cancel-new-hotel" type="button" className="cancel-button" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                                    <button data-testid="submit-new-hotel" type="button" className="save-button" onClick={handleCreateHotel}>Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>

            <Footer />
        </div>
    );
};

export default AdminHotels;