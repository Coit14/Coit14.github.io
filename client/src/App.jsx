import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './components/Pages/Home';
import Menu from './components/Pages/Menu';
import Shop from './components/Shop/Shop';
import Cart from './components/Cart/Cart';
import AboutUs from './components/Pages/AboutUs';
import EventBooking from './components/Pages/EventBooking';
import { CartProvider } from './contexts/CartContext';
import PrintifyTest from './components/PrintifyTest';
import Checkout from './components/Checkout/Checkout';
import './App.css';
import './styles/layout.css';
import './index.css';
import ScrollToTop from './components/utils/ScrollToTop';

function App() {
    return (
        <CartProvider>
            <Router basename="/coits-food-truck">
                <ScrollToTop />
                <div className="page-container">
                    <div className="print-header">
                        <Header />
                    </div>
                    <Cart />
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<AboutUs />} />
                            <Route path="/menu" element={<Menu />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/book-event" element={<EventBooking />} />
                            <Route path="/printify-test" element={<PrintifyTest />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </CartProvider>
    );
}

export default App;