// src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Ensure BrowserRouter is handled in index.js or a higher-level component
import Registration from './components/Registration';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import MetizShopDetails from './components/MetizShopDetails';
import MetizShopAdmin from './components/MetizShopAdmin';
import MetizShopOrders from './components/MetizShopOrders';
import PrivateRoute from './components/PrivateRoute';
import MetizShopRoute from './components/MetizShopRoute';
import EditMetizShopInfo from './components/EditMetizShopInfo';
import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import Cart from './components/Cart';
import Orders from './components/Orders';
import Profile from './components/Profile';
import { Container } from '@mui/material';
import NavigationBar from './components/NavigationBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <NavigationBar />
      <Container maxWidth="lg" sx={{ paddingY: 4 }}>
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/metizrshops/:id" element={<MetizShopDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/metizrshops-admin"
            element={
              <MetizShopRoute>
                <MetizShopAdmin />
              </MetizShopRoute>
            }
          />
          <Route
            path="/metizrshops-admin/edit"
            element={
              <MetizShopRoute>
                <EditMetizShopInfo />
              </MetizShopRoute>
            }
          />
          <Route
            path="/metizrshops-admin/products"
            element={
              <MetizShopRoute>
                <ProductList />
              </MetizShopRoute>
            }
          />
          <Route
            path="/metizrshops-admin/products/add"
            element={
              <MetizShopRoute>
                <AddProduct />
              </MetizShopRoute>
            }
          />
          <Route
            path="/metizrshops-admin/products/edit/:id"
            element={
              <MetizShopRoute>
                <EditProduct />
              </MetizShopRoute>
            }
          />
          <Route
            path="/metizrshops-admin/orders"
            element={
              <MetizShopRoute>
                <MetizShopOrders />
              </MetizShopRoute>
            }
          />
        </Routes>
      </Container>
      <ToastContainer />
    </>
  );
}

export default App;