import React, { useState, useEffect, useContext } from 'react';
import axios from '../api/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, TextField, Button, Box, InputLabel, CardMedia, Alert } from '@mui/material';

function EditProduct() {
    const { id } = useParams();
    const { authData } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
    });
    const [photo, setPhoto] = useState(null);
    const [currentPhoto, setCurrentPhoto] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`/api/products/${id}`);
            setFormData({
                name: response.data.name,
                description: response.data.description,
                price: response.data.price,
            });
            setCurrentPhoto(response.data.photo);
        } catch (error) {
            console.error('Ошибка при получении информации о товаре:', error);
            setError('Не удалось загрузить информацию о товаре.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);

        if (photo) {
            data.append('photo', photo);
        }

        try {
            const response = await axios.put(`/api/products/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authData.token}`, // Ensure the token is sent if required
                },
            });
            setSuccess('Товар успешно обновлен!');
            setError(null);
            // Обновляем текущую фотографию, если она была изменена
            if (response.data.photo) {
                setCurrentPhoto(response.data.photo);
            }
            // Navigate after a short delay to allow users to see the success message
            setTimeout(() => {
                navigate('/metizshop-admin/products'); // Updated navigation path
            }, 1500);
        } catch (error) {
            console.error('Ошибка при обновлении товара:', error);
            setError('Ошибка при обновлении товара.');
            setSuccess(null);
        }
    };

    return (
        <Container sx={{ padding: '20px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Редактировать товар
            </Typography>
            {error && (
                <Alert severity="error" sx={{ marginBottom: '20px' }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ marginBottom: '20px' }}>
                    {success}
                </Alert>
            )}
            {currentPhoto && (
                <Box sx={{ marginBottom: '20px' }}>
                    <Typography variant="body1">Текущая фотография:</Typography>
                    <CardMedia
                        component="img"
                        image={`http://localhost:5000${currentPhoto}`}
                        alt={formData.name}
                        sx={{ width: '200px', height: 'auto', marginTop: '10px' }}
                    />
                </Box>
            )}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <TextField
                    label="Название"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                />
                <TextField
                    label="Описание"
                    name="description"
                    required
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                />
                <TextField
                    label="Цена"
                    name="price"
                    type="number"
                    required
                    value={formData.price}
                    onChange={handleChange}
                />
                <Box>
                    <InputLabel htmlFor="photo-upload">Фото</InputLabel>
                    <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ marginTop: '10px' }}
                    />
                </Box>
                <Button type="submit" variant="contained" color="primary" sx={{ padding: '10px 20px', fontSize: '16px' }}>
                    Сохранить изменения
                </Button>
            </Box>
        </Container>
    );
}

export default EditProduct;