import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './HomeMobile.css';

const HomeMobile = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
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

  return (
    <div className="mobile-home-content">
      {/* Hero Section */}
      <section className="mobile-hero-section">
        <div className="mobile-hero-content animate-in">
          <h2>Oklahoma's Favorite Since 1954</h2>
          <p>
            Coit's has been serving Oklahoma since 1954. Our food truck still continues as a family-owned and operated business.
            We proudly serve our original Schwab's chili and hot dogs alongside our famous handmade root beer.
          </p>
          <Link to="/about" className="mobile-cta-button">Learn More</Link>
        </div>
      </section>

      {/* Shop Section */}
      <section className="mobile-section">
        <div className="mobile-feature-card animate-in">
          <div className="mobile-image-container">
            <div className="mobile-cycling-images">
              {shopImages.map((img, index) => (
                <img 
                  key={index}
                  src={img}
                  alt={`Coit's Merchandise ${index + 1}`}
                  className={`mobile-shop-image ${currentImageIndex === index ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
          <div className="mobile-content">
            <h2>Exclusive Merchandise</h2>
            <p>
              Check out our shop for exclusive Coit's merchandise! From t-shirts 
              to collectibles, show your love for Oklahoma's favorite food truck.
            </p>
            <Link to="/shop" className="mobile-cta-button">Visit the Shop</Link>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="mobile-section">
        <div className="mobile-feature-card animate-in">
          <div className="mobile-image-container">
            <img 
              src="/images/coits_img.jpg" 
              alt="Coit's menu board with hot dogs and drinks display" 
              className="mobile-booking-image"
            />
          </div>
          <div className="mobile-content">
            <h2>Book Us for Your Event</h2>
            <p>
              Want to make your event special? Book Coit's Food Truck for your next 
              gathering! We cater private events, corporate functions, weddings, and more.
            </p>
            <Link to="/book-event" className="mobile-cta-button">Book Now</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeMobile; 