const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createCycle,
  getCycles,
  updateCycle,
  deleteCycle
} = require('../controllers/cycleController');

// All routes are protected
router.post('/', auth, createCycle);
router.get('/', auth, getCycles);
router.put('/:id', auth, updateCycle);
router.delete('/:id', auth, deleteCycle);

module.exports = router;
