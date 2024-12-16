const { MetizShop, Product, Review, User, sequelize } = require('../models/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

class MetizShopController {
    async registration(req, res) {
        try {
            const {
                name,
                contact_person_name,
                registration_number,
                phone,
                description,
                email,
                password,
                address,
            } = req.body;

            const existingMetizShop = await MetizShop.findOne({ where: { email } });

            if (existingMetizShop) {
                return res.status(400).json({ message: 'Магазин цветов с таким email уже существует' });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            const MetizShop = await MetizShop.create({
                name,
                contact_person_name,
                registration_number,
                phone,
                description,
                email,
                password: passwordHash,
                address,
                photo: req.file ? `/uploads/MetizShops/${req.file.filename}` : null,
            });

            res.status(201).json(MetizShop);
        } catch (error) {
            console.error('Ошибка при регистрации магазина метизов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const MetizShop = await MetizShop.findOne({ where: { email } });
            if (!MetizShop) {
                return res.status(404).json({ message: 'Магазин цветов не найден' });
            }

            const isMatch = await bcrypt.compare(password, MetizShop.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            const token = jwt.sign(
                { MetizShopId: MetizShop.id },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            res.json({ token, user: MetizShop });
        } catch (error) {
            console.error('Ошибка при входе магазина цветов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async auth(req, res) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'Не авторизован' });
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            const MetizShop = await MetizShop.findByPk(decoded.MetizShopId);

            if (!MetizShop) {
                return res.status(404).json({ message: 'Магазин цветов не найден' });
            }

            res.json(MetizShop);
        } catch (error) {
            console.error('Ошибка при аутентификации магазина цветов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findOne(req, res) {
        try {
            const { id } = req.params;

            const MetizShop = await MetizShop.findByPk(id, {
                include: [
                    { model: Product },
                    {
                        model: Review,
                        include: [{ model: User, attributes: ['name', 'surname'] }]
                    },
                ],
            });

            if (!MetizShop) {
                return res.status(404).json({ message: 'Магазин цветов не найден' });
            }

            res.json(MetizShop);
        } catch (error) {
            console.error('Ошибка при получении магазина цветов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findAll(req, res) {
        try {
            const { name, address, averageRating, limit, offset } = req.query;

            const whereConditions = {};
            if (name) {
                whereConditions.name = { [Op.iLike]: `%${name}%` };
            }
            if (address) {
                whereConditions.address = { [Op.iLike]: `%${address}%` };
            }

            let havingConditions = null;
            if (averageRating) {
                havingConditions = sequelize.where(
                    sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('Reviews.rating')), 1),
                    {
                        [Op.gte]: parseFloat(averageRating)
                    }
                );
            }

            const { rows, count } = await MetizShop.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: Review,
                        attributes: [],
                    },
                ],
                attributes: {
                    include: [
                        [
                            sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('Reviews.rating')), 1),
                            'averageRating'
                        ],
                        [
                            sequelize.fn('COUNT', sequelize.col('Reviews.id')),
                            'reviewCount'
                        ],
                    ],
                },
                group: ['MetizShop.id'],
                having: havingConditions,
                order: [['name', 'ASC']],
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined,
                subQuery: false,
            });

            res.json({
                MetizShops: rows,
                total: count.length,
            });
        } catch (error) {
            console.error('Ошибка при получении списка магазинов цветов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async update(req, res) {
        try {
            const {
                name,
                contact_person_name,
                registration_number,
                phone,
                description,
                email,
                password,
                address,
            } = req.body;
            const MetizShopId = req.params.id;

            const MetizShop = await MetizShop.findByPk(MetizShopId);
            if (!MetizShop) {
                return res.status(404).json({ message: 'Магазин цветов не найден' });
            }

            let updatedData = {
                name,
                contact_person_name,
                registration_number,
                phone,
                description,
                email,
                address,
            };
            if (password) {
                updatedData.password = await bcrypt.hash(password, 12);
            }
            
            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/MetizShops');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const photoPath = `/uploads/MetizShops/${MetizShopId}_${req.file.originalname}`;
                fs.writeFileSync(path.join(uploadDir, `${MetizShopId}_${req.file.originalname}`), fs.readFileSync(req.file.path));
                updatedData.photo = photoPath;
            }

            await MetizShop.update(updatedData);

            res.json(MetizShop);
        } catch (error) {
            console.error('Ошибка при обновлении магазина цветов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async delete(req, res) {
        try {
            const MetizShop = await MetizShop.findByPk(req.params.id);
            if (!MetizShop) {
                return res.status(404).json({ message: 'Магазин цветов не найден' });
            }

            if (MetizShop.photo) {
                const filePath = path.join(__dirname, '..', MetizShop.photo);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            await MetizShop.destroy();

            res.status(200).json({ message: 'Магазин цветов успешно удален' });
        } catch (error) {
            console.error('Ошибка при удалении магазина цветов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new MetizShopController();