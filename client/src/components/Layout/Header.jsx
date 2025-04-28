import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../contexts/CartContext';
import './Header.css';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setIsCartOpen, getCartCount } = useCart();
  const menuRef = useRef(null);
  
  const cartItemCount = getCartCount() || 0;

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (event.target.closest('.menu-toggle')) {
          // Click was on the menu toggle button, do nothing
          return;
        }
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [scrolled]);

  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className="header-spacer"></div>
      <header className={`header-container ${scrolled ? 'scrolled' : ''}`}>
        <div className="notification-bar">
          <span>PLANNING AN EVENT?</span>
          <Link to="/book-event" className="subscribe-button">Book Here</Link>
        </div>
        
        <div className="header-content">
          {/* Desktop Navigation */}
          <nav className="desktop-nav">
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

          {/* Mobile Navigation */}
          <div className="mobile-nav">
            <Link to="/" className="mobile-logo-container">
              <img 
                src="/images/logo.png" 
                alt="Coit's Food Truck" 
                className="logo"
              />
            </Link>

            <div className="mobile-controls">
              <button 
                className="menu-toggle" 
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
              </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`} ref={menuRef}>
              <Link to="/" onClick={() => setIsMenuOpen(false)}>HOME</Link>
              <Link to="/menu" onClick={() => setIsMenuOpen(false)}>MENU</Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)}>ABOUT US</Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)}>SHOP</Link>
              <div 
                className="cart-icon mobile-cart" 
                onClick={() => {
                  setIsCartOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                <FontAwesomeIcon icon={faShoppingCart} />
                {cartItemCount > 0 && (
                  <span className="cart-count">{cartItemCount}</span>
                )}
                <span className="cart-text">CART</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header; 