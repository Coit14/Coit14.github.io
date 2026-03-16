import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import '../Layout/AboutUs.css';
import { socialLinks } from '../../config/social';

function AboutUs() {
  return (
    <div className="about-page">
      <div className="about-content">
        <section className="history-section animate-in animate-delay-1">
          <h1>About Coit's Food Truck</h1>
          <p className="history-text animate-in animate-delay-2">
            Coit's has been an Oklahoma favorite since 1954, serving locals their classic all American favorites. Today, our food truck continues that tradition—bringing a taste of Oklahoma history to events and neighborhoods wherever we go..
          </p>

          <p className="history-text animate-in animate-delay-2">
            The all-time fan favorite is the #1—a delicious hot dog topped with mustard, chili, and onions. Want to add more flavors? Add cheese, jalapeños, or your favorite toppings at no extra charge. Every hot dog and frito pie is made just the way you like it.
          </p>

          <p className="history-text animate-in animate-delay-2">
            Stop by for an Original Coit's Root Beer or a refreshing Root Beer Float. Our handmade root beer is still made with pure cane sugar and served icy cold using the very best ice.
          </p>
        </section>

        <section className="contact-section animate-in animate-delay-3">
          <h2>CONNECT WITH US</h2>
          <div className="contact-info">
            <div className="contact-item">
              <h3>EMAIL</h3>
              <a href="mailto:coitsFTE@gmail.com" className="email-link" aria-label="Email coitsFTE@gmail.com">
                <FontAwesomeIcon icon={faEnvelope} className="email-icon" />
              </a>
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