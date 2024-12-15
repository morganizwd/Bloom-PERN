// src/components/FlowerShopDetails.js

import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosConfig';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    TextField,
    CircularProgress,
    Box,
    Divider,
    Alert,
} from '@mui/material';

function FlowerShopDetails() {
    const { id } = useParams();
    const { cartItems, addToCart, clearCart } = useContext(CartContext);
    const { authData } = useContext(AuthContext);
    const [flowerShop, setFlowerShop] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFlowerShop();
        fetchReviews();
    }, [id]);

    const fetchFlowerShop = async () => {
        try {
            const response = await axios.get(`/api/flowershops/${id}`);
            setFlowerShop(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Ошибка при получении информации о магазине цветов:', error);
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`/api/reviews/flowershop/${id}`);
            setReviews(response.data);
        } catch (error) {
            console.error('Ошибка при получении отзывов:', error);
        }
    };

    const handleQuantityChange = (productId, value) => {
        const qty = parseInt(value, 10);
        if (qty >= 1) {
            setQuantities((prev) => ({ ...prev, [productId]: qty }));
        }
    };

    const handleAddToCart = async (product) => {
        const quantity = quantities[product.id] || 1;
        try {
            await addToCart(product, quantity);
        } catch (err) {
            setError(err.message);
        }
    };

    const calculateAverageRating = () => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (total / reviews.length).toFixed(1);
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) {
                stars.push(<FaStar key={i} color="#FFD700" />);
            } else if (rating >= i - 0.5) {
                stars.push(<FaStarHalfAlt key={i} color="#FFD700" />);
            } else {
                stars.push(<FaRegStar key={i} color="#ccc" />);
            }
        }
        return stars;
    };

    const isDifferentFlowerShop = cartItems.length > 0 && cartItems[0].Product.flowerShopId !== parseInt(id, 10);

    return (
        <Container sx={{ padding: '20px' }}>
            {loading ? (
                <Box sx={{ textAlign: 'center', marginTop: '50px' }}>
                    <CircularProgress />
                    <Typography variant="h6" sx={{ marginTop: '20px' }}>
                        Загрузка информации о магазине цветов...
                    </Typography>
                </Box>
            ) : flowerShop ? (
                <Box>
                    <Typography variant="h3" component="h1" gutterBottom>
                        {flowerShop.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <Typography variant="h6" sx={{ marginRight: '8px' }}>
                            Рейтинг:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {renderStars(calculateAverageRating())}
                            <Typography variant="h6" sx={{ marginLeft: '8px' }}>
                                {calculateAverageRating()} / 5
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ marginLeft: '8px', color: '#555' }}>
                            ({reviews.length} отзывов)
                        </Typography>
                    </Box>

                    {flowerShop.photo && (
                        <CardMedia
                            component="img"
                            image={`http://localhost:5000${flowerShop.photo}`}
                            alt={flowerShop.name}
                            sx={{ width: '300px', height: 'auto', marginBottom: '20px' }}
                        />
                    )}
                    <Typography variant="body1" paragraph>
                        {flowerShop.description}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Адрес: {flowerShop.address}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Телефон: {flowerShop.phone}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Контактное лицо: {flowerShop.contact_person_name}
                    </Typography>

                    <Typography variant="h4" component="h2" gutterBottom>
                        Товары
                    </Typography>

                    {isDifferentFlowerShop && (
                        <Box sx={{
                            marginBottom: '10px',
                            padding: '10px',
                            border: '1px solid #f44336',
                            borderRadius: '4px',
                            backgroundColor: '#ffebee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Typography variant="body1" color="error">
                                В корзине уже есть товары из другого магазина цветов. Пожалуйста, очистите корзину перед добавлением новых товаров.
                            </Typography>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => {
                                    clearCart();
                                }}
                            >
                                Очистить корзину
                            </Button>
                        </Box>
                    )}

                    {flowerShop.Products && flowerShop.Products.length > 0 ? (
                        <Grid container spacing={4}>
                            {flowerShop.Products.map((product) => (
                                <Grid item xs={12} sm={6} md={4} key={product.id}>
                                    <Card>
                                        {product.photo && (
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={`http://localhost:5000${product.photo}`}
                                                alt={product.name}
                                            />
                                        )}
                                        <CardContent>
                                            <Typography variant="h5" component="h3">
                                                {product.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {product.description}
                                            </Typography>
                                            <Typography variant="body1" color="text.primary" paragraph>
                                                Цена: {product.price} ₽
                                            </Typography>
                                            {authData.isAuthenticated && (
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <TextField
                                                        label="Количество"
                                                        type="number"
                                                        inputProps={{ min: 1 }}
                                                        value={quantities[product.id] || 1}
                                                        onChange={(e) =>
                                                            handleQuantityChange(product.id, e.target.value)
                                                        }
                                                        sx={{ width: '80px', marginRight: '10px' }}
                                                    />
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => handleAddToCart(product)}
                                                        disabled={isDifferentFlowerShop}
                                                    >
                                                        Добавить в корзину
                                                    </Button>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography variant="body1">Товары не найдены.</Typography>
                    )}

                    <Typography
                        variant="h4"
                        component="h2"
                        gutterBottom
                        sx={{ marginTop: '20px' }}
                    >
                        Отзывы
                    </Typography>
                    {reviews.length > 0 ? (
                        <Box>
                            {reviews.map((review) => (
                                <Box key={review.id} sx={{ marginBottom: '20px' }}>
                                    <Divider sx={{ marginBottom: '10px' }} />
                                    <Typography variant="body1" fontWeight="bold">
                                        {review.User.name} {review.User.surname} оценил(а) на {review.rating} звезд
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        <em>{review.short_review}</em>
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        {review.description}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        {new Date(review.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body1">Нет отзывов.</Typography>
                    )}
                </Box>
            ) : (
                <Typography variant="body1">Магазин цветов не найден.</Typography>
            )}

            {error && (
                <Alert severity="error" sx={{ marginTop: '20px' }}>
                    {error}
                </Alert>
            )}
        </Container>
    );

}

export default FlowerShopDetails;