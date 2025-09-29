import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import '../Layout/AboutUs.css';
import { socialLinks } from '../../config/social';

function AboutUs() {
  return (
    <div className="about-page">
      {/* Modern Hero Section */}
      <section className="about-hero animate-in">
        <div className="hero-image-container">
          <img 
            src="/images/hero-image2.jpg" 
            alt="Coit's Food Truck - A Family Tradition Since 1954" 
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
      </section>

      <div className="about-content">
        <section className="history-section animate-in animate-delay-1">
          <h1>About Coit's Food Truck</h1>
          <p className="history-text animate-in animate-delay-2">
            Coit's began as a beloved restaurant in Oklahoma, serving locals the best root beer and hot dogs since 1954.
            Today, our food truck brings a taste of Oklahoma history to events and neighborhoods wherever we go. Find us on facebook!
          </p>

          <p className="history-text animate-in animate-delay-2">
            The all-time Coit's fan favorite—the #1—is our hot dog topped with mustard, chili, and onions.
            Want to take it up a notch? Add cheese, jalapeños, or any favorite toppings at no extra charge.
            Every hot dog is made just the way you like it.
          </p>

          <p className="history-text animate-in animate-delay-2">
            Stop by to enjoy our Original Coit's Root Beer or a refreshing Root Beer Float!
            And yes, we still use pure cane sugar in our handmade root beer, paired with the very best ice.
          </p>
        </section>

        <section className="contact-section animate-in animate-delay-3">
          <h2>CONNECT WITH US</h2>
          <div className="contact-info">
            <div className="contact-item">
              <h3>EMAIL</h3>
              <a href="mailto:coitsFTE@gmail.com">coitsFTE@gmail.com</a>
            </div>
            <div className="contact-item">
              <h3>FACEBOOK MESSENGER</h3>
              <div className="contact-methods">
                <div className="contact-method">
                  <a
                    href={socialLinks.messenger}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FontAwesomeIcon
                      icon={faFacebook}
                      className="messenger-icon"
                    />
                  </a>
                </div>
              </div>
            </div>
           
            <div className="contact-item">
              <h3>FOLLOW US</h3>
              <div className="social-links">
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link facebook"
                >
                  <FontAwesomeIcon icon={faFacebook} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutUs; 