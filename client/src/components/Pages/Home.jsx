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
      <section className="hero-section">
        <div className="hero-content animate-in animate-delay-1">
          <h2>Oklahoma's Favorite Since 1954</h2>
          <p>
            A family-owned tradition serving our original Schwab's chili, classic hot dogs, and famous handmade root beer.
          </p>
          <Link to="/about" className="cta-button">Learn More</Link>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <div className="feature-cards-container">
        {/* Shop Section Card */}
        <div className="feature-card animate-in animate-delay-2">
          <div className="card-image-container">
            <div className="cycling-images-container">
              {shopImages.map((img, index) => (
                <img 
                  key={index}
                  src={img}
                  alt={`Coit's Merchandise ${index + 1}`}
                  className={`shop-image ${currentImageIndex === index ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
          <div className="card-content">
            <h2>Exclusive Merchandise</h2>
            <p>
              Check out our shop for exclusive Coit's merchandise! From t-shirts 
              to collectibles, show your love for Oklahoma's favorite food truck.
            </p>
            <Link to="/shop" className="cta-button">Visit the Shop</Link>
          </div>
        </div>

        {/* Booking Section Card */}
        <div className="feature-card animate-in animate-delay-3">
          <div className="card-image-container">
            <img 
              src="/images/coits_img.jpg" 
              alt="Coit's menu board with hot dogs and drinks display" 
              className="booking-image"
            />
          </div>
          <div className="card-content">
            <h2>Book Us for Your Event</h2>
            <p>
              Want to make your event special? Book Coit's Food Truck for your next 
              gathering! We cater private events, corporate functions, weddings, and more.
            </p>
            <Link to="/book-event" className="cta-button">Book Now</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 