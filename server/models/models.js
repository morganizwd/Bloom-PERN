const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    surname: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    birth_date: { type: DataTypes.DATE, allowNull: true },
    description: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    photo: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: true });

const FlowerShop = sequelize.define('FlowerShop', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    contact_person_name: { type: DataTypes.STRING, allowNull: false },
    registration_number: { type: DataTypes.STRING, allowNull: false }, 
    phone: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    photo: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: true });

const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false },
    photo: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: true });

const Basket = sequelize.define('Basket', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });

const BasketItem = sequelize.define('BasketItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    basketId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });

const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    delivery_address: { type: DataTypes.STRING, allowNull: false },
    total_cost: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    completion_time: { type: DataTypes.STRING, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false }, 
    description: { type: DataTypes.STRING, allowNull: true },
    date_of_ordering: { type: DataTypes.DATE, allowNull: false },
}, { timestamps: true });

const OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });

const Review = sequelize.define('Review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    short_review: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    flowerShopId: { type: DataTypes.INTEGER, allowNull: false }, 
}, { timestamps: true });

User.hasOne(Basket, { foreignKey: 'userId' });
Basket.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

FlowerShop.hasMany(Order, { foreignKey: 'flowerShopId' });
Order.belongsTo(FlowerShop, { foreignKey: 'flowerShopId' });

FlowerShop.hasMany(Product, { foreignKey: 'flowerShopId' });
Product.belongsTo(FlowerShop, { foreignKey: 'flowerShopId' });

FlowerShop.hasMany(Review, { foreignKey: 'flowerShopId' });
Review.belongsTo(FlowerShop, { foreignKey: 'flowerShopId' });

Order.hasOne(Review, { foreignKey: 'orderId' });
Review.belongsTo(Order, { foreignKey: 'orderId' });

Basket.belongsToMany(Product, { through: BasketItem, foreignKey: 'basketId', otherKey: 'productId' });
Product.belongsToMany(Basket, { through: BasketItem, foreignKey: 'productId', otherKey: 'basketId' });

Order.belongsToMany(Product, { through: OrderItem, foreignKey: 'orderId', otherKey: 'productId' });
Product.belongsToMany(Order, { through: OrderItem, foreignKey: 'productId', otherKey: 'orderId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Basket.hasMany(BasketItem, { foreignKey: 'basketId' });
BasketItem.belongsTo(Basket, { foreignKey: 'basketId' });

Product.hasMany(BasketItem, { foreignKey: 'productId' });
BasketItem.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    User,
    FlowerShop,
    Product,
    Basket,
    BasketItem,
    Order,
    OrderItem,
    Review,
    sequelize,
};