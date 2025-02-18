import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import '../Layout/AboutUs.css';
import { socialLinks } from '../../config/social';

function AboutUs() {
  return (
    <div className="about-page">
      <div className="about-content">
        <section className="history-section animate-in animate-delay-1">
          <h1>About Coit's Food Truck</h1>
          <p className="history-text animate-in animate-delay-2">
            Coit's Food Truck began as a beloved restaurant in Oklahoma, serving 
            locals the best root beer and hot dogs since 1954. Over the decades, 
            we've evolved into a food truck, continuing to bring the same quality 
            and nostalgia to our community. Our food truck now travels to events 
            and neighborhoods, delivering a taste of Oklahoma history wherever we go.
          </p>
        </section>

        <section className="contact-section animate-in animate-delay-3">
          <h2>CONNECT WITH US</h2>
          <div className="contact-info">
            <div className="contact-item">
              <h3>EMAIL</h3>
              <a href="mailto:info@coitsfoodtruck.com">info@coitsfoodtruck.com</a>
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