const { Basket, BasketItem, Product, User, FlowerShop } = require('../models/models');

class BasketController {
    async getBasket(req, res) {
        try {
            const userId = req.user.userId;

            console.log(`Получение корзины для пользователя ID: ${userId}`);

            let basket = await Basket.findOne({
                where: { userId },
                include: [
                    {
                        model: BasketItem,
                        include: [Product],
                    },
                ],
            });

            if (!basket) {
                console.log('Корзина отсутствует. Создание новой корзины.');
                basket = await Basket.create({ userId });
            }

            console.log('Полученная корзина:', basket);
            res.json(basket);
        } catch (error) {
            console.error('Ошибка при получении корзины:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async addItem(req, res) {
        try {
            const userId = req.user.userId;
            const { productId, quantity } = req.body;

            const product = await Product.findByPk(productId);
            if (!product) {
                return res.status(404).json({ message: 'Товар не найден.' });
            }

            let basket = await Basket.findOne({
                where: { userId },
                include: [{
                    model: BasketItem,
                    include: [Product],
                }],
            });

            if (!basket) {
                basket = await Basket.create({ userId });
            }

            if (basket.BasketItems && basket.BasketItems.length > 0) {
                const existingFlowerShopId = basket.BasketItems[0].Product.flowerShopId;
                if (existingFlowerShopId !== product.flowerShopId) {
                    return res.status(400).json({ message: 'В корзине могут быть товары только из одного магазина цветов.' });
                }
            }

            let basketItem = await BasketItem.findOne({
                where: { basketId: basket.id, productId },
                include: [Product], 
            });

            if (basketItem) {
                basketItem.quantity += quantity;
                await basketItem.save();
            } else {
                basketItem = await BasketItem.create({
                    basketId: basket.id,
                    productId,
                    quantity,
                });
                basketItem = await BasketItem.findByPk(basketItem.id, { include: [Product] }); 
            }

            res.status(201).json(basketItem);
        } catch (error) {
            console.error('Ошибка при добавлении товара в корзину:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async removeItem(req, res) {
        try {
            const userId = req.user.userId;
            const { productId } = req.params;

            const basket = await Basket.findOne({ where: { userId } });
            if (!basket) {
                return res.status(404).json({ message: 'Корзина не найдена' });
            }

            const basketItem = await BasketItem.findOne({
                where: { basketId: basket.id, productId },
            });

            if (!basketItem) {
                return res.status(404).json({ message: 'Товар в корзине не найден' });
            }

            await basketItem.destroy();

            res.status(200).json({ message: 'Товар успешно удален из корзины' });
        } catch (error) {
            console.error('Ошибка при удалении товара из корзины:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async updateItemQuantity(req, res) {
        try {
            const userId = req.user.userId;
            const { productId } = req.params;
            const { quantity } = req.body;

            const basket = await Basket.findOne({ where: { userId } });
            if (!basket) {
                return res.status(404).json({ message: 'Корзина не найдена' });
            }

            const basketItem = await BasketItem.findOne({
                where: { basketId: basket.id, productId },
            });

            if (!basketItem) {
                return res.status(404).json({ message: 'Товар в корзине не найден' });
            }

            basketItem.quantity = quantity;
            await basketItem.save();

            res.status(200).json(basketItem);
        } catch (error) {
            console.error('Ошибка при обновлении количества товара в корзине:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async clearBasket(req, res) {
        try {
            const userId = req.user.userId;

            const basket = await Basket.findOne({ where: { userId } });
            if (!basket) {
                return res.status(404).json({ message: 'Корзина не найдена' });
            }

            await BasketItem.destroy({ where: { basketId: basket.id } });

            res.status(200).json({ message: 'Корзина успешно очищена' });
        } catch (error) {
            console.error('Ошибка при очистке корзины:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new BasketController();