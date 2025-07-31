const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createProduct,
  getProducts,
  // updateProduct,
  deleteAllProducts
} = require('../controllers/productController');

// All routes are protected
router.post('/', createProduct);
router.get('/', getProducts);
// router.put('/:id', auth, updateProduct);
// router.delete('/', deleteAllProducts);

module.exports = router;
