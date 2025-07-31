// controllers/notificationController.js
const NotificationService = require('../services/notificationService');
const UserProfile = require('../models/UserProfile');

// POST /api/notifications/subscribe - Subscribe to push notifications
exports.subscribeToPush = async (req, res) => {
  const { subscription } = req.body;

  try {
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ msg: 'Valid subscription object required' });
    }

    const success = await NotificationService.subscribeToPush(req.user.id, subscription);

    if (success) {
      res.json({ 
        message: 'Successfully subscribed to push notifications',
        subscribed: true 
      });
    } else {
      res.status(500).json({ msg: 'Failed to subscribe to push notifications' });
    }

  } catch (error) {
    console.error('Error subscribing to push:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// POST /api/notifications/unsubscribe - Unsubscribe from push notifications
exports.unsubscribeFromPush = async (req, res) => {
  const { endpoint } = req.body;

  try {
    if (!endpoint) {
      return res.status(400).json({ msg: 'Endpoint required' });
    }

    const success = await NotificationService.unsubscribeFromPush(req.user.id, endpoint);

    if (success) {
      res.json({ 
        message: 'Successfully unsubscribed from push notifications',
        unsubscribed: true 
      });
    } else {
      res.status(500).json({ msg: 'Failed to unsubscribe from push notifications' });
    }

  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// PUT /api/notifications/settings - Update notification settings
exports.updateNotificationSettings = async (req, res) => {
  const settings = req.body;

  try {
    // Validate settings
    const validSettings = {
      enabled: settings.enabled,
      periodReminders: settings.periodReminders,
      fertileReminders: settings.fertileReminders,
      ovulationReminders: settings.ovulationReminders,
      cycleInsights: settings.cycleInsights,
      dailySummary: settings.dailySummary,
      trackingReminders: settings.trackingReminders,
      periodAdvanceNotice: settings.periodAdvanceNotice, // days in advance
      reminderTime: settings.reminderTime, // time of day for reminders
      weekendNotifications: settings.weekendNotifications
    };

    // Remove undefined values
    Object.keys(validSettings).forEach(key => 
      validSettings[key] === undefined && delete validSettings[key]
    );

    const success = await NotificationService.updateNotificationSettings(req.user.id, validSettings);

    if (success) {
      res.json({ 
        message: 'Notification settings updated successfully',
        settings: validSettings 
      });
    } else {
      res.status(500).json({ msg: 'Failed to update notification settings' });
    }

  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// GET /api/notifications/settings - Get current notification settings
exports.getNotificationSettings = async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ userId: req.user.id });
    
    const defaultSettings = {
      enabled: false,
      periodReminders: true,
      fertileReminders: true,
      ovulationReminders: true,
      cycleInsights: true,
      dailySummary: false,
      trackingReminders: true,
      periodAdvanceNotice: 2,
      reminderTime: '09:00',
      weekendNotifications: true
    };

    const settings = {
      ...defaultSettings,
      ...userProfile?.notificationSettings
    };

    res.json({
      settings,
      hasSubscriptions: userProfile?.pushSubscriptions?.length > 0,
      subscriptionCount: userProfile?.pushSubscriptions?.length || 0
    });

  } catch (error) {
    console.error('Error getting notification settings:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// GET /api/notifications/history - Get notification history
exports.getNotificationHistory = async (req, res) => {
  const { limit = 50, type } = req.query;

  try {
    let notifications = await NotificationService.getNotificationHistory(
      req.user.id, 
      parseInt(limit)
    );

    // Filter by type if specified
    if (type) {
      notifications = notifications.filter(n => n.type === type);
    }

    res.json({
      notifications,
      total: notifications.length
    });

  } catch (error) {
    console.error('Error getting notification history:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// POST /api/notifications/test - Send test notification
exports.sendTestNotification = async (req, res) => {
  try {
    const success = await NotificationService.sendCustomNotification(
      req.user.id,
      '🧪 Test Notification',
      'This is a test notification to verify your push notifications are working!',
    );

    if (success) {
      res.json({ 
        message: 'Test notification sent successfully',
        sent: true 
      });
    } else {
      res.status(400).json({ 
        msg: 'Failed to send test notification. Make sure you have subscribed to push notifications.' 
      });
    }

  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// GET /api/notifications/vapid-public-key - Get VAPID public key for client
exports.getVapidPublicKey = async (req, res) => {
  try {
    res.json({
      publicKey: process.env.VAPID_PUBLIC_KEY
    });
  } catch (error) {
    console.error('Error getting VAPID key:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// POST /api/notifications/daily-summary - Send daily summary (usually called by cron)
exports.sendDailySummary = async (req, res) => {
    try {
      const success = await NotificationService.sendDailySummary(req.user.id);
  
      if (success) {
        res.json({
          message: 'Daily summary notification sent successfully',
          sent: true
        });
      } else {
        res.status(400).json({
          msg: 'Daily summary was not sent (possibly disabled in settings or no relevant data)',
          sent: false
        });
      }
  
    } catch (error) {
      console.error('Error sending daily summary:', error);
      res.status(500).json({ msg: 'Server error', error: error.message });
    }
  };
  