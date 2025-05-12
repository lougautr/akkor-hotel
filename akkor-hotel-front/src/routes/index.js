import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../views/Home';
import HotelDetails from '../views/HotelDetails';
import Login from '../views/Login';
import Register from '../views/Register';
import Profile from '../views/Profile';
import RoomBooking from '../views/RoomBooking'; 
import MyBookings from '../views/MyBookings'; 
import Admin from '../views/Admin'; 
import AdminHotels from '../views/AdminHotels'; 
import AdminUsers from '../views/AdminUsers'; 
import AdminRooms from '../views/AdminRooms'; 
import AdminBookings from '../views/AdminBookings'; 

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/hotel/:id" element={<HotelDetails />} />
                <Route path="/hotel/:id/room/:roomId/book" element={<RoomBooking />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/hotels" element={<AdminHotels />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/hotel/:id/rooms" element={<AdminRooms />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;