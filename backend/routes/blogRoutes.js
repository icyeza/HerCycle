const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Blog Post Schema
const BlogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  category: {
    type: String,
    required: true,
    enum: ['menstruation', 'nutrition', 'health', 'lifestyle', 'fertility', 'wellness']
  },
  tags: [{
    type: String,
    trim: true
  }],
  image: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Image must be a valid URL'
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  featured: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for like count
BlogPostSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Add text index for search
BlogPostSchema.index({ 
  title: 'text', 
  content: 'text', 
  excerpt: 'text',
  tags: 'text'
});

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

// Saved Posts Schema
const SavedPostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  }
}, {
  timestamps: true
});

// Prevent duplicate saves
SavedPostSchema.index({ user: 1, post: 1 }, { unique: true });

const SavedPost = mongoose.model('SavedPost', SavedPostSchema);

// Comment Schema
const CommentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved'
  }
}, {
  timestamps: true
});

const Comment = mongoose.model('Comment', CommentSchema);

// Middleware to check authentication
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = decoded.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.email !== 'icyeza12@gmail.com') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// GET /api/blog/posts - Get all published blog posts
router.get('/posts', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      featured,
      sort = '-publishedAt'
    } = req.query;

    const filter = { status: 'published' };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    const posts = await BlogPost.find(filter)
      .populate('author', 'name email avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add user-specific data if authenticated
    if (req.header('Authorization')) {
      try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add like status for each post
        for (let post of posts) {
          post.isLiked = post.likes.some(like => 
            like.user.toString() === decoded.id
          );
          post.likesCount = post.likes.length;
        }
      } catch (error) {
        // If token is invalid, just don't add user-specific data
      }
    }

    const total = await BlogPost.countDocuments(filter);
    
    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
    
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Server error while fetching posts' });
  }
});

// GET /api/blog/posts/:id - Get single blog post
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate('author', 'name email avatar')
      .lean();

    if (!post || post.status !== 'published') {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    await BlogPost.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    post.views += 1;

    // Add user-specific data if authenticated
    if (req.header('Authorization')) {
      try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        post.isLiked = post.likes.some(like => 
          like.user.toString() === decoded.id
        );
      } catch (error) {
        post.isLiked = false;
      }
    }

    post.likesCount = post.likes.length;

    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Server error while fetching post' });
  }
});

// POST /api/blog/posts - Create new blog post (Admin only)
const { upload } = require('../middleware/upload');

router.post('/posts',
  authenticateUser,
  requireAdmin,
  upload.single('image'), // Accepts file field named "image"
  [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('excerpt').trim().isLength({ min: 1, max: 300 }).withMessage('Excerpt is required'),
    body('category').isIn(['menstruation', 'nutrition', 'health', 'lifestyle', 'fertility', 'wellness']).withMessage('Invalid category'),
    body('tags').optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, excerpt, category, tags, featured } = req.body;

      // Get uploaded image URL from Cloudinary
      const imageUrl = req.file?.path;

      const post = new BlogPost({
        title,
        content,
        excerpt,
        category,
        tags: JSON.parse(tags) || [],
        image: imageUrl || undefined,
        author: req.user.id,
        featured: featured || false
      });

      await post.save();
      await post.populate('author', 'name email avatar');

      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating blog post with image:', error);
      res.status(500).json({ message: 'Server error while creating post' });
    }
  }
);

// PUT /api/blog/posts/:id - Update blog post (Admin only)
router.put('/posts/:id',
  authenticateUser,
  requireAdmin,
  [
    body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
    body('content').optional().trim().isLength({ min: 1 }).withMessage('Content cannot be empty'),
    body('excerpt').optional().trim().isLength({ min: 1, max: 300 }).withMessage('Excerpt must be less than 300 characters'),
    body('category').optional().isIn(['menstruation', 'nutrition', 'health', 'lifestyle', 'fertility', 'wellness']).withMessage('Invalid category'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('image').optional().isURL().withMessage('Image must be a valid URL')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const post = await BlogPost.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('author', 'name email avatar');

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      res.json(post);
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ message: 'Server error while updating post' });
    }
  }
);

// DELETE /api/blog/posts/:id - Delete blog post (Admin only)
router.delete('/posts/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Clean up related data
    await SavedPost.deleteMany({ post: req.params.id });
    await Comment.deleteMany({ post: req.params.id });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Server error while deleting post' });
  }
});

