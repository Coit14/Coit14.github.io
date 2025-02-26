import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import HomeMobile from './HomeMobile';
import './Home.css';

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

    // Observe all animate-in elements
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
      {/* Hero Section */}
      <section className="content-section">
        <div className="section-content left animate-in animate-delay-1">
          <h2>Oklahoma's Favorite Since 1954</h2>
          <p>
          Coit's has been serving Oklahoma since 1954. Our food truck still continues as a family-owned and operated business.
          We proudly serve our original Schwab's chili and hot dogs alongside our famous handmade root beer.
          </p>
          <Link to="/about" className="cta-button">Learn More</Link>
        </div>
      </section>

      {/* Shop Section */}
      <section className="content-section shop-section">
        <div className="section-image left animate-in animate-delay-3">
          <div className="cycling-images-container">
            {shopImages.map((img, index) => (
              <img 
                key={index}
                src={img}
                alt={`Coit's Merchandise ${index + 1}`}
                className={`shop-image ${currentImageIndex === index ? 'active' : ''}`}
                style={{ 
                  opacity: currentImageIndex === index ? 1 : 0,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transition: 'opacity 0.5s ease-in-out'
                }}
              />
            ))}
          </div>
        </div>
        <div className="section-content right animate-in animate-delay-4">
          <h2>Exclusive Merchandise</h2>
          <p>
            Check out our shop for exclusive Coit's merchandise! From t-shirts 
            to collectibles, show your love for Oklahoma's favorite food truck.
          </p>
          <Link to="/shop" className="cta-button">Visit the Shop</Link>
        </div>
      </section>

      {/* Booking Section with updated styling */}
      <section className="content-section booking-section">
        <div className="section-content left animate-in animate-delay-5">
          <h2>Book Us for Your Event</h2>
          <p>
            Want to make your event special? Book Coit's Food Truck for your next 
            gathering! We cater private events, corporate functions, weddings, and more.
          </p>
          <Link to="/book-event" className="cta-button">Book Now</Link>
        </div>
        <div className="section-image right animate-in animate-delay-6">
          <img 
            src="/images/menu.jpg" 
            alt="Coit's Food Truck at an event" 
            className="booking-image"
          />
        </div>
      </section>
    </div>
  );
};

export default Home; 