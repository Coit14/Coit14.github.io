import React, { createContext, useContext, useState, useEffect } from 'react';
import * as printService from '../services/printfulService';
import { FEATURES } from '../config/features';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Preload products only when merch/shop is enabled
    useEffect(() => {
        if (!FEATURES.MERCH) return;
        let cancelled = false;
        const preloadProducts = async () => {
            try {
                setIsLoading(true);
                const fetchedProducts = await printService.getPublishedProducts();
                if (!cancelled) setProducts(fetchedProducts || []);
            } catch (error) {
                if (!cancelled) console.error('Error preloading products:', error);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        preloadProducts();
        return () => { cancelled = true; };
    }, []);

    const addToCart = (item) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(
                cartItem => cartItem.productId === item.productId && 
                           cartItem.variantId === item.variantId
            );

            if (existingItem) {
                return prevItems.map(cartItem =>
                    cartItem.productId === item.productId && 
                    cartItem.variantId === item.variantId
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }

            return [...prevItems, {
                ...item,
                quantity: 1
            }];
        });
    };

    const removeFromCart = (productId, variantId) => {
        setCartItems(prevItems => 
            prevItems.filter(item => 
                !(item.productId === productId && item.variantId === variantId)
            )
        );
    };

    const updateQuantity = (productId, variantId, quantity) => {
        if (quantity < 1) return;
        
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.productId === productId && item.variantId === variantId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => 
            total + (item.price * item.quantity), 0
        );
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            isCartOpen,
            setIsCartOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount,
            products,
            setProducts,
            isLoading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 