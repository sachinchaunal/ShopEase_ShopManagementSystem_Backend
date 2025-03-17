const express = require('express');
const { check } = require('express-validator');
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadCloudinary } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', productController.getProducts);

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/categories', productController.getCategories);

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', productController.getProductById);

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post(
  '/',
  [
    authenticate,
    authorize('admin'),
    uploadCloudinary.single('image'),
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('price', 'Price must be a positive number').isFloat({ min: 0 }),
    check('category', 'Category is required').not().isEmpty(),
    check('unit', 'Unit is required').isIn(['kg', 'gm', 'liter', 'ml', 'piece', 'dozen', 'packet']),
    check('maxQuantity', 'Maximum quantity must be a positive number').isFloat({ min: 1 })
  ],
  productController.createProduct
);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put(
  '/:id',
  [
    authenticate,
    authorize('admin'),
    uploadCloudinary.single('image'),
    check('name', 'Name is required').optional(),
    check('description', 'Description is required').optional(),
    check('price', 'Price must be a positive number').optional().isFloat({ min: 0 }),
    check('category', 'Category is required').optional(),
    check('unit', 'Unit is required').optional().isIn(['kg', 'gm', 'liter', 'ml', 'piece', 'dozen', 'packet']),
    check('maxQuantity', 'Maximum quantity must be a positive number').optional().isFloat({ min: 1 }),
    check('inStock', 'In stock must be a boolean').optional().isBoolean()
  ],
  productController.updateProduct
);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete(
  '/:id',
  [authenticate, authorize('admin')],
  productController.deleteProduct
);

module.exports = router; 