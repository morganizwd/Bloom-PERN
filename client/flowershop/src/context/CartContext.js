import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axiosConfig';
import { AuthContext } from './AuthContext';
import { Snackbar, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { authData } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        if (authData.isAuthenticated) {
            fetchCart();
        } else {
            setCartItems([]);
        }
    }, [authData.isAuthenticated, authData.token]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/baskets', {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            console.log('Полученные BasketItems:', response.data.BasketItems);
            setCartItems(response.data.BasketItems || []);
        } catch (error) {
            console.error('Ошибка при получении корзины:', error);
            setError('Не удалось загрузить корзину.');
            handleSnackbarOpen('Не удалось загрузить корзину.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSnackbarOpen = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const addToCart = async (product, quantity) => {
        if (cartItems.length > 0 && cartItems[0].Product.flowershopId !== product.flowershopId) {
            setError('Вы можете добавлять товары только из одного магазина цветов.');
            handleSnackbarOpen('Вы можете добавлять товары только из одного магазина цветов.', 'error');
            return;
        }

        try {
            const response = await axios.post(
                '/api/baskets/add',
                { productId: product.id, quantity },
                {
                    headers: {
                        Authorization: `Bearer ${authData.token}`,
                    },
                }
            );
            const addedItem = response.data;
            setCartItems((prevItems) => {
                const existingItem = prevItems.find(item => item.productId === addedItem.productId);
                if (existingItem) {
                    return prevItems.map(item =>
                        item.productId === addedItem.productId
                            ? { ...item, quantity: item.quantity + addedItem.quantity }
                            : item
                    );
                } else {
                    return [...prevItems, addedItem];
                }
            });
            handleSnackbarOpen(`Добавлено ${quantity} x ${product.name} в корзину!`, 'success');
        } catch (error) {
            console.error('Ошибка при добавлении товара в корзину:', error);
            const errorMessage = error.response?.data?.message || 'Не удалось добавить товар в корзину.';
            setError(errorMessage);
            handleSnackbarOpen(errorMessage, 'error');
        }
    };

    const removeFromCart = async (productId) => {
        try {
            await axios.delete(`/api/baskets/remove/${productId}`, {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            setCartItems((prevItems) => prevItems.filter(item => item.productId !== productId));
            handleSnackbarOpen('Товар успешно удален из корзины.', 'success');
        } catch (error) {
            console.error('Ошибка при удалении товара из корзины:', error);
            const errorMessage = error.response?.data?.message || 'Не удалось удалить товар из корзины.';
            setError(errorMessage);
            handleSnackbarOpen(errorMessage, 'error');
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            const response = await axios.put(`/api/baskets/update/${productId}`, { quantity }, {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            const updatedItem = response.data;
            setCartItems((prevItems) =>
                prevItems.map(item =>
                    item.productId === updatedItem.productId
                        ? { ...item, quantity: updatedItem.quantity }
                        : item
                )
            );
            handleSnackbarOpen('Количество товара обновлено.', 'success');
        } catch (error) {
            console.error('Ошибка при обновлении количества товара в корзине:', error);
            const errorMessage = error.response?.data?.message || 'Не удалось обновить количество товара в корзине.';
            setError(errorMessage);
            handleSnackbarOpen(errorMessage, 'error');
        }
    };

    const clearCart = async () => {
        try {
            await axios.delete('/api/baskets/clear', {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            setCartItems([]);
            handleSnackbarOpen('Корзина успешно очищена.', 'success');
        } catch (error) {
            console.error('Ошибка при очистке корзины:', error);
            const errorMessage = error.response?.data?.message || 'Не удалось очистить корзину.';
            setError(errorMessage);
            handleSnackbarOpen(errorMessage, 'error');
        }
    };

    const totalAmount = cartItems.reduce((acc, item) => {
        if (item.Product && item.Product.price) {
            return acc + item.Product.price * item.quantity;
        }
        return acc;
    }, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalAmount,
            loading,
            error,
            fetchCart,
        }}>
            {children}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </CartContext.Provider>
    );
};

CartProvider.propTypes = {
    children: PropTypes.node.isRequired,
};