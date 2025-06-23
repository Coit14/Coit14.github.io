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
      <section className="mobile-hero-section hero-image-top">
        <div className="mobile-hero-content hero-overlay-top animate-in">
          <h2>SERVING OKLAHOMA SINCE 1954</h2>
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
              src="/images/placeholder-image.jpg" 
              alt="Placeholder for Family Tradition" 
              className="mobile-booking-image"
            />
          </div>
          <div className="mobile-content">
            <h2>Family Tradition</h2>
            <p>
              Since 1954, Coit's has been serving Oklahoma with our legendary Schwab's chili, perfectly grilled hot dogs, and refreshing handmade root beer. A family tradition that continues to bring joy to every event.
            </p>
            <Link to="/about" className="mobile-cta-button">Learn More</Link>
          </div>
        </div>
      </section>

      <section className="mobile-section">
        <div className="mobile-feature-card animate-in">
          <div className="mobile-image-container">
            <img 
              src="/images/placeholder-image.jpg" 
              alt="Placeholder for Book Us for Your Event" 
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

      <section className="mobile-section">
        <div className="mobile-feature-card animate-in">
          <div className="mobile-image-container">
            <img 
              src="/images/placeholder-image.jpg" 
              alt="Find Us on Facebook" 
              className="mobile-booking-image"
            />
          </div>
          <div className="mobile-content">
            <h2>Find Us</h2>
            <p>
              Want to know where we'll be next? We post all our upcoming events and locations on Facebook. 
              Follow us to stay up to date and never miss your chance for a classic Coit's meal!
            </p>
            <a href="https://www.facebook.com/coitsfoodtruck/" target="_blank" rel="noopener noreferrer" className="mobile-cta-button">Follow on Facebook</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeMobile; 