const jwt = require('jsonwebtoken');

const authenticateFlowerShop = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Нет токена, доступ запрещён' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, decoded) => {
        if (err || !decoded.flowerShopId) {
            return res.status(403).json({ message: 'Токен недействителен или отсутствует flowerShopId' });
        }

        req.user = { flowerShopId: decoded.flowerShopId };
        next();
    });
};

module.exports = authenticateFlowerShop;