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
                    <h2>Sides</h2>
                </div>
                <div className="menu-item">
                    <span className="item-name">Frito Chili Pie - Chili & Cheese</span>
                    <div className="item-prices">
                        <div>$5.00</div>
                    </div>
                    <p className="add-ons">
                        Add (No Extra Charge):
                        <span className="toppings">Cheese • Relish • Ketchup • Jalapeño Peppers • Sour Cream</span>
                    </p>
                </div>
                <div className="menu-item">
                    <span className="item-name">Lays Chips - Plain or Barbecue</span>
                    <div className="item-prices">
                        <div>$1.00</div>
                    </div>
                </div>
            </section>

            <section className="menu-section animate-in animate-delay-4">
                <div className="menu-item-header">
                    <h2>Beverages</h2>
                </div>

                <div className="menu-item">
                    <span className="item-name">Coit's Root Beer</span>
                    <div className="item-prices">
                        <div>20 oz - $3.00</div>
                        <div>32 oz - $4.00</div>
                        <div>Gallon - $9.00</div>
                    </div>
                </div>

                <div className="menu-item">
                    <span className="item-name">Root Beer Float (20 oz Only)</span>
                    <div className="item-prices">
                        <div>20 oz - $6.00</div>
                    </div>
                </div>

                <div className="menu-item">
                    <span className="item-name">Other Soft Drinks (Dr Pepper, Diet Coke)</span>
                    <div className="item-prices">
                        <div>20 oz - $3.00</div>
                        <div>32 oz - $4.00</div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Menu; 