import React from 'react';
import './Menu.css';

const Menu = () => {
    return (
        <div className="menu-container animate-in">
            <div className="menu-header animate-in animate-delay-1">
                <h1>Coit's Food Truck</h1>
            </div>

            <div className="menu-sections-grid">
                <div className="menu-column menu-column--left">
                    <section className="menu-section animate-in animate-delay-2">
                        <div className="menu-item-header">
                            <h2>Hot Dogs</h2>
                            <span className="price">$5.00</span>
                        </div>
                        <div className="hotdogs-content">
                            <div className="hotdogs-list-wrap">
                                <ul className="menu-items">
                                    <li>No. 1 - Mustard, Chili & Onions</li>
                                    <li>No. 2 - Mustard & Chili</li>
                                    <li>No. 3 - Mustard</li>
                                    <li>No. 4 - Plain</li> 
                                    <li>No. 5 - Chili Only</li>
                                    <li>No. 6 - Mustard & Onions</li>
                                    <li>No. 7 - Chili & Onions</li>
                                </ul>
                                <p className="add-ons">
                                    Add-ons:
                                    <span className="toppings"> Cheese • Relish • Ketchup • Jalapeños • Sour Cream (no extra charge)</span>
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="menu-section animate-in animate-delay-3">
                        <div className="menu-item-header">
                            <h2>Frito Chili Pie</h2>
                            <span className="price">$5.00</span>
                        </div>
                        <p className="add-ons">
                            Add-ons:
                            <span className="toppings"> Cheese • Relish • Ketchup • Mustard • Jalapeños • Sour Cream • Onions (no extra charge)</span>
                        </p>
                    </section>
                </div>

                <div className="menu-column menu-column--right">
                    <section className="menu-section animate-in animate-delay-4">
                        <div className="menu-item-header">
                            <h2>Coit's Root Beer</h2>
                        </div>
                        <div className="beverages-content">
                            <ul className="menu-items menu-items--beverages">
                                <li>20 oz <span className="price">$3.00</span></li>
                                <li>32 oz <span className="price">$4.00</span></li>
                                <li>Root Beer Float <span className="price">$6.00</span></li>
                                <li>Gallon <span className="price">$9.00</span></li>
                            </ul>
                        </div>
                    </section>

                    <section className="menu-section animate-in animate-delay-5">
                        <div className="menu-item-header">
                            <h2>Other</h2>
                        </div>
                        <div className="beverages-content">
                            <ul className="menu-items menu-items--beverages">
                                <li>Dr. Pepper or Diet Coke — 20 oz <span className="price">$3.00</span></li>
                                <li>Dr. Pepper or Diet Coke — 32 oz <span className="price">$4.00</span></li>
                                <li>Lays Chips <span className="price">$1.00</span></li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Menu; 