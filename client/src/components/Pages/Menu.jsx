import React from 'react';
import './Menu.css';
import schwabsLogo from '../../assets/schwabs-logo.png';

const Menu = () => {
    return (
        <div className="menu-container animate-in">
            <div className="menu-header animate-in animate-delay-1">
                <h1>Coit's Truck Menu</h1>
                <p className="menu-note">A Coit's Tradition Since 1954</p>
            </div>
            
            <section className="menu-section animate-in animate-delay-2">
                <div className="menu-item-header">
                    <h2>Hot Dogs</h2>
                    <span className="price">$5.00</span>
                </div>
                <div className="hotdogs-content refined-hotdogs">
                    <ul className="menu-items">
                        <li>No. 1 - Mustard, Chili & Onions</li>
                        <li>No. 2 - Mustard & Chili</li>
                        <li>No. 3 - Mustard</li>
                        <li>No. 4 - Plain</li> 
                        <li>No. 5 - Chili Only</li>
                        <li>No. 6 - Mustard & Onions</li>
                        <li>No. 7 - Chili & Onions</li>
                    </ul>
                    <div className="schwabs-logo-wrapper refined-logo">
                        <img src={schwabsLogo} alt="Schwab's Finest Logo" className="schwabs-logo refined-logo-img" />
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
                    <span className="toppings"> Cheese • Relish • Ketchup • Jalapeño Peppers • Sour Cream</span>
                </p>
            </section>

            <section className="menu-section animate-in animate-delay-4">
                <div className="menu-item-header">
                    <h2>Beverages</h2>
                </div>
                <div className="beverages-list">
                    <div className="beverage-block">
                        <div className="beverage-name">Coit's Root Beer</div>
                        <ul className="beverage-sizes">
                            <li>20 oz <span className="price">$3.00</span></li>
                            <li>32 oz <span className="price">$4.00</span></li>
                            <li>Gallon <span className="price">$9.00</span></li>
                        </ul>
                    </div>
                    <div className="beverage-block float-block">
                        <div className="beverage-name">Root Beer Float</div>
                        <ul className="beverage-sizes">
                            <li>Our Original Handmade Float <span className="price">$6.00</span></li>
                        </ul>
                    </div>
                    <div className="beverage-block">
                        <div className="beverage-name">Dr. Pepper or Diet Coke</div>
                        <ul className="beverage-sizes">
                            <li>20 oz <span className="price">$3.00</span></li>
                            <li>32 oz <span className="price">$4.00</span></li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Menu; 