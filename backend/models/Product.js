const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  image: {
    type: String,
  },
  notes: {
    type: String
  }
});

module.exports = mongoose.model('Product', ProductSchema);
