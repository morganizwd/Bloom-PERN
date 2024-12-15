import React, { useState, useEffect, useContext } from 'react';
import axios from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, TextField, Button, Box, InputLabel, CardMedia } from '@mui/material';

function EditFlowerShopInfo() {
    const { authData } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        contact_person_name: '',
        registration_number: '',
        phone: '',
        description: '',
        address: '',
    });
    const [photo, setPhoto] = useState(null);
    const [currentPhoto, setCurrentPhoto] = useState(null);

    useEffect(() => {
        fetchFlowerShopInfo();
    }, []);

    const fetchFlowerShopInfo = async () => {
        try {
            const response = await axios.get(`/api/flowershops/${authData.user.id}`);
            setFormData({
                name: response.data.name,
                contact_person_name: response.data.contact_person_name,
                registration_number: response.data.registration_number,
                phone: response.data.phone,
                description: response.data.description,
                address: response.data.address,
            });
            setCurrentPhoto(response.data.photo);
        } catch (error) {
            console.error('Ошибка при получении информации о магазине цветов:', error);
            alert('Не удалось загрузить информацию о магазине цветов.');
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
        data.append('contact_person_name', formData.contact_person_name);
        data.append('registration_number', formData.registration_number);
        data.append('phone', formData.phone);
        data.append('description', formData.description);
        data.append('address', formData.address);

        if (photo) {
            data.append('photo', photo);
        }

        try {
            const response = await axios.put(`/api/flowershops/${authData.user.id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Информация успешно обновлена!');
            if (response.data.photo) {
                setCurrentPhoto(response.data.photo);
            }
        } catch (error) {
            console.error('Ошибка при обновлении информации о магазине цветов:', error);
            alert('Ошибка при обновлении информации.');
        }
    };

    return (
        <Container sx={{ padding: '20px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Редактировать информацию о магазине цветов
            </Typography>
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
                    label="Название магазина цветов"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                />
                <TextField
                    label="Контактное лицо"
                    name="contact_person_name"
                    required
                    value={formData.contact_person_name}
                    onChange={handleChange}
                />
                <TextField
                    label="Регистрационный номер"
                    name="registration_number"
                    required
                    value={formData.registration_number}
                    onChange={handleChange}
                />
                <TextField
                    label="Телефон"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                />
                <TextField
                    label="Адрес"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                />
                <TextField
                    label="Описание"
                    name="description"
                    multiline
                    rows={4}
                    value={formData.description}
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

export default EditFlowerShopInfo;