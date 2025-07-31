require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const cycleRoutes = require('./routes/cycleRoutes');
const productRoutes = require('./routes/productRoutes');
const cycleDayRoutes = require('./routes/cycleDayRoutes');
const cyclePredRoutes = require('./routes/cyclePredRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cors = require('cors');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cycles', cyclePredRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cycle-days', cycleDayRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/notifications', notificationRoutes);


// Test route
app.get('/', (req, res) => res.send('HerCycle API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));