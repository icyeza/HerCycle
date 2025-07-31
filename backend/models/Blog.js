const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true },
  excerpt: { type: String, required: true, maxlength: 300 },
  category: {
    type: String,
    required: true,
    enum: ['menstruation', 'nutrition', 'health', 'lifestyle', 'fertility', 'wellness']
  },
  tags: [{ type: String, trim: true }],
  image: {
    type: String,
    validate: {
      validator: v => !v || /^https?:\/\/.+/.test(v),
      message: 'Image must be a valid URL'
    }
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  views: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  featured: { type: Boolean, default: false },
  publishedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

BlogPostSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

BlogPostSchema.index({ title: 'text', content: 'text', excerpt: 'text', tags: 'text' });

module.exports = mongoose.model('BlogPost', BlogPostSchema);
