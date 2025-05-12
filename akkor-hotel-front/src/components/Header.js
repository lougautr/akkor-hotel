import React, { useEffect, useState } from "react";
import "../css/Header.css";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [isAdmin, setIsAdmin] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);

            if (token) {
                try {
                    const response = await fetch("http://localhost:8000/users/me", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error("Failed to fetch user data");
                    }

                    const userData = await response.json();
                    setIsAdmin(userData.is_admin || false);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setIsAdmin(false);
            }
        };

        checkAuth();
        window.addEventListener("storage", checkAuth);

        return () => {
            window.removeEventListener("storage", checkAuth);
        };
    }, []);

    return (
        <header className="sticky-header">
            <div className="header-content">
                <h2 className="logo">Akkor Arena</h2>
                <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </button>
                <div className={`header-links ${menuOpen ? "open" : ""}`}>
                    <nav>
                        <ul>
                            <li onClick={() => { navigate("/"); setMenuOpen(false); }}>Hotels</li>
                        </ul>
                    </nav>
                    {isAdmin && (
                        <button className="admin-button" onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                            Admin
                        </button>
                    )}
                    <div>
                        {isLoggedIn ? (
                            <button className="profile-button" onClick={() => { navigate("/profile"); setMenuOpen(false); }}>
                                My Profile
                            </button>
                        ) : (
                            <button className="login-button" onClick={() => { navigate("/login"); setMenuOpen(false); }}>
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;