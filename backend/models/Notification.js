const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'period_reminder',
      'period_start',
      'fertile_window',
      'ovulation',
      'cycle_start',
      'daily_summary',
      'tracking_reminder',
      'custom'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  relatedDate: {
    type: String // Format: YYYY-MM-DD
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  status: {
    type: String,
    required: true,
    enum: ['scheduled', 'sent', 'failed'],
    default: 'scheduled'
  },
  sentAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ status: 1 });
NotificationSchema.index({ scheduledFor: 1 });
NotificationSchema.index({ userId: 1, status: 1, scheduledFor: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);