// POST /api/blog/posts/:id/like - Like/Unlike a blog post
router.post('/posts/:id/like', authenticateUser, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = post.likes.find(like => 
      like.user && like.user.toString() === req.user.id.toString()
    );


    if (existingLike) {
      // Unlike the post
      post.likes = post.likes.filter(like => 
        like.user.toString() !== req.user.id.toString()
      );
    } else {
      // Like the post
      post.likes.push({ user: req.user.id });
    }

    await post.save();

    res.json({
      likes: post.likes.length,
      isLiked: !existingLike
    });
  } catch (error) {
    console.error('Error liking blog post:', error);
    res.status(500).json({ message: 'Server error while liking post' });
  }
});

// GET /api/blog/categories - Get all blog categories
router.get('/categories', async (req, res) => {
  try {
    const categories = ['menstruation', 'nutrition', 'health', 'lifestyle', 'fertility', 'wellness'];
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
});

// GET /api/blog/saved - Get user's saved posts
router.get('/saved', authenticateUser, async (req, res) => {
  try {
    const savedPosts = await SavedPost.find({ user: req.user._id })
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          select: 'name email avatar'
        }
      })
      .sort('-createdAt');

    const posts = savedPosts
      .filter(saved => saved.post && saved.post.status === 'published')
      .map(saved => ({
        ...saved.post.toObject(),
        savedAt: saved.createdAt,
        isLiked: saved.post.likes.some(like => 
          like.user.toString() === req.user._id.toString()
        ),
        likesCount: saved.post.likes.length
      }));

    res.json(posts);
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    res.status(500).json({ message: 'Server error while fetching saved posts' });
  }
});

// POST /api/blog/saved/:postId - Save a blog post
router.post('/saved/:postId', authenticateUser, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.postId);
    
    if (!post || post.status !== 'published') {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingSave = await SavedPost.findOne({
      user: req.user._id,
      post: req.params.postId
    });

    if (existingSave) {
      return res.status(400).json({ message: 'Post already saved' });
    }

    const savedPost = new SavedPost({
      user: req.user._id,
      post: req.params.postId
    });

    await savedPost.save();

    res.status(201).json({ message: 'Post saved successfully' });
  } catch (error) {
    console.error('Error saving blog post:', error);
    res.status(500).json({ message: 'Server error while saving post' });
  }
});

// DELETE /api/blog/saved/:postId - Remove saved blog post
router.delete('/saved/:postId', authenticateUser, async (req, res) => {
  try {
    const result = await SavedPost.findOneAndDelete({
      user: req.user._id,
      post: req.params.postId
    });

    if (!result) {
      return res.status(404).json({ message: 'Saved post not found' });
    }

    res.json({ message: 'Post removed from saved' });
  } catch (error) {
    console.error('Error removing saved post:', error);
    res.status(500).json({ message: 'Server error while removing saved post' });
  }
});

// GET /api/blog/posts/:id/comments - Get comments for a blog post
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const comments = await Comment.find({ 
      post: req.params.id, 
      status: 'approved',
      parentComment: null // Only top-level comments
    })
      .populate('user', 'name avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'user',
          select: 'name avatar'
        }
      })
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get replies for each comment
    for (let comment of comments) {
      const replies = await Comment.find({ 
        parentComment: comment._id, 
        status: 'approved' 
      })
        .populate('user', 'name avatar')
        .sort('createdAt');
      
      comment.replies = replies;
    }

    const total = await Comment.countDocuments({ 
      post: req.params.id, 
      status: 'approved',
      parentComment: null
    });

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
});

// POST /api/blog/posts/:id/comments - Add comment to blog post
router.post('/posts/:id/comments',
  authenticateUser,
  [
    body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
    body('parentComment').optional().isMongoId().withMessage('Invalid parent comment ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const post = await BlogPost.findById(req.params.id);
      if (!post || post.status !== 'published') {
        return res.status(404).json({ message: 'Post not found' });
      }

      const { content, parentComment } = req.body;

      // If replying to a comment, verify it exists
      if (parentComment) {
        const parent = await Comment.findById(parentComment);
        if (!parent || parent.post.toString() !== req.params.id) {
          return res.status(400).json({ message: 'Invalid parent comment' });
        }
      }

      const comment = new Comment({
        post: req.params.id,
        user: req.user._id,
        content,
        parentComment: parentComment || null
      });

      await comment.save();
      await comment.populate('user', 'name avatar');

      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ message: 'Server error while creating comment' });
    }
  }
);

// POST /api/blog/comments/:id/like - Like/Unlike a comment
router.post('/comments/:id/like', authenticateUser, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const existingLike = comment.likes.find(like => 
      like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike the comment
      comment.likes = comment.likes.filter(like => 
        like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Like the comment
      comment.likes.push({ user: req.user._id });
    }

    await comment.save();

    res.json({
      likes: comment.likes.length,
      isLiked: !existingLike
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Server error while liking comment' });
  }
});

// DELETE /api/blog/comments/:id - Delete comment (Author or Admin only)
router.delete('/comments/:id', authenticateUser, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is comment author or admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete comment and its replies
    await Comment.deleteMany({ 
      $or: [
        { _id: req.params.id },
        { parentComment: req.params.id }
      ]
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error while deleting comment' });
  }
});

// GET /api/blog/stats - Get blog statistics (Admin only)
router.get('/stats', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const totalPosts = await BlogPost.countDocuments({ status: 'published' });
    const totalDrafts = await BlogPost.countDocuments({ status: 'draft' });
    const totalViews = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalLikes = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $project: { likesCount: { $size: '$likes' } } },
      { $group: { _id: null, totalLikes: { $sum: '$likesCount' } } }
    ]);
    const totalComments = await Comment.countDocuments({ status: 'approved' });

    // Posts by category
    const postsByCategory = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Most popular posts (by views)
    const popularPosts = await BlogPost.find({ status: 'published' })
      .select('title views likes category createdAt')
      .populate('author', 'name')
      .sort('-views')
      .limit(10);

    // Recent activity
    const recentComments = await Comment.find({ status: 'approved' })
      .populate('user', 'name')
      .populate('post', 'title')
      .sort('-createdAt')
      .limit(10);

    res.json({
      totalPosts,
      totalDrafts,
      totalViews: totalViews[0]?.totalViews || 0,
      totalLikes: totalLikes[0]?.totalLikes || 0,
      totalComments,
      postsByCategory,
      popularPosts,
      recentComments
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    res.status(500).json({ message: 'Server error while fetching stats' });
  }
});

// GET /api/blog/search - Advanced search for blog posts
router.get('/search', async (req, res) => {
  try {
    const {
      q,
      category,
      tags,
      author,
      dateFrom,
      dateTo,
      sortBy = 'relevance',
      page = 1,
      limit = 12
    } = req.query;

    let filter = { status: 'published' };
    let sort = {};

    // Text search
    if (q) {
      filter.$text = { $search: q };
      if (sortBy === 'relevance') {
        sort = { score: { $meta: 'textScore' } };
      }
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Author filter
    if (author) {
      filter.author = author;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.publishedAt = {};
      if (dateFrom) {
        filter.publishedAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.publishedAt.$lte = new Date(dateTo);
      }
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        sort = { publishedAt: -1 };
        break;
      case 'oldest':
        sort = { publishedAt: 1 };
        break;
      case 'popular':
        sort = { views: -1 };
        break;
      case 'mostLiked':
        sort = { 'likes.length': -1 };
        break;
      default:
        if (!sort.score) {
          sort = { publishedAt: -1 };
        }
    }

    const posts = await BlogPost.find(filter)
      .populate('author', 'name email avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add user-specific data if authenticated
    if (req.header('Authorization')) {
      try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        for (let post of posts) {
          post.isLiked = post.likes.some(like => 
            like.user.toString() === decoded.id
          );
          post.likesCount = post.likes.length;
        }
      } catch (error) {
        // Token invalid, continue without user data
      }
    }

    const total = await BlogPost.countDocuments(filter);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      searchQuery: q,
      filters: {
        category,
        tags,
        author,
        dateFrom,
        dateTo,
        sortBy
      }
    });
  } catch (error) {
    console.error('Error searching blog posts:', error);
    res.status(500).json({ message: 'Server error while searching posts' });
  }
});

module.exports = router;
