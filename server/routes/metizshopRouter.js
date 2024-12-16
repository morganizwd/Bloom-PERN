const express = require('express');
const MetizShopController = require('../controllers/metizShopController');
const authenticateToken = require('../middleware/authenticateToken');
const OrderController = require('../controllers/orderController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/metizshops');
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

router.get('/orders', authenticateToken, OrderController.getMetizShopOrders);
router.post('/registration', upload.single('photo'), MetizShopController.registration);
router.post('/login', MetizShopController.login);
router.get('/auth', authenticateToken, MetizShopController.auth);
router.get('/', MetizShopController.findAll);
router.get('/:id', MetizShopController.findOne);
router.put('/:id', authenticateToken, upload.single('photo'), MetizShopController.update);
router.delete('/:id', authenticateToken, MetizShopController.delete);

module.exports = router;