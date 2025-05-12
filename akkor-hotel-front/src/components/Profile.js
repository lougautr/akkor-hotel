import React, { useState, useEffect } from "react";
import "../css/Profile.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useNavigate, Link } from "react-router-dom";
import { FaUserEdit, FaTrash, FaSignOutAlt, FaHotel } from "react-icons/fa";


const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        pseudo: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login"); 
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const response = await fetch("http://localhost:8000/users/me", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user data. Please log in again.");
                }

                const userData = await response.json();
                setUser(userData);
                setFormData({ email: userData.email, pseudo: userData.pseudo });
            } catch (error) {
                console.error(error);
                setError(error.message);
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.id) {
            setError("User ID not found. Please refresh the page.");
            return;
        }

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:8000/users/${user.id}`, { // ✅ Utilisation de l'ID de l'utilisateur
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to update user profile.");
            }

            const updatedUser = await response.json();
            setUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user || !user.id) {
            setError("User ID not found. Please refresh the page.");
            return;
        }

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:8000/users/${user.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete account.");
            }

            localStorage.removeItem("token");
            navigate("/register");
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };

    return (
        <>
            <Header />

            <div className="profile-content">
                <h2>My Profile</h2>

                {error && <p className="error-message">{error}</p>}

                <div className="profile-cards">
                    {/* User Info Card */}
                    <div className="profile-card">
                        <h3>User Information</h3>
                        {user ? (
                            <>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Pseudo:</strong> {user.pseudo}</p>

                                <div className="profile-buttons">
                                    <button className="logout-button" onClick={() => {
                                            localStorage.removeItem("token");
                                            navigate("/login");
                                        }}>
                                        <FaSignOutAlt /> Logout
                                    </button>

                                    <button className="edit-button" onClick={() => setIsEditing(true)}>
                                        <FaUserEdit /> Edit
                                    </button>

                                    <button className="delete-button" onClick={handleDeleteAccount}>
                                        <FaTrash /> Delete Account
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p>Loading profile...</p>
                        )}
                    </div>

                    {/* My Bookings Card */}
                    <div className="profile-card">
                        <h3>My Bookings</h3>
                        <p>Check your reservations and upcoming stays.</p>
                        <Link to="/my-bookings" className="profile-view-all-bookings">
                            <FaHotel /> View My Bookings
                        </Link>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Edit Profile</h3>
                        <form onSubmit={handleEditSubmit}>
                            <label htmlFor="email">Email*:</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />

                            <label htmlFor="pseudo">Pseudo*:</label>
                            <input
                                id="pseudo"
                                type="text"
                                name="pseudo"
                                value={formData.pseudo}
                                onChange={handleInputChange}
                                required
                            />

                            <div className="modal-buttons">
                                <button type="submit" className="save-button">Save</button>
                                <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default Profile;