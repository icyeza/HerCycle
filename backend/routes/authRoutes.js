const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register user
router.post(
  '/register',
  [
    check('email', 'Valid email is required').isEmail(),
    check('password', 'Password must be 6+ characters').isLength({ min: 6 }),
    check('languagePreference', 'Language is required').not().isEmpty()
  ],
  authController.register
);

// @route   POST api/auth/login
// @desc    Authenticate user
router.post(
  '/login',
  [
    check('email', 'Valid email is required').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

module.exports = router;