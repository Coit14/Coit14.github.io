import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { FaFacebook } from 'react-icons/fa';
import { socialLinks } from '../../config/social';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-links">
                    <span className="follow-text">Follow us on</span>
                    <a 
                        href={socialLinks.facebook}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="social-icon facebook"
                    >
                        <FaFacebook />
                    </a>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Coit's Food Truck. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
