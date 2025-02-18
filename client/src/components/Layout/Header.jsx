import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../contexts/CartContext';
import './Header.css';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { setIsCartOpen, getCartCount } = useCart();
  
  const cartItemCount = getCartCount() || 0;

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <>
      <div className="header-spacer"></div>
      <header className={`header-container ${scrolled ? 'scrolled' : ''}`}>
        <div className="notification-bar">
          <span>PLANNING AN EVENT?</span>
          <Link to="/book-event" className="subscribe-button">Book Here</Link>
        </div>
        <div className="header-content">
          <nav className="main-nav">
            <div className="nav-section left">
              <Link to="/">HOME</Link>
              <Link to="/menu">MENU</Link>
            </div>
            
            <Link to="/" className="logo-container">
              <img 
                src="/images/logo.png" 
                alt="Coit's Food Truck" 
                className="logo"
              />
            </Link>
            
            <div className="nav-section right">
              <Link to="/about">ABOUT US</Link>
              <Link to="/shop">SHOP</Link>
              <div className="cart-icon" onClick={() => setIsCartOpen(true)}>
                <FontAwesomeIcon icon={faShoppingCart} />
                {cartItemCount > 0 && (
                  <span className="cart-count">{cartItemCount}</span>
                )}
              </div>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}

export default Header; 