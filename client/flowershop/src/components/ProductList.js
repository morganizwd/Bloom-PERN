import React, { useState, useContext } from 'react';
import axios from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, Box, Button, List, ListItem, CircularProgress, IconButton, Divider, Card, CardContent, CardMedia } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { toast } from 'react-toastify'; 

function ProductList() {
    const { authData } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`/api/products/metizshop/${authData.user.id}`);
            setProducts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Ошибка при получении списка товаров:', error);
            setError('Не удалось загрузить список товаров.');
            setLoading(false);
            toast.error('Не удалось загрузить список товаров.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
            try {
                await axios.delete(`/api/products/${id}`);
                setProducts(products.filter((product) => product.id !== id));
                toast.success('Товар успешно удалён!');
            } catch (error) {
                console.error('Ошибка при удалении товара:', error);
                toast.error('Не удалось удалить товар.');
            }
        }
    };

    return (
        <Container sx={{ padding: '20px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Управление товарами</Typography>
                <Button
                    component={Link}
                    to="/metizshop-admin/products/add"
                    variant="contained"
                    color="primary"
                    startIcon={<AddCircleIcon />}
                >
                    Добавить новый товар
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                    <Typography variant="h6" sx={{ marginRight: '10px' }}>
                        Загрузка товаров...
                    </Typography>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            ) : (
                <List>
                    {products.map((product) => (
                        <React.Fragment key={product.id}>
                            <ListItem alignItems="flex-start" sx={{ padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' }}>
                                <Card sx={{ display: 'flex', width: '100%' }}>
                                    {product.photo && (
                                        <CardMedia
                                            component="img"
                                            sx={{ width: 150 }}
                                            image={`http://localhost:5000${product.photo}`}
                                            alt={product.name}
                                        />
                                    )}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <CardContent>
                                            <Typography component="div" variant="h5">
                                                {product.name}
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                {product.description}
                                            </Typography>
                                            <Typography variant="body2" color="text.primary" mt={1}>
                                                Цена: {product.price} ₽
                                            </Typography>
                                        </CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 1 }}>
                                            <IconButton component={Link} to={`/metizshop-admin/products/edit/${product.id}`} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(product.id)} color="secondary">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Card>
                            </ListItem>
                            <Divider component="li" />
                        </React.Fragment>
                    ))}
                </List>
            )}
        </Container>
    );
}

export default ProductList;