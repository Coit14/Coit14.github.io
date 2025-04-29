import React from 'react';
import './Menu.css';
import schwabsLogo from '../../assets/schwabs-logo.png';

const Menu = () => {
    return (
        <div className="menu-container animate-in">
            <div className="menu-header animate-in animate-delay-1">
                <h1>Coit's Truck Menu</h1>
                <p className="menu-note">Our Classic Menu Since 1954</p>
            </div>
            
            <section className="menu-section animate-in animate-delay-2">
                <div className="menu-item-header">
                    <h2>Hot Dogs</h2>
                    <span className="price">$5.00</span>
                </div>
                <div className="hotdogs-content">
                    <ul className="menu-items">
                        <li>No. 1 - Mustard, Chili & Onions</li>
                        <li>No. 2 - Mustard & Chili</li>
                        <li>No. 3 - Mustard</li>
                        <li>No. 4 - Plain</li> 
                        <li>No. 5 - Chili Only</li>
                        <li>No. 6 - Mustard & Onions</li>
                        <li>No. 7 - Chili & Onions</li>
                    </ul>
                    <div className="schwabs-logo-wrapper">
                        <img src={schwabsLogo} alt="Schwab's Finest Logo" className="schwabs-logo" />
                    </div>
                </div>
            </section>

            <section className="menu-section animate-in animate-delay-3">
                <div className="menu-item-header">
                    <h2>Frito Chili Pie</h2>
                    <span className="price">$5.00</span>
                </div>
                <p className="item-description">Chili & Cheese</p>
                <p className="add-ons">
                    Add (No Extra Charge):
                    <span className="toppings">Cheese • Relish • Ketchup • Jalapeño Peppers • Sour Cream</span>
                </p>
            </section>

            <section className="menu-section animate-in animate-delay-4">
                <h2>Beverages</h2>
                <div className="beverages">
                    <div className="beverage-items">
                        <p>• Coit's Root Beer</p>
                        <p>• Other Soft Drinks (Dr. Pepper, Diet Coke)</p>
                    </div>
                    <div className="beverage-prices">
                        <p>20 oz - $3.00</p>
                        <p>32 oz - $4.00</p>
                        <p>Gallon - $9.00</p>
                    </div>
                </div>
            </section>

            <section className="menu-section animate-in animate-delay-5">
                <h2>Snacks</h2>
                <div className="menu-item">
                    <span>Lays Chips - Plain or Barbecue</span>
                    <span className="price">$1.00</span>
                </div>
            </section>

            <section className="menu-section animate-in animate-delay-6">
                <h2>Root Beer Floats</h2>
                <div className="menu-item">
                    <span>Our Original Handmade Float - 20 oz</span>
                    <span className="price">$6.00</span>
                </div>
            </section>
        </div>
    );
};

export default Menu; 