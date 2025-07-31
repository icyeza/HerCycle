// models/CycleDay.js
const mongoose = require('mongoose');

const CycleDaySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  date: {
    type: String, // YYYY-MM-DD format
    required: true
  },
  
  // Main day type
  type: {
    type: String,
    enum: [
      'period',
      'fertile', 
      'ovulation',
      'luteal',
      'follicular',
      'predicted-period'
    ],
    required: true
  },
  
  // For period days
  flow: {
    type: String,
    enum: ['spotting', 'light', 'medium', 'heavy']
  },
  
  // For fertile days
  level: {
    type: String,
    enum: ['low', 'medium', 'high', 'peak']
  },
  
  // Cycle information
  cycleDay: {
    type: Number,
    min: 1,
    max: 45
  },
  
  phase: {
    type: String,
    enum: ['menstrual', 'follicular', 'ovulation', 'luteal'],
    required: false
  },
  
  // User input
  symptoms: [{
    type: String,
    enum: [
      'cramps',
      'bloating', 
      'headache',
      'mood swings',
      'fatigue',
      'tender breasts',
      'acne',
      'nausea',
      'back pain',
      'cravings',
      'irritability',
      'anxiety',
      'increased energy',
      'decreased energy'
    ]
  }],
  
  notes: {
    type: String,
    maxlength: 500
  },
  
  // Prediction metadata
  isPrediction: {
    type: Boolean,
    default: false
  },
  
  isConfirmed: {
    type: Boolean,
    default: false
  },
  
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 1
  },
  
  // Additional tracking
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'low', 'terrible']
  },
  
  energy: {
    type: String,
    enum: ['very_high', 'high', 'normal', 'low', 'very_low']
  },
  
  sleep: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'terrible']
  },
  
  // Intimacy tracking (optional)
  intimacy: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
CycleDaySchema.index({ userId: 1, date: 1 }, { unique: true });
CycleDaySchema.index({ userId: 1, isPrediction: 1, date: 1 });
CycleDaySchema.index({ userId: 1, type: 1, date: -1 });

// Update timestamp on save
CycleDaySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
CycleDaySchema.methods.toPrediction = function() {
  return {
    date: this.date,
    type: this.type,
    flow: this.flow,
    level: this.level,
    phase: this.phase,
    cycleDay: this.cycleDay,
    confidence: this.confidence
  };
};

CycleDaySchema.methods.confirmWithUserData = function(userData) {
  this.type = userData.type || this.type;
  this.flow = userData.flow || this.flow;
  this.level = userData.level || this.level;
  this.symptoms = userData.symptoms || [];
  this.notes = userData.notes || '';
  this.mood = userData.mood;
  this.energy = userData.energy;
  this.sleep = userData.sleep;
  this.intimacy = userData.intimacy || false;
  
  this.isPrediction = false;
  this.isConfirmed = true;
  this.confidence = 1;
  
  return this.save();
};

// Static methods
CycleDaySchema.statics.getDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

CycleDaySchema.statics.getCurrentCycle = function(userId) {
  // Get current cycle starting from most recent period
  return this.find({
    userId,
    date: { $lte: new Date().toISOString().split('T')[0] }
  })
  .sort({ date: -1 })
  .limit(35); // Max reasonable cycle length
};

CycleDaySchema.statics.getPredictionsAfter = function(userId, date) {
  return this.find({
    userId,
    isPrediction: true,
    date: { $gte: date }
  }).sort({ date: 1 });
};

CycleDaySchema.statics.getConfirmedData = function(userId, daysBack = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  
  return this.find({
    userId,
    isConfirmed: true,
    date: { $gte: cutoffDate.toISOString().split('T')[0] }
  }).sort({ date: 1 });
};

// Virtual for getting formatted date
CycleDaySchema.virtual('formattedDate').get(function() {
  const date = new Date(this.date);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
});

// Virtual for checking if it's a current prediction
CycleDaySchema.virtual('isCurrentPrediction').get(function() {
  const today = new Date().toISOString().split('T')[0];
  return this.isPrediction && this.date >= today;
});

// Virtual for getting day color/style info
CycleDaySchema.virtual('displayInfo').get(function() {
  const info = {
    type: this.type,
    confidence: this.confidence,
    isPredicted: this.isPrediction
  };
  
  switch (this.type) {
    case 'period':
      info.color = 'red';
      info.intensity = this.flow;
      break;
    case 'fertile':
      info.color = 'green';
      info.intensity = this.level;
      break;
    case 'ovulation':
      info.color = 'yellow';
      info.intensity = 'peak';
      break;
    case 'luteal':
      info.color = 'purple';
      break;
    case 'follicular':
      info.color = 'blue';
      break;
    default:
      info.color = 'gray';
  }
  
  return info;
});

CycleDaySchema.set('toJSON', { virtuals: true });
CycleDaySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CycleDay', CycleDaySchema);