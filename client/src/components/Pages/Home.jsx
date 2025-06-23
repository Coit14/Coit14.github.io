import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import HomeMobile from './HomeMobile';
import './Home.css';
//Home page for the website
const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCards, setVisibleCards] = useState(0);
  
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
        // Simulate loading time for better UX
        setTimeout(() => setIsLoading(false), 800);
      } catch (error) {
        console.error('Error loading images:', error);
        setIsLoading(false);
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

  // Progressive card reveal
  useEffect(() => {
    if (isLoading) return;

    const revealCards = () => {
      const timer = setTimeout(() => {
        setVisibleCards(prev => Math.min(prev + 1, 5));
      }, 200);
      return timer;
    };

    const timers = [];
    for (let i = 0; i < 5; i++) {
      timers.push(setTimeout(revealCards, i * 300));
    }

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [isLoading]);

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

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="home-content">
        <div className="skeleton-hero">
          <div className="skeleton-hero-content"></div>
        </div>
        <div className="skeleton-cards">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-button"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="home-content">
      {/* Hero Section */}
      <section className="hero-section hero-image-top"></section>

      {/* Feature Cards Grid */}
      <div className="feature-cards-container">
        {/* Family Tradition Card */}
        <div className={`feature-card hero-card ${visibleCards >= 1 ? 'animate-in animate-delay-2' : 'hidden'}`}>
          <div className="card-image-container">
            <img 
              src="/images/placeholder-image.jpg" 
              alt="Placeholder for Family Tradition" 
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
              Since 1954, Coit's has been serving Oklahoma with our legendary Schwab's chili, 
              perfectly grilled hot dogs, and refreshing handmade root beer. A family tradition 
              that continues to bring joy to every event.
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
        <div className={`feature-card menu-card ${visibleCards >= 2 ? 'animate-in animate-delay-3' : 'hidden'}`}>
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
            <h2>Our Classic Menu</h2>
            <p>
              Discover our classic menu featuring the original Schwab's chili, 
              perfectly grilled hot dogs, and our famous handmade root beer. 
              Every bite tells a story of tradition and quality.
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
        <div className={`feature-card ${visibleCards >= 3 ? 'animate-in animate-delay-4' : 'hidden'}`}>
          <div className="card-image-container">
            <img 
              src="/images/placeholder-image.jpg" 
              alt="Find Us on Facebook" 
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
            <h2>Where's Coit's?</h2>
            <p>
              Want to know where we'll be next? We post all our upcoming events and locations on Facebook. 
              Follow us to stay up to date and never miss your chance for a classic Coit's meal!
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
        <div className={`feature-card ${visibleCards >= 4 ? 'animate-in animate-delay-5' : 'hidden'}`}>
          <div className="card-image-container">
            <img 
              src="/images/ft.jpg" 
              alt="Book Us for Your Event - Coit's Food Truck" 
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
              gathering! We cater private events, corporate functions, weddings, and more.
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
        <div className={`feature-card ${visibleCards >= 5 ? 'animate-in animate-delay-6' : 'hidden'}`}>
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
              Check out our shop for exclusive Coit's merchandise! From t-shirts 
              to collectibles, show your love for Oklahoma's favorite food truck.
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