import React, { useState } from 'react';
import '../css/Register.css';
import Footer from '../components/Footer'; 
import Header from '../components/Header'; 
import { FaLock, FaEnvelope, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [pseudo, setPseudo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        const userData = {
            email,
            pseudo,
            password
        };

        try {
            const response = await fetch("http://localhost:8000/users/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error("Registration failed. Please try again.");
            }

            navigate('/login'); 
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <>
            <Header />
            
            <div className="register-content">
                <h3>Create your account</h3>

                {error && <p className="error-message">{error}</p>}

                <form className="register-form" onSubmit={handleRegister}>
                    <div className="input-container">
                        <FaEnvelope className="icon" />
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required
                        />
                    </div>

                    <div className="input-container">
                        <FaUser className="icon" />
                        <input 
                            type="text" 
                            placeholder="Username" 
                            value={pseudo} 
                            onChange={(e) => setPseudo(e.target.value)} 
                            required
                        />
                    </div>

                    <div className="input-container">
                        <FaLock className="icon" />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                        />
                    </div>

                    <div className="input-container">
                        <FaLock className="icon" />
                        <input 
                            type="password" 
                            placeholder="Confirm Password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required
                        />
                    </div>

                    <button data-testid="register-button" type="submit">Register</button>
                    <div className="login-div">Already have an account? <span onClick={() => navigate('/login')}>Login</span></div>
                </form>
            </div>

            <Footer />
        </>
    );
};

export default Register;