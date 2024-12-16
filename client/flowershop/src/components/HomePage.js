// src/components/HomePage.js

import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axiosConfig';
import { Link } from 'react-router-dom';
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
    Rating,
    InputAdornment,
    Pagination,
    Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';
import { toast } from 'react-toastify';

function HomePage() {
    const [metizShops, setMetizShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchName, setSearchName] = useState('');
    const [searchAddress, setSearchAddress] = useState('');
    const [ratingFilter, setRatingFilter] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 9;
    const [error, setError] = useState(null);

    // Дебаунс для оптимизации запросов
    const debouncedFetchMetizShops = useCallback(
        debounce(() => {
            fetchMetizShops();
        }, 500),
        [searchName, searchAddress, ratingFilter, currentPage]
    );

    useEffect(() => {
        debouncedFetchMetizShops();

        return debouncedFetchMetizShops.cancel;
    }, [searchName, searchAddress, ratingFilter, currentPage, debouncedFetchMetizShops]);

    const fetchMetizShops = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                limit: itemsPerPage,
                offset: (currentPage - 1) * itemsPerPage,
            };
            if (searchName.trim()) params.name = searchName.trim();
            if (searchAddress.trim()) params.address = searchAddress.trim();
            if (ratingFilter > 0) params.averageRating = ratingFilter;

            const response = await axios.get('/api/metizshops', { params });
            console.log('API Response:', response.data); // Для отладки

            setMetizShops(response.data.metizshops || response.data.metizShops || []);
            setTotalPages(Math.ceil((response.data.total || 1) / itemsPerPage));
            setLoading(false);
        } catch (error) {
            console.error('Ошибка при получении списка магазинов цветов:', error);
            setLoading(false);
            setError('Не удалось загрузить список магазинов цветов. Пожалуйста, попробуйте позже.');
            toast.error('Не удалось загрузить список магазинов цветов.');
        }
    };

    const handleResetFilters = () => {
        setSearchName('');
        setSearchAddress('');
        setRatingFilter(0);
        setCurrentPage(1);
        fetchMetizShops();
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    return (
        <Container maxWidth="lg" sx={{ paddingTop: '40px', paddingBottom: '40px' }}>
            <Typography variant="h3" align="center" gutterBottom>
                Наши Магазины Цветов
            </Typography>

            <Box sx={{ marginBottom: '30px' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Поиск по названию"
                            variant="outlined"
                            fullWidth
                            value={searchName}
                            onChange={(e) => {
                                setSearchName(e.target.value);
                                setCurrentPage(1);
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Поиск по адресу"
                            variant="outlined"
                            fullWidth
                            value={searchAddress}
                            onChange={(e) => {
                                setSearchAddress(e.target.value);
                                setCurrentPage(1);
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Typography gutterBottom>Фильтр по рейтингу</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating
                                name="rating-filter"
                                value={ratingFilter}
                                onChange={(event, newValue) => {
                                    setRatingFilter(newValue);
                                    setCurrentPage(1);
                                }}
                            />
                            <Typography variant="body2" sx={{ marginLeft: '10px' }}>
                                {ratingFilter > 0 ? `${ratingFilter} звёзд и выше` : 'Все рейтинги'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                <Box sx={{ marginTop: '20px', textAlign: 'right' }}>
                    {/* Кнопка "Сбросить" */}
                    <Button
                        variant="text"
                        color="secondary"
                        onClick={handleResetFilters}
                        sx={{ marginLeft: '10px' }}
                    >
                        Сбросить
                    </Button>
                </Box>
            </Box>

            {error && (
                <Box sx={{ marginBottom: '20px' }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            )}

            {loading ? (
                <Grid container justifyContent="center" alignItems="center" sx={{ height: '60vh' }}>
                    <CircularProgress />
                </Grid>
            ) : (
                <Grid container spacing={4}>
                    {metizShops.length > 0 ? (
                        metizShops.map((metizShop) => (
                            <Grid item xs={12} sm={6} md={4} key={metizShop.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: 3,
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                        },
                                    }}
                                >
                                    {metizShop.photo ? (
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={`http://localhost:5000${metizShop.photo}`}
                                            alt={metizShop.name}
                                        />
                                    ) : (
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image="https://via.placeholder.com/400x200.png?text=No+Image"
                                            alt="No Image"
                                        />
                                    )}
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h5" component="div">
                                            {metizShop.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {metizShop.description}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Адрес: {metizShop.address}
                                        </Typography>
                                        {/* Отображение рейтинга */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                                            <Rating
                                                name={`rating-${metizShop.id}`}
                                                value={parseFloat(metizShop.averageRating)}
                                                precision={0.1}
                                                readOnly
                                            />
                                            <Typography variant="body2" color="text.secondary" sx={{ marginLeft: '8px' }}>
                                                {parseFloat(metizShop.averageRating).toFixed(1)} / 5 ({metizShop.reviewCount} отзывов)
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <Box sx={{ padding: '16px', textAlign: 'center' }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            component={Link}
                                            to={`/metizshops/${metizShop.id}`}
                                        >
                                            Подробнее
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography variant="h6" align="center">
                                Магазины цветов не найдены.
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            )}

            {metizShops.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            )}
        </Container>
    );

}

export default HomePage;
