const CycleDay = require('../models/CycleDay');
const NotificationService = require('../services/notificationService');

// POST /api/cycle-days - Enhanced upsert with prediction learning
exports.upsertCycleDay = async (req, res) => {
  const { date, type, flow, symptoms, notes, level } = req.body;

  try {
    const existingData = await CycleDay.findOne({ 
      userId: req.user.id, 
      date 
    });

    const dataToSave = {
      type,
      flow,
      symptoms: symptoms || [],
      notes: notes || '',
      level,
      isConfirmed: true,
      isPrediction: false,
      actualData: true,
      confirmedAt: new Date()
    };

    let updated;
    let wasConfirmingPrediction = false;

    if (existingData) {
      // Check if we're confirming a prediction
      if (existingData.isPrediction) {
        wasConfirmingPrediction = true;
        console.log(`Confirming prediction for ${date}: predicted ${existingData.type}, actual ${type}`);
      }

      updated = await CycleDay.findOneAndUpdate(
        { userId: req.user.id, date },
        { $set: dataToSave },
        { new: true }
      );
    } else {
      updated = await CycleDay.create({
        userId: req.user.id,
        date,
        ...dataToSave
      });
    }

    // Trigger learning update if this is significant data
    if (wasConfirmingPrediction || type === 'period' || type === 'ovulation') {
      // Import the learning function from prediction controller
      const { enhancedLearningUpdate } = require('./cyclePredictionController');
      
      // Trigger learning update asynchronously
      setImmediate(async () => {
        try {
          await enhancedLearningUpdate(req.user.id, date, updated);
          console.log(`Learning update triggered for user ${req.user.id} after confirming ${date}`);
        } catch (error) {
          console.error('Error in learning update:', error);
        }
      });
    }

    res.status(200).json({
      ...updated.toObject(),
      wasConfirmingPrediction,
      learningTriggered: wasConfirmingPrediction || type === 'period' || type === 'ovulation'
    });

  } catch (err) {
    console.error('Error in upsertCycleDay:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// GET /api/cycle-days/today - Get today's cycle day
exports.getTodayCycleDay = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const todayData = await CycleDay.findOne({
      userId: req.user.id,
      date: today
    });

    // If no data exists but we have predictions, return the prediction
    if (!todayData) {
      res.json({ 
        date: today,
        message: 'No data tracked for today',
        hasPrediction: false
      });
      return;
    }

    // Add additional context for the response
    const response = {
      ...todayData.toObject(),
      isToday: true
    };

    // If it's a prediction, add confidence interpretation
    if (todayData.isPrediction) {
      response.confidenceLevel = todayData.confidence > 0.8 ? 'high' : 
                                todayData.confidence > 0.6 ? 'medium' : 'low';
    }

    res.json(response);

  } catch (err) {
    console.error('Error getting today cycle day:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// GET /api/cycle-days - Fetch all days for the user with enhanced data
exports.getCycleDays = async (req, res) => {
  try {
    const { startDate, endDate, includeConfidenceData } = req.query;
    
    let query = { userId: req.user.id };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const days = await CycleDay.find(query).sort({ date: 1 });

    // Enhance response with additional metadata
    const enhancedDays = days.map(day => {
      const dayObj = day.toObject();
      
      // Add confidence level interpretation for predictions
      if (day.isPrediction && day.confidence) {
        dayObj.confidenceLevel = day.confidence > 0.8 ? 'high' : 
                                day.confidence > 0.6 ? 'medium' : 'low';
      }

      // Add days since/until indicators
      const dayDate = new Date(day.date);
      const today = new Date();
      const diffDays = Math.ceil((dayDate - today) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        dayObj.timeIndicator = 'today';
      } else if (diffDays === 1) {
        dayObj.timeIndicator = 'tomorrow';
      } else if (diffDays === -1) {
        dayObj.timeIndicator = 'yesterday';
      } else if (diffDays > 0) {
        dayObj.timeIndicator = `in ${diffDays} days`;
      } else {
        dayObj.timeIndicator = `${Math.abs(diffDays)} days ago`;
      }

      return dayObj;
    });

    // Add summary statistics
    const summary = {
      total: enhancedDays.length,
      confirmed: enhancedDays.filter(d => d.isConfirmed).length,
      predictions: enhancedDays.filter(d => d.isPrediction).length,
      currentStreak: calculateTrackingStreak(enhancedDays),
      dataQuality: calculateDataQuality(enhancedDays)
    };

    res.json({
      days: enhancedDays,
      summary,
      includeConfidenceData: includeConfidenceData === 'true'
    });

  } catch (err) {
    console.error('Error getting cycle days:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// DELETE /api/cycle-days/:date - Remove a specific day with learning update
exports.deleteCycleDay = async (req, res) => {
  const { date } = req.params;

  try {
    const removed = await CycleDay.findOneAndDelete({ 
      userId: req.user.id, 
      date 
    });

    if (!removed) {
      return res.status(404).json({ msg: 'Day not found' });
    }

    // If we deleted important tracking data, trigger a learning update
    if (removed.isConfirmed && (removed.type === 'period' || removed.type === 'ovulation')) {
      const { enhancedLearningUpdate } = require('./cyclePredictionController');
      
      // Trigger learning update asynchronously
      setImmediate(async () => {
        try {
          // Pass null as the day data to indicate deletion
          await enhancedLearningUpdate(req.user.id, date, null);
          console.log(`Learning update triggered after deleting ${date} for user ${req.user.id}`);
        } catch (error) {
          console.error('Error in learning update after deletion:', error);
        }
      });
    }

    res.json({ 
      msg: 'Day deleted successfully',
      deletedData: {
        date: removed.date,
        type: removed.type,
        wasConfirmed: removed.isConfirmed
      }
    });

  } catch (err) {
    console.error('Error deleting cycle day:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// GET /api/cycle-days/current-cycle - Get current cycle information
exports.getCurrentCycle = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Find the most recent period start
    const recentPeriodStart = await CycleDay.findOne({
      userId: req.user.id,
      type: 'period',
      date: { $gte: thirtyDaysAgo.toISOString().split('T')[0] },
      $or: [{ isConfirmed: true }, { isPrediction: true }]
    }).sort({ date: -1 });

    if (!recentPeriodStart) {
      return res.json({
        currentCycle: null,
        message: 'No recent period data found'
      });
    }

    // Calculate current cycle day
    const cycleStartDate = new Date(recentPeriodStart.date);
    const currentCycleDay = Math.floor((today - cycleStartDate) / (1000 * 60 * 60 * 24)) + 1;

    // Get all days in current cycle
    const cycleDays = await CycleDay.find({
      userId: req.user.id,
      date: { $gte: recentPeriodStart.date, $lte: today.toISOString().split('T')[0] }
    }).sort({ date: 1 });

    // Find key events in current cycle
    const currentCycleInfo = {
      cycleStartDate: recentPeriodStart.date,
      currentCycleDay,
      totalDaysTracked: cycleDays.filter(d => d.isConfirmed).length,
      periodLength: cycleDays.filter(d => d.type === 'period' && d.isConfirmed).length,
      ovulationDetected: cycleDays.some(d => d.type === 'ovulation' && d.isConfirmed),
      nextPredictedPeriod: null,
      phase: getCurrentPhase(currentCycleDay),
      symptoms: getRecentSymptoms(cycleDays),
      trackingQuality: calculateCycleTrackingQuality(cycleDays)
    };

    // Find next predicted period
    const nextPeriod = await CycleDay.findOne({
      userId: req.user.id,
      type: 'period',
      isPrediction: true,
      date: { $gt: today.toISOString().split('T')[0] }
    }).sort({ date: 1 });

    if (nextPeriod) {
      const daysUntilPeriod = Math.ceil((new Date(nextPeriod.date) - today) / (1000 * 60 * 60 * 24));
      currentCycleInfo.nextPredictedPeriod = {
        date: nextPeriod.date,
        daysUntil: daysUntilPeriod,
        confidence: nextPeriod.confidence
      };
    }

    res.json({
      currentCycle: currentCycleInfo,
      cycleDays: cycleDays.map(d => d.toObject())
    });

  } catch (err) {
    console.error('Error getting current cycle:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// POST /api/cycle-days/bulk-update - Bulk update multiple days
exports.bulkUpdateCycleDays = async (req, res) => {
  const { updates } = req.body; // Array of { date, type, flow, symptoms, notes }

  try {
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ msg: 'Updates array is required' });
    }

    const results = [];
    let learningUpdateNeeded = false;

    for (const update of updates) {
      const { date, ...updateData } = update;
      
      const result = await CycleDay.findOneAndUpdate(
        { userId: req.user.id, date },
        {
          $set: {
            ...updateData,
            isConfirmed: true,
            isPrediction: false,
            actualData: true,
            confirmedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );

      results.push(result);

      // Check if learning update is needed
      if (updateData.type === 'period' || updateData.type === 'ovulation') {
        learningUpdateNeeded = true;
      }
    }

    // Trigger learning update if needed
    if (learningUpdateNeeded) {
      const { enhancedLearningUpdate } = require('./cyclePredictionController');
      
      setImmediate(async () => {
        try {
          // Use the first period update as trigger for full learning update
          const periodUpdate = results.find(r => r.type === 'period');
          if (periodUpdate) {
            await enhancedLearningUpdate(req.user.id, periodUpdate.date, periodUpdate);
          }
        } catch (error) {
          console.error('Error in bulk learning update:', error);
        }
      });
    }

    res.json({
      message: `Successfully updated ${results.length} days`,
      updatedDays: results.length,
      learningUpdateTriggered: learningUpdateNeeded,
      results: results.map(r => ({
        date: r.date,
        type: r.type,
        confirmed: r.isConfirmed
      }))
    });

  } catch (err) {
    console.error('Error in bulk update:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Helper functions
function calculateTrackingStreak(days) {
  const confirmedDays = days.filter(d => d.isConfirmed).sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  const today = new Date();

  for (const day of confirmedDays) {
    const dayDate = new Date(day.date);
    const daysDiff = Math.floor((today - dayDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateDataQuality(days) {
  if (days.length === 0) return 0;
  
  const confirmedDays = days.filter(d => d.isConfirmed);
  const daysWithSymptoms = confirmedDays.filter(d => d.symptoms && d.symptoms.length > 0);
  const daysWithNotes = confirmedDays.filter(d => d.notes && d.notes.trim().length > 0);
  
  const completenessScore = confirmedDays.length / days.length;
  const richnessScore = (daysWithSymptoms.length + daysWithNotes.length) / (confirmedDays.length * 2);
  
  return Math.round((completenessScore * 0.7 + richnessScore * 0.3) * 100);
}

function getCurrentPhase(cycleDay) {
  if (cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulation';
  return 'luteal';
}

function getRecentSymptoms(cycleDays) {
  const recentDays = cycleDays.filter(d => d.isConfirmed && d.symptoms).slice(-7);
  const symptomCounts = {};
  
  recentDays.forEach(day => {
    day.symptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  return Object.entries(symptomCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([symptom, count]) => ({ symptom, frequency: count }));
}

function calculateCycleTrackingQuality(cycleDays) {
  const totalDays = cycleDays.length;
  const confirmedDays = cycleDays.filter(d => d.isConfirmed).length;
  
  if (totalDays === 0) return 0;
  
  return Math.round((confirmedDays / totalDays) * 100);
}

module.exports = exports;