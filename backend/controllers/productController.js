const Product = require('../models/Product');

// POST /api/product - Create a new product entry
exports.createProduct = async (req, res) => {
  const { title, price, image, notes } = req.body;

  try {
    const newProduct = new Product({
      title,
      price,
      image,
      notes,
      rating: 0,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.deleteAllProducts = async (req, res) => {
  try {
    // Optional: Check if the user is admin before allowing this
    // if (!req.user.isAdmin) return res.status(403).json({ msg: 'Unauthorized' });

    const result = await Product.deleteMany({});
    res.json({ msg: `Deleted ${result.deletedCount} products.` });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};


// GET /api/product - Get all Product for logged-in user
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// PUT /api/product/:id - Update a product
exports.updateProduct = async (req, res) => {
  const { title, price, image, rating } = req.body;

  try {
    const product = await Product.findOne({ _id: req.params.id, userId: req.user.id });
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    if (title) product.title = title;
    if (price) product.price = price;
    if (image) product.image = image;
    if (rating) product.rating = rating; // Finish this !!


    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// DELETE /api/cycles/:id - Delete a cycle
exports.deleteCycle = async (req, res) => {
  try {
    const cycle = await Cycle.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!cycle) return res.status(404).json({ msg: 'Cycle not found' });

    res.json({ msg: 'Cycle deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
