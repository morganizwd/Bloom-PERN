const Router = require('express').Router;
const BasketController = require('../controllers/basketController');
const authenticateToken = require('../middleware/authenticateToken');

const router = Router();

router.get('/', authenticateToken, BasketController.getBasket);

router.post('/add', authenticateToken, BasketController.addItem);

router.delete('/remove/:productId', authenticateToken, BasketController.removeItem);

router.put('/update/:productId', authenticateToken, BasketController.updateItemQuantity);

router.delete('/clear', authenticateToken, BasketController.clearBasket);

module.exports = router;