import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Box,
    Button,
    CircularProgress,
    Grid,
    Input,
    TextField,
    Typography,
    Avatar,
    IconButton,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function Profile() {
    const { authData } = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        phone: '',
        birth_date: '',
        description: '',
        photo: null,
        password: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get('/api/users/auth', {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            setUser(response.data);
            setFormData({
                name: response.data.name || '',
                surname: response.data.surname || '',
                email: response.data.email || '',
                phone: response.data.phone || '',
                birth_date: response.data.birth_date ? response.data.birth_date.substring(0, 10) : '',
                description: response.data.description || '',
                photo: null,
                password: '',
            });
            setLoading(false);
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            toast.error('Не удалось загрузить данные профиля');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'photo') {
            setFormData(prev => ({ ...prev, photo: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.email.trim()) {
            toast.error('Пожалуйста, заполните обязательные поля (Имя, Email)');
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('surname', formData.surname);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('birth_date', formData.birth_date);
            data.append('description', formData.description);
            if (formData.password) {
                data.append('password', formData.password);
            }
            if (formData.photo) {
                data.append('photo', formData.photo);
            }

            const response = await axios.put(`/api/users/${user.id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authData.token}`,
                },
            });

            setUser(response.data);
            toast.success('Профиль успешно обновлён');
            setSubmitting(false);
            setFormData(prev => ({ ...prev, password: '', photo: null }));
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            toast.error(error.response?.data?.message || 'Не удалось обновить профиль');
            setSubmitting(false);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Профиль пользователя
            </Typography>
            <ToastContainer />
            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sx={{ textAlign: 'center' }}>
                        <Avatar
                            src={formData.photo ? URL.createObjectURL(formData.photo) : `http://localhost:5000${user.photo}`}
                            alt="Фото профиля"
                            sx={{ width: 400, height: 400, mx: 'auto' }}
                        />
                        <IconButton color="primary" component="label">
                            <PhotoCamera />
                            <input
                                type="file"
                                name="photo"
                                accept="image/*"
                                hidden
                                onChange={handleChange}
                            />
                        </IconButton>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Имя*"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Фамилия"
                            name="surname"
                            value={formData.surname}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Электронная почта*"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Телефон"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Дата рождения"
                            name="birth_date"
                            type="date"
                            value={formData.birth_date}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Описание"
                            name="description"
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Новый пароль"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            fullWidth
                            placeholder="Оставьте пустым, если не хотите менять пароль"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                            fullWidth
                            disabled={submitting}
                        >
                            {submitting ? 'Обновление...' : 'Обновить профиль'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default Profile;
