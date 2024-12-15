// src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Ensure BrowserRouter is handled in index.js or a higher-level component
import Registration from './components/Registration';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import FlowerShopDetails from './components/FlowerShopDetails';
import FlowerShopAdmin from './components/FlowerShopAdmin';
import FlowerShopOrders from './components/FlowerShopOrders';
import PrivateRoute from './components/PrivateRoute';
import FlowerShopRoute from './components/FlowerShopRoute';
import EditFlowerShopInfo from './components/EditFlowerShopInfo';
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
          <Route path="/flowershops/:id" element={<FlowerShopDetails />} />
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
            path="/flowershop-admin"
            element={
              <FlowerShopRoute>
                <FlowerShopAdmin />
              </FlowerShopRoute>
            }
          />
          <Route
            path="/flowershop-admin/edit"
            element={
              <FlowerShopRoute>
                <EditFlowerShopInfo />
              </FlowerShopRoute>
            }
          />
          <Route
            path="/flowershop-admin/products"
            element={
              <FlowerShopRoute>
                <ProductList />
              </FlowerShopRoute>
            }
          />
          <Route
            path="/flowershop-admin/products/add"
            element={
              <FlowerShopRoute>
                <AddProduct />
              </FlowerShopRoute>
            }
          />
          <Route
            path="/flowershop-admin/products/edit/:id"
            element={
              <FlowerShopRoute>
                <EditProduct />
              </FlowerShopRoute>
            }
          />
          <Route
            path="/flowershop-admin/orders"
            element={
              <FlowerShopRoute>
                <FlowerShopOrders />
              </FlowerShopRoute>
            }
          />
        </Routes>
      </Container>
      <ToastContainer />
    </>
  );
}

export default App;