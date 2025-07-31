const express = require('express');
const router = express.Router();
const {
    initializeCycle,
    confirmCycleDay,
    getCycleInsights
} = require('../controllers/cyclePredictionController'); // adjust path if different
const authMiddleware = require('../middleware/authMiddleware'); // adjust based on your actual auth middleware

// Protect all routes
router.use(authMiddleware);

// Initialize a cycle based on last period start
router.post('/initialize', initializeCycle);

// Confirm or correct a predicted cycle day
router.post('/cycle-days/confirm', confirmCycleDay);

// Get cycle insights (e.g., averages, regularity, symptoms)
router.get('/insights', getCycleInsights);

module.exports = router;
