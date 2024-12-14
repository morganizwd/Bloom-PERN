const express = require('express');
const ProductController = require('../controllers/productController');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/products');
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

router.post('/', authenticateToken, upload.single('photo'), ProductController.create);
router.get('/', ProductController.findAll);
router.get('/bakery/:bakeryId', ProductController.findByBakery);
router.get('/:id', ProductController.findOne);
router.put('/:id', authenticateToken, upload.single('photo'), ProductController.update);
router.delete('/:id', authenticateToken, ProductController.delete);

module.exports = router;