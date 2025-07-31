const express = require('express');
const router = express.Router();
const {
  subscribeToPush,
  unsubscribeFromPush,
  updateNotificationSettings,
  getNotificationSettings,
  getNotificationHistory,
  sendTestNotification,
  getVapidPublicKey,
  sendDailySummary
} = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

// Push subscription management
router.post('/subscribe', auth, subscribeToPush);
router.post('/unsubscribe', auth, unsubscribeFromPush);

// Notification settings
router.put('/settings', auth, updateNotificationSettings);
router.get('/settings', auth, getNotificationSettings);

// Notification history
router.get('/history', auth, getNotificationHistory);

// Test and utility endpoints
router.post('/test', auth, sendTestNotification);
router.get('/vapid-public-key', auth, getVapidPublicKey);

// Automated notification endpoints (typically called internally/by cron)
router.post('/daily-summary', auth, sendDailySummary);

module.exports = router;