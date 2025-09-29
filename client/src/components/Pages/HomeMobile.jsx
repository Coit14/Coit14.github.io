import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './HomeMobile.css';

const HomeMobile = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
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


  return (
    <div className="mobile-home-content">
      {/* Hero Section */}
      <section className="mobile-hero animate-in">
        <div className="mobile-hero-image-container">
          <img 
            src="/images/hero-image2.jpg" 
            alt="Coit's Food Truck - A Family Tradition Since 1954" 
            className="mobile-hero-image"
          />
          <div className="mobile-hero-overlay"></div>
        </div>
      </section>

      {/* Family Tradition Card */}
      <section className="mobile-section">
        <div className="mobile-feature-card animate-in animate-delay-1"> 
          <div className="mobile-image-container">
            <img 
              src="/images/image-28.png" 
              alt="Coit's Root Beer Stand - Family Tradition" 
              className="mobile-booking-image"
              style={{ objectPosition: 'left center' }}
            />
          </div>
          <div className="mobile-content">
            <h2>Family Tradition</h2>
            <p>
              Coit's has been serving Oklahoma since 1954. Our food truck still continues as a family-owned and operated business.
              We proudly serve our original Schwab's chili and hot dogs alongside our famous handmade root beer.
            </p>
            <Link to="/about" className="mobile-cta-button">Learn More</Link>
          </div>
        </div>
      </section>

      {/* Menu Card */}
      <section className="mobile-section">
        <div className="mobile-feature-card animate-in animate-delay-2"> 
          <div className="mobile-image-container">
            <img 
              src="/images/coits_img.jpg" 
              alt="Coit's menu board with hot dogs and drinks display" 
              className="menu-card-image"
              style={{ objectPosition: 'center bottom' }}
            />
          </div>
          <div className="mobile-content">
            <h2>Our Classic Menu</h2>
            <p>
              Discover our classic menu featuring the original Schwab's chili, perfectly cooked hot dogs, and our famous handmade root beer.
            </p>
            <Link to="/menu" className="mobile-cta-button">View Menu</Link>
          </div>
        </div>
      </section>

      {/* Find Us Card */}
      <section className="mobile-section find-us-section">
        <div className="mobile-feature-card animate-in animate-delay-3"> 
          <div className="mobile-image-container">
            <img 
              src="/images/facebook.png" 
              alt="Follow Coit's Food Truck on Facebook" 
              className="mobile-booking-image"
            />
          </div>
          <div className="mobile-content">
            <h2>Find Us</h2>
            <p>
              We post all our upcoming events and locations on Facebook. Follow us to stay up to date and never miss your chance for a classic Coit's meal!
            </p>
            <a href="https://www.facebook.com/coitsfoodtruck/" target="_blank" rel="noopener noreferrer" className="mobile-cta-button">Follow on Facebook</a>
          </div>
        </div>
      </section>

      {/* Booking Section Card */}
      <section className="mobile-section">
        <div className="mobile-feature-card animate-in animate-delay-4"> 
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
              Want to make your event special? Book Coit's Food Truck for your next gathering! We book private events, corporate functions, weddings, and more.
            </p>
            <Link to="/book-event" className="mobile-cta-button">Book Now</Link>
          </div>
        </div>
      </section>

      {/* Shop Section Card (Merch) */}
      <section className="mobile-section">
        <div className="mobile-feature-card animate-in animate-delay-5"> 
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