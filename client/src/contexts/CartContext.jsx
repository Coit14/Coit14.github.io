import React, { createContext, useContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [products, setProducts] = useState([]);

    // Preload products when the app starts
    useEffect(() => {
        const preloadProducts = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/products/all');
                const data = await response.json();
                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error preloading products:', error);
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
        }}>
            {children}
        </CartContext.Provider>
    );
}; 