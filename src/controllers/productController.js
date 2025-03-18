const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const { uploadFromUrl } = require('../middleware/upload');
const { deleteImage } = require('../utils/cloudinary');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, search, inStock, sort, limit = 20, page = 1 } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by stock status
    if (inStock !== undefined) {
      query.inStock = inStock === 'true';
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total products matching query
    const total = await Product.countDocuments(query);
    
    // Build sort options
    let sortOptions = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    } else {
      // Default sort by createdAt desc
      sortOptions = { createdAt: -1 };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get products
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { name, description, price, category, unit, maxQuantity, imageUrl } = req.body;
    
    let imageData = {};
    
    // Handle image upload - either from file or URL
    if (req.file) {
      // Image uploaded via multer
      imageData = {
        url: req.file.path,
        public_id: req.file.filename
      };
      
      if (req.file.path.includes('cloudinary')) {
        // If using cloudinary storage
        imageData = {
          url: req.file.path,
          public_id: req.file.filename
        };
      }
    } else if (imageUrl) {
      // Image provided as URL
      imageData = await uploadFromUrl(imageUrl);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Product image is required'
      });
    }
    
    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      image: imageData.url,
      imageId: imageData.public_id,
      category,
      unit,
      maxQuantity,
      inStock: true
    });
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { name, description, price, category, unit, maxQuantity, inStock, imageUrl } = req.body;
    
    // Find product
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Update fields
    const updateData = {
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      category: category || product.category,
      unit: unit || product.unit,
      maxQuantity: maxQuantity || product.maxQuantity,
      inStock: inStock !== undefined ? inStock : product.inStock
    };
    
    // Handle image update if provided
    if (imageUrl && imageUrl !== product.image) {
      // Delete old image from cloudinary if exists
      if (product.imageId) {
        await deleteImage(product.imageId);
      }
      
      // Upload new image
      const imageData = await uploadFromUrl(imageUrl);
      updateData.image = imageData.url;
      updateData.imageId = imageData.public_id;
    }
    
    // Update product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    // Find product
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Delete image from cloudinary if exists
    if (product.imageId) {
      await deleteImage(product.imageId);
    }
    
    // Delete product
    await product.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 
