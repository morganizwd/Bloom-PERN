import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppBar, Toolbar, Button, Container } from '@mui/material';
import { toast } from 'react-toastify';

const NavigationBar = () => {
    const { authData, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    console.log('NavigationBar: authData.role is', authData.role, 'isAuthenticated:', authData.isAuthenticated);

    const handleLogout = () => {
        logout();
        toast.success('Вы успешно вышли из системы.');
        navigate('/');
    };

    return (
        <AppBar position="static">
            <Container maxWidth="lg">
                <Toolbar>
                    <Button component={Link} to="/" color="inherit" sx={{ flexGrow: 1, textTransform: 'none' }}>
                        <strong>Магазины Цветов</strong>
                    </Button>

                    {authData.isAuthenticated && authData.role === 'user' && (
                        <>
                            <Button component={Link} to="/orders" color="inherit" sx={{ marginRight: 2 }}>
                                Мои заказы
                            </Button>
                            <Button component={Link} to="/cart" color="inherit" sx={{ marginRight: 2 }}>
                                Корзина
                            </Button>
                            <Button component={Link} to="/profile" color="inherit" sx={{ marginRight: 2 }}>
                                Профиль
                            </Button>
                        </>
                    )}
                    {authData.isAuthenticated && authData.role === 'metizshop' && (
                        <Button component={Link} to="/metizshop-admin" color="inherit" sx={{ marginRight: 2 }}>
                            Админка магазина цветов
                        </Button>
                    )}

                    {!authData.isAuthenticated && (
                        <>
                            <Button component={Link} to="/register" color="inherit" sx={{ marginRight: 2 }}>
                                Регистрация
                            </Button>
                            <Button component={Link} to="/login" color="inherit" sx={{ marginRight: 2 }}>
                                Вход
                            </Button>
                        </>
                    )}

                    {authData.isAuthenticated && (
                        <Button
                            color="inherit"
                            onClick={handleLogout}
                            sx={{
                                borderColor: 'white',
                                borderWidth: 1,
                                borderStyle: 'solid',
                                borderRadius: '4px',
                                textTransform: 'none',
                            }}
                        >
                            Выход
                        </Button>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default NavigationBar;