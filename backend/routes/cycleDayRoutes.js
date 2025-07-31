const express = require('express');
const router = express.Router();
const {
  upsertCycleDay,
  getCycleDays,
  getTodayCycleDay,
  deleteCycleDay,
  getCurrentCycle,
  bulkUpdateCycleDays
} = require('../controllers/cycleDayController');
const auth = require('../middleware/authMiddleware');

// Create or update a cycle day
router.post('/', auth, upsertCycleDay);

// Get all cycle days
router.get('/', auth, getCycleDays);
router.get('/today', auth, getTodayCycleDay);

// Delete a specific day by date (e.g., "2025-07-01")
router.delete('/:date', auth, deleteCycleDay);

// Get current cycle information
router.get('/current-cycle', auth, getCurrentCycle);

// Bulk update cycle days
router.post('/bulk-update', auth, bulkUpdateCycleDays);

module.exports = router;
