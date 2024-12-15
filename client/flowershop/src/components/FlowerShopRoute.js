import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const FlowerShopRoute = ({ children }) => {
    const { authData } = useContext(AuthContext);

    console.log('FlowerShopRoute: role is', authData.role, 'isAuthenticated:', authData.isAuthenticated);

    if (!authData.isAuthenticated) {
        toast.error('Для доступа к этому разделу необходимо войти в систему.');
        return <Navigate to="/login" />;
    }

    if (authData.role !== 'flowershop') {
        toast.error('У вас нет доступа к этому разделу.');
        return <Navigate to="/" />;
    }

    return children;
};

export default FlowerShopRoute;