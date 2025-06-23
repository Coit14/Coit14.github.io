import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './HomeMobile.css';

const HomeMobile = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [visibleCards, setVisibleCards] = useState(0);
  
  // Shop images array
  const shopImages = useMemo(() => [
    './images/demo/retro-trucker-hat-charcoal-black-front-6859c5cf83d76.png',
    './images/demo/retro-trucker-hat-cranberry-front-6859c5cf8464c.png',
    './images/demo/retro-trucker-hat-white-front-6859c5cf847b5.png',
    './images/demo/unisex-staple-t-shirt-athletic-heather-front-and-back-685883b4807d5.jpg',
    './images/demo/unisex-staple-t-shirt-black-heather-front-and-back-685883b47f213.jpg',
    './images/demo/unisex-staple-t-shirt-white-front-and-back-685883b48335e.jpg'
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

  // Progressive card reveal
  useEffect(() => {
    const revealCards = () => {
      setVisibleCards(prev => Math.min(prev + 1, 5));
    };
    const timers = [];
    for (let i = 0; i < 5; i++) {
      timers.push(setTimeout(revealCards, i * 300));
    }
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  return (
    <div className="mobile-home-content">
      {/* Hero Section */}
      <section className="mobile-hero-section hero-image-top"></section>

      {/* Family Tradition Card */}
      <section className="mobile-section">
        <div className={`mobile-feature-card ${visibleCards >= 1 ? 'animate-in' : 'hidden'}`}> 
          <div className="mobile-image-container">
            <img 
              src="/images/image-28.png" 
              alt="Coit's Root Beer Stand - Family Tradition" 
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

      {/* Menu Card */}
      <section className="mobile-section">
        <div className={`mobile-feature-card ${visibleCards >= 2 ? 'animate-in' : 'hidden'}`}> 
          <div className="mobile-image-container">
            <img 
              src="/images/coits_img.jpg" 
              alt="Coit's menu board with hot dogs and drinks display" 
              className="menu-card-image"
            />
          </div>
          <div className="mobile-content">
            <h2>Our Classic Menu</h2>
            <p>
              Discover our classic menu featuring the original Schwab's chili, perfectly grilled hot dogs, and our famous handmade root beer. Every bite tells a story of tradition and quality.
            </p>
            <Link to="/menu" className="mobile-cta-button">View Menu</Link>
          </div>
        </div>
      </section>

      {/* Find Us Card */}
      <section className="mobile-section">
        <div className={`mobile-feature-card ${visibleCards >= 3 ? 'animate-in' : 'hidden'}`}> 
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

      {/* Booking Section Card */}
      <section className="mobile-section">
        <div className={`mobile-feature-card ${visibleCards >= 4 ? 'animate-in' : 'hidden'}`}> 
          <div className="mobile-image-container">
            <img 
              src="/images/ft.jpg" 
              alt="Coit's Food Truck - Book Us for Your Event" 
              className="mobile-booking-image"
            />
          </div>
          <div className="mobile-content">
            <h2>Book Us for Your Event</h2>
            <p>
              Want to make your event special? Book Coit's Food Truck for your next gathering! We cater private events, corporate functions, weddings, and more.
            </p>
            <Link to="/book-event" className="mobile-cta-button">Book Now</Link>
          </div>
        </div>
      </section>

      {/* Shop Section Card (Merch) */}
      <section className="mobile-section">
        <div className={`mobile-feature-card ${visibleCards >= 5 ? 'animate-in' : 'hidden'}`}> 
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
              Check out our shop for exclusive Coit's merchandise! From t-shirts to collectibles, show your love for Oklahoma's favorite food truck.
            </p>
            <Link to="/shop" className="mobile-cta-button">Visit the Shop</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeMobile; 