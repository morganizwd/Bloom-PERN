const express = require('express');
const FlowerShopController = require('../controllers/flowerShopController');
const authenticateToken = require('../middleware/authenticateToken');
const OrderController = require('../controllers/orderController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/flowershops');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '_' + file.originalname;
        cb(null, uniqueSuffix);
    },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get('/orders', authenticateToken, OrderController.getFlowerShopOrders);
router.post('/registration', upload.single('photo'), FlowerShopController.registration);
router.post('/login', FlowerShopController.login);
router.get('/auth', authenticateToken, FlowerShopController.auth);
router.get('/', FlowerShopController.findAll);
router.get('/:id', FlowerShopController.findOne);
router.put('/:id', authenticateToken, upload.single('photo'), FlowerShopController.update);
router.delete('/:id', authenticateToken, FlowerShopController.delete);

module.exports = router;