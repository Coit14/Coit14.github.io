import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import HomeMobile from './HomeMobile';
import './Home.css';
//Home page for the website
const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Shop images array
  const shopImages = useMemo(() => [
    './images/demo/hoodie1.jpg',
    './images/demo/hoodie2.jpg',
    './images/demo/shirt1.jpg',
    './images/demo/shirt2.jpg',
    './images/demo/shirt3.jpg'
  ], []);

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = shopImages.map(src => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };

    loadImages();
  }, [shopImages]);

  // Image rotation
  useEffect(() => {
    if (!imagesLoaded) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % shopImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [imagesLoaded, shopImages.length]);

  // Scroll animation observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-in').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // If mobile, render HomeMobile component
  if (isMobile) {
    return <HomeMobile />;
  }

  return (
    <div className="home-content">
      {/* HERO */}
      <section className="hero-banner">
        <div className="hero-overlay">
          <h1>Oklahoma's Favorite Since 1954</h1>
          <p>
            Family-owned and serving Schwab's chili dogs, handmade root beer, and Oklahoma pride since day one.
          </p>
          <Link to="/about" className="cta-button hero-btn">Learn More</Link>
        </div>
      </section>

      {/* Horizontal Sections */}
      <section className="horizontal-section-wrapper">
        <div className="info-section">
          <img src="/images/About_IMG.png" alt="Booking" />
          <h2>Book Our Food Truck</h2>
          <p>Private events, weddings, and more — bring Coit's to your guests.</p>
          <Link to="/book-event" className="cta-button">Book Now</Link>
        </div>
        
        <div className="info-section">
          <img 
            src={shopImages[currentImageIndex]} 
            alt="Shop Preview"
            className={`shop-preview ${currentImageIndex === 0 ? 'visible' : ''}`}
          />
          <h2>Coit's Merch</h2>
          <p>Rep the brand with vintage tees and hoodies straight from the truck.</p>
          <Link to="/shop" className="cta-button">Visit the Shop</Link>
        </div>
        
        <div className="info-section">
          <img src="/images/About_IMG.png" alt="Find Our Truck" />
          <h2>Find Our Truck</h2>
          <p>We post our daily truck locations on Facebook. Check in and come find us!</p>
          <a 
            href="https://www.facebook.com/coitsfoodtruck/" 
            className="cta-button" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Visit Facebook
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home; 