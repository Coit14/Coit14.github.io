import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import HomeMobile from './HomeMobile';
import './Home.css';
//Home page for the website
const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Shop images array
  const shopImages = useMemo(() => [
    './images/demo/retro-trucker-hat-charcoal-black-front-6859c5cf83d76.png',
    './images/demo/retro-trucker-hat-cranberry-front-6859c5cf8464c.png',
    './images/demo/retro-trucker-hat-white-front-6859c5cf847b5.png',
    './images/demo/unisex-staple-t-shirt-athletic-heather-front-and-back-685883b4807d5.jpg',
    './images/demo/unisex-staple-t-shirt-black-heather-front-and-back-685883b47f213.jpg',
    './images/demo/unisex-staple-t-shirt-white-front-and-back-685883b48335e.jpg'
  ], []);

  // Image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % shopImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [shopImages.length]);


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
      {/* Feature Cards Grid */}
      <div className="feature-cards-container">
        {/* Family Tradition Card */}
        <div className="feature-card hero-card animate-in animate-delay-1">
          <div className="card-image-container">
            <img 
              src="/images/image-28.png" 
              alt="Coit's Root Beer Stand - Family Tradition" 
              className="hero-card-image"
              loading="lazy"
            />
            <div className="card-overlay">
              <div className="overlay-content">
                <span className="overlay-text">Since 1954</span>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="card-badge">Our Story</div>
            <h2>Family Tradition</h2>
            <p>
              Coit's has been serving Oklahoma since 1954. Our food truck still continues as a family-owned and operated business.
              We proudly serve our original Schwab's chili and hot dogs alongside our famous handmade root beer.
            </p>
            <Link to="/about" className="cta-button">
              <span>Learn More</span>
              <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Menu Card */}
        <div className="feature-card menu-card animate-in animate-delay-2">
          <div className="card-image-container">
            <img 
              src="/images/coits_img.jpg" 
              alt="Coit's menu board with hot dogs and drinks display" 
              className="menu-card-image"
              loading="lazy"
            />
            <div className="card-overlay">
              <div className="overlay-content">
                <span className="overlay-text">Classic Menu</span>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="card-badge">Menu</div>
            <h2>Our Menu</h2>
            <p>
              Discover our classic menu featuring the original Schwab's chili, perfectly cooked hot dogs, and our famous handmade root beer.
            </p>
            <Link to="/menu" className="cta-button">
              <span>View Menu</span>
              <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Find Us Card */}
        <div className="feature-card animate-in animate-delay-3">
          <div className="card-image-container">
            <img 
              src="/images/facebook.png" 
              alt="Follow Coit's Food Truck on Facebook" 
              className="booking-image"
              loading="lazy"
            />
            <div className="card-overlay">
              <div className="overlay-content">
                <span className="overlay-text">Find Us</span>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="card-badge">Find Us</div>
            <h2>Where are we?</h2>
            <p>
              We post all our upcoming events and locations on Facebook. Follow us to stay up to date and never miss your chance for a classic Coit's meal!
            </p>
            <a href="https://www.facebook.com/coitsfoodtruck/" target="_blank" rel="noopener noreferrer" className="cta-button">
              <span>Follow on Facebook</span>
              <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Booking Section Card */}
        <div className="feature-card animate-in animate-delay-4">
          <div className="card-image-container">
            <img 
              src="/images/ft.jpg" 
              alt="Coit's Food Truck - Book Us for Your Event" 
              className="booking-image"
              loading="lazy"
            />
            <div className="card-overlay">
              <div className="overlay-content">
                <span className="overlay-text">Book Us</span>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="card-badge">Events</div>
            <h2>Book Us for Your Event</h2>
            <p>
              Want to make your event special? Book Coit's Food Truck for your next
              gathering! We book private events, corporate functions, weddings, and more.
            </p>
            <Link to="/book-event" className="cta-button">
              <span>Book Now</span>
              <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Shop Section Card (Merch) */}
        <div className="feature-card animate-in animate-delay-5">
          <div className="card-image-container">
            <div className="cycling-images-container">
              {shopImages.map((img, index) => (
                <img 
                  key={index}
                  src={img}
                  alt={`Coit's Merchandise ${index + 1}`}
                  className={`shop-image ${currentImageIndex === index ? 'active' : ''}`}
                  loading="lazy"
                />
              ))}
            </div>
            <div className="card-overlay">
              <div className="overlay-content">
                <span className="overlay-text">Exclusive Merch</span>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="card-badge">Shop</div>
            <h2>Exclusive Merchandise</h2>
            <p>
              Check out our shop for exclusive Coit's merchandise! From t-shirts to collectibles, show your love for Oklahoma's favorite food truck.
            </p>
            <Link to="/shop" className="cta-button">
              <span>Visit the Shop</span>
              <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <section className="trust-indicators">
        <div className="trust-content">
          <div className="trust-item">
            <div className="trust-icon">🏆</div>
            <h3>Since 1954</h3>
            <p>70+ years of tradition</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">👨‍👩‍👧‍👦</div>
            <h3>Family Owned</h3>
            <p>Passed down through generations</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">⭐</div>
            <h3>Oklahoma's Favorite</h3>
            <p>Beloved by the community</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 