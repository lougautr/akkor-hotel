import React, { useEffect } from "react";
import "../css/Admin.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useNavigate, Link } from "react-router-dom";
import { FaBed, FaUsers } from "react-icons/fa";
import { BsCalendarDateFill } from "react-icons/bs";


const Admin = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }
    }, [navigate]);

    return (
        <>
            <Header />

            <div className="admin-content">
                <h2>Admin Dashboard</h2>

                <div className="admin-cards">
                    {/* Users Card */}
                    <div className="admin-card">
                        <h1><FaUsers /></h1>
                        <Link to="/admin/users" className="admin-view-link">View Users</Link>
                    </div>

                    {/* Hotels Card */}
                    <div className="admin-card">
                        <h1><FaBed /></h1>
                        <Link to="/admin/hotels" className="admin-view-link">View Hotels</Link>
                    </div>

                    {/* Bookings Card */}
                    <div className="admin-card">
                        <h1><BsCalendarDateFill /></h1>
                        <Link to="/admin/bookings" className="admin-view-link">View Bookings</Link>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Admin;