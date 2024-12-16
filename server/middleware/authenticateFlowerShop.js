const jwt = require('jsonwebtoken');

const authenticateMetizShop = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Нет токена, доступ запрещён' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, decoded) => {
        if (err || !decoded.metizShopId) {
            return res.status(403).json({ message: 'Токен недействителен или отсутствует metizShopId' });
        }

        req.user = { metizShopId: decoded.metizShopId };
        next();
    });
};

module.exports = authenticateMetizShop;