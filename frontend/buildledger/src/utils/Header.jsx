import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import './Header.css';
import { Link, useLocation } from "react-router-dom";
import { useAuth } from './AuthContext.jsx';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMenuOpen(false);
    }, [location]);

    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
    };

    return (
        <header className="header-container">
            <div className="header">
                <Link to="/" className="heading-link">
                    <div className="heading">
                        <img src={logo} className="logo-image" alt="BuildLedger logo" />
                        <span>BuildLedger</span>
                    </div>
                </Link>

                {/* Desktop Options */}
                <nav className="options desktop-options">
                    <Link to="/" className="link">
                        <div className="home-button">Home</div>
                    </Link>
                    <Link to="/sites" className="link">
                        <div className="sites-button">Sites</div>
                    </Link>
                    <Link to="/transactions" className="link">
                        <div className="transactions-button">Transaction</div>
                    </Link>
                    <Link to="/calculator" className="link">
                        <div className="calculator-button">Calculator</div>
                    </Link>

                    {isAuthenticated ? (
                        <Link to="/profile" className="link">
                            <div className="profile-button highlight-profile">
                                👤 {user?.username || "Profile"}
                            </div>
                        </Link>
                    ) : (
                        <Link to="/login" className="link">
                            <div className="login-button">Login/SignUp</div>
                        </Link>
                    )}
                </nav>

                <button
                    className={`hamburger-btn ${isMenuOpen ? 'open' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle navigation menu"
                    aria-expanded={isMenuOpen}
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
            </div>
            <div className={`mobile-menu ${isMenuOpen ? 'show' : ''}`}>
                <nav className="mobile-options">
                    <Link to="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                        <div className="mobile-item">Home</div>
                    </Link>
                    <Link to="/sites" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                        <div className="mobile-item">Sites</div>
                    </Link>
                    <Link to="/transactions" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                        <div className="mobile-item">Transaction</div>
                    </Link>
                    <Link to="/calculator" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                        <div className="mobile-item">Calculator</div>
                    </Link>

                    {isAuthenticated ? (
                        <Link to="/profile" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                            <div className="mobile-item profile-highlight">
                                👤 {user?.username || "Profile"}
                            </div>
                        </Link>
                    ) : (
                        <Link to="/login" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                            <div className="mobile-item login-highlight">Login/SignUp</div>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;