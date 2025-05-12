import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../css/AdminRooms.css"; 
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaChevronRight, FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const AdminRooms = () => {
    const navigate = useNavigate();
    const { id: hotel_id } = useParams(); // Get room_id from the URL
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [editedRoom, setEditedRoom] = useState({ 
        price: "", 
        number_of_beds: ""
    });
    const [newRoom, setNewRoom] = useState({
         price: "", 
        number_of_beds: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        const fetchHotel = async () => {
            try {
                const response = await fetch(`http://localhost:8000/hotels/${hotel_id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch hotel details");
                }

                const hotelData = await response.json();
                setHotel(hotelData);
            } catch (error) {
                setError(error.message);
            }
        };

        const fetchRooms = async () => {
            try {
                const response = await fetch(`http://localhost:8000/rooms/hotel/${hotel_id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch rooms');
                }

                const data = await response.json();
                setRooms(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHotel();
        fetchRooms();
    }, [hotel_id, navigate]);

    // Open Edit Modal
    const openEditModal = (room) => {
        setSelectedRoom(room);
        setEditedRoom({ 
            price: room.price, 
            number_of_beds: room.number_of_beds
        });
        setIsEditModalOpen(true);
    };

    // Open Delete Modal
    const openDeleteModal = (room) => {
        setSelectedRoom(room);
        setIsDeleteModalOpen(true);
    };

    // Handle Edit Submission
    const handleEditSubmit = async () => {
        const token = localStorage.getItem("token");
    
        try {
            const response = await fetch(`http://localhost:8000/rooms/${selectedRoom.id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedRoom),
            });
    
            if (!response.ok) {
                throw new Error("Failed to update room.");
            }
    
            const updatedRoom = await response.json();
    
            setRooms((prevRooms) => {
                const newRooms = prevRooms.map(room =>
                    room.id === selectedRoom.id ? updatedRoom : room
                );
                return newRooms;
            });
    
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error updating room:", error);
            setError(error.message);
        }
    };

    // Handle Delete
    const handleDelete = async () => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:8000/rooms/${selectedRoom.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete room.");
            }

            setRooms(rooms.filter(room => room.id !== selectedRoom.id));
            setIsDeleteModalOpen(false);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCreateRoom = async () => {
        const token = localStorage.getItem("token");
    
        // Ensure `hotel_id` is available
        if (!hotel_id) {
            setError("Hotel ID is missing.");
            return;
        }
    
        try {
            const response = await fetch("http://localhost:8000/rooms", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...newRoom, // ✅ Include existing room fields
                    hotel_id: hotel_id // ✅ Add hotel_id to request body
                }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to create room");
            }
    
            const createdRoom = await response.json();
            setRooms([...rooms, createdRoom]); // Add new room to the list
            setIsCreateModalOpen(false);
            setNewRoom({ price: "", number_of_beds: "" }); // Reset form
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="admin-rooms">
            <Header />

            <div className="admin-rooms-content">
                <nav className="breadcrumb">
                    <Link to="/admin" className="breadcrumb-link">Admin Dashboard</Link>
                    <FaChevronRight className="breadcrumb-icon" />
                    <Link to="/admin/hotels" className="breadcrumb-link">Hotels</Link>
                    <FaChevronRight className="breadcrumb-icon" />
                    {hotel ? (
                        <Link to="/admin/hotels" className="breadcrumb-link">{hotel.name}</Link>
                    ) : (
                        <span className="breadcrumb-current">Loading...</span>
                    )}
                    <FaChevronRight className="breadcrumb-icon" />
                    <span className="breadcrumb-current">Rooms</span>
                </nav>

                <h2>Rooms Management</h2>

                <div className="admin-rooms-create-button">
                    <button data-testid="create-room-button" onClick={() => setIsCreateModalOpen(true)}>
                        <FaPlus /> Create Room
                    </button>
                </div>

                <div className="admin-rooms-table-container">
                    {loading ? (
                        <p>Loading rooms...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <table className="admin-rooms-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Price</th>
                                    <th>Number of beds</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map((room) => (
                                    <tr key={room.id}>
                                        <td>{room.id}</td>
                                        <td>{room.price}</td>
                                        <td>{room.number_of_beds}</td>
                                        <td>
                                            <FaEdit data-testid={`edit-room-button-${room.id}`} className="admin-rooms-action-icon admin-rooms-edit-icon" onClick={() => openEditModal(room)} />
                                            <FaTrash data-testid={`delete-room-button-${room.id}`} className="admin-rooms-action-icon admin-rooms-delete-icon" onClick={() => openDeleteModal(room)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div className="admin-rooms-modal-overlay">
                        <div className="admin-rooms-modal-content">
                            <h3>Edit Room</h3>
                            <form className="admin-rooms-modal-form">
                                <label htmlFor="edit-room-price">Price:</label>
                                <input
                                    type="number"
                                    data-testid="edit-room-price" 
                                    id="edit-room-price"
                                    value={editedRoom.price}
                                    onChange={(e) => setEditedRoom({ ...editedRoom, price: e.target.value })}
                                />
                                
                                <label htmlFor="edit-room-number-of-beds">Number of beds:</label>
                                <input
                                    type="number"
                                    data-testid="edit-room-number-of-beds" 
                                    id="edit-room-number-of-beds"
                                    value={editedRoom.number_of_beds}
                                    onChange={(e) => setEditedRoom({ ...editedRoom, number_of_beds: e.target.value })}
                                />

                                <div className="admin-rooms-modal-buttons">
                                    <button data-testid="submit-edit-room" type="button" className="cancel-button" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button data-testid="cancel-edit-room" type="button" className="save-button" onClick={handleEditSubmit}>Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {isDeleteModalOpen && (
                    <div className="admin-rooms-modal-overlay">
                        <div className="admin-rooms-modal-content">
                            <h3>Confirm Delete</h3>
                            <p>Are you sure you want to delete this room?</p>
                            <div className="admin-rooms-modal-buttons">
                                <button data-testid="cancel-delete-room" className="cancel-button" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                                <button data-testid="submit-delete-room" className="save-button" onClick={handleDelete}>Yes, Delete</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Modal */}
                {isCreateModalOpen && (
                    <div className="admin-rooms-modal-overlay">
                        <div className="admin-rooms-modal-content">
                            <h3>Create Room</h3>
                            <form className="admin-rooms-modal-form">
                                <label htmlFor="new-room-price">Price:</label>
                                <input
                                    type="number"
                                    data-testid="new-room-price" 
                                    id="new-room-price"
                                    value={newRoom.price}
                                    onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                                />
                                
                                <label htmlFor="new-room-number-of-beds">Number of beds:</label>
                                <input
                                    type="number"
                                    data-testid="new-room-number-of-beds" 
                                    id="new-room-number-of-beds"
                                    value={newRoom.number_of_beds}
                                    onChange={(e) => setNewRoom({ ...newRoom, number_of_beds: e.target.value })}
                                />

                                <div className="admin-rooms-modal-buttons">
                                    <button data-testid="cancel-new-room" type="button" className="cancel-button" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                                    <button data-testid="submit-new-room" type="button" className="save-button" onClick={handleCreateRoom}>Create</button>
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

export default AdminRooms;