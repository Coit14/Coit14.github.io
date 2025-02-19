import React, { createContext, useContext, useState, useEffect } from 'react';
import { printifyService } from '../services/printifyService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Debug log when products change
    useEffect(() => {
        console.log('CartContext products updated:', products);
    }, [products]);

    // Preload products immediately when app starts
    useEffect(() => {
        const preloadProducts = async () => {
            try {
                setIsLoading(true);
                console.log('Preloading products...');
                const fetchedProducts = await printifyService.getPublishedProducts();
                console.log('Preloaded products:', fetchedProducts);
                setProducts(fetchedProducts);
            } catch (error) {
                console.error('Error preloading products:', error);
            } finally {
                setIsLoading(false);
            }
        };
        preloadProducts();
    }, []);

    const addToCart = (product, variant, quantity = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(
                item => item.variantId === variant.id
            );

            if (existingItem) {
                return prevItems.map(item =>
                    item.variantId === variant.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [...prevItems, {
                id: product.id,
                variantId: variant.id,
                title: product.title,
                variantTitle: variant.title,
                price: variant.price,
                image: product.images[0]?.src,
                quantity
            }];
        });
    };

    const removeFromCart = (variantId) => {
        setCartItems(prevItems => 
            prevItems.filter(item => item.variantId !== variantId)
        );
    };

    const updateQuantity = (variantId, quantity) => {
        if (quantity < 1) return;
        
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.variantId === variantId
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