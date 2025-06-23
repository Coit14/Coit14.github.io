import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import '../Layout/AboutUs.css';
import { socialLinks } from '../../config/social';

function AboutUs() {
  return (
    <div className="about-page">
      <div className="about-content">
        <section className="hero-section animate-in animate-delay-1">
          <h1>Our Story</h1>
          <p className="hero-subtitle">
            From a humble root beer stand to Oklahoma's favorite food truck
          </p>
        </section>

        <section className="history-section animate-in animate-delay-2">
          <div className="history-content">
            <div className="history-block">
              <h2>The Beginning: 1954</h2>
              <p>
                Coit's Root Beer Drive-In was founded by Donald "Don" Coit in Oklahoma City in 1954. 
                After returning from World War II, Don seized an opportunity to purchase a small lot at 
                SW 25th Street and Western Avenue. With $1,800 saved and a loan from his mother, he 
                opened a one-room root beer stand under the Weber's brand name. The stand had no windows 
                or indoor seating – just a shuttered counter for carhop service, catering to the 1950s 
                cruising culture. Don soon ended his franchise affiliation and renamed the business 
                Coit's Root Beer Drive-In, reflecting his own family name.
              </p>
            </div>

            <div className="history-block">
              <h2>Innovation & Growth: The Christmas Tree Venture</h2>
              <p>
                Despite early popularity for its frosty homemade root beer and hot dogs, the first winters 
                were tough. Cold weather meant sluggish root beer sales, and Don looked for new income to 
                keep the business afloat. On a firefighter friend's suggestion, he began selling Christmas 
                trees on the drive-in lot during the holiday season. Don personally traveled to Washington 
                and North Carolina to source quality evergreens, even staying with tree growers to learn 
                the trade. By the 1980s, the Coit's logo featured a Christmas tree atop the "i," symbolizing 
                this dual identity. Each winter the company would sell thousands of trees across up to five 
                lots in the metro area.
              </p>
            </div>

            <div className="history-block">
              <h2>Expansion: Three Drive-In Locations</h2>
              <p>
                As business grew, Don expanded beyond the original southside location. In 1960, he upgraded 
                the South Western Ave stand into a full drive-in restaurant with curbside carhop service 
                and eventually indoor seating. Over the next decade, Coit opened two additional drive-ins 
                in Oklahoma City: NW 39th Street & N. Pennsylvania Ave. and NW 50th Street & N. Portland Ave. 
                Each Coit's Drive-In was a retro Americana destination, famous for frosty mugs of 
                old-fashioned root beer and chili dogs with bright red-casing franks.
              </p>
            </div>

            <div className="history-block">
              <h2>Family Legacy Continues</h2>
              <p>
                Coit's was always a true family business. Don's wife, Jessie "Ann" Coit, was his partner 
                in life and business for nearly six decades. Their son, William "Bill" Coit, literally grew 
                up in the drive-in and followed in his father's footsteps as a restaurateur. By the early 
                2000s, Bill was the general manager overseeing daily operations of all Coit's Drive-In 
                locations. Bill's wife, Janet "Sue" Coit, was also integral to the business's continuity 
                until her passing in 2020.
              </p>
            </div>

            <div className="history-block">
              <h2>The Food Truck Era: 2015-Present</h2>
              <p>
                Even after the restaurants closed in 2012, the Coit family was determined to keep their 
                legacy alive. In 2015, just a year after Jessie Coit's passing, they launched Coit's Food 
                Truck, a mobile eatery bringing back many of the old favorites. This new chapter is helmed 
                by the third generation of the Coit family – Bill and Sue's sons Dean, Eddie, and Kendall 
                Coit. Together, the brothers have resurrected the Coit's name on wheels, ensuring that 
                loyal fans can still get a taste of history.
              </p>
            </div>

            <div className="history-block">
              <h2>Today's Coit's Experience</h2>
              <p>
                Today, Coit's Food Truck frequents local events, festivals, and office parks around the 
                Oklahoma City metro. We serve the same kind of classic hot dogs and homemade Coit's root 
                beer that generations of Oklahomans remember. The food truck intentionally harkens back 
                to the original recipes – pouring ice-cold draft root beer with that signature "crisp bite" 
                and serving chili-topped hot dogs on Schwab's red-cased franks. By embracing the modern 
                food truck trend, we've found a way to honor our mid-century drive-in heritage while 
                operating with more flexibility and lower overhead.
              </p>
            </div>
          </div>
        </section>

        <section className="values-section animate-in animate-delay-3">
          <h2>What Makes Coit's Special</h2>
          <div className="values-grid">
            <div className="value-item">
              <h3>Family Tradition</h3>
              <p>Four generations of Coits have kept the business alive, from Don's original stand to today's food truck.</p>
            </div>
            <div className="value-item">
              <h3>Authentic Recipes</h3>
              <p>We still use the same secret-recipe draft root beer and classic hot dog recipes that made us famous.</p>
            </div>
            <div className="value-item">
              <h3>Community Connection</h3>
              <p>For over 70 years, we've been part of Oklahoma's story, serving generations of families.</p>
            </div>
            <div className="value-item">
              <h3>Quality Ingredients</h3>
              <p>Pure cane sugar in our root beer, Schwab's red-cased franks, and the very best ice – just like always.</p>
            </div>
          </div>
        </section>

        <section className="contact-section animate-in animate-delay-4">
          <h2>Connect With Us</h2>
          <div className="contact-info">
            <div className="contact-item">
              <h3>Email</h3>
              <a href="mailto:coitsFTE@gmail.com">coitsFTE@gmail.com</a>
            </div>
            <div className="contact-item">
              <h3>Facebook Messenger</h3>
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
              <h3>Follow Us</h3>
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