const CycleDay = require('../models/CycleDay');
const UserProfile = require('../models/UserProfile');
const NotificationService = require('../services/notificationService');

// Default cycle parameters
const DEFAULT_CYCLE_PARAMS = {
  cycleLength: 28,
  periodLength: 5,
  lutealPhaseLength: 14,
  fertileWindowDays: 6,
  ovulationVariance: 2, // Days ovulation can vary
};

// POST /api/cycles/initialize - Initialize cycle from last period start
exports.initializeCycle = async (req, res) => {
  const { lastPeriodStart } = req.body;
  
  try {
    let userProfile = await UserProfile.findOne({ userId: req.user.id });
    if (!userProfile) {
      userProfile = new UserProfile({
        userId: req.user.id,
        ...DEFAULT_CYCLE_PARAMS,
        learningData: {
          cycleLengths: [],
          periodLengths: [],
          ovulationDays: [],
          totalCycles: 0,
          lastLearningUpdate: new Date()
        }
      });
      await userProfile.save();
    }

    const startDate = new Date(lastPeriodStart);
    const predictions = generateCyclePredictions(startDate, userProfile);

    // Clear existing predictions and create new ones
    await CycleDay.deleteMany({ 
      userId: req.user.id, 
      isPrediction: true 
    });

    // Insert all predicted days
    const cycleDays = predictions.map(day => ({
      userId: req.user.id,
      date: day.date,
      type: day.type,
      flow: day.flow,
      phase: day.phase,
      cycleDay: day.cycleDay,
      isPrediction: true,
      confidence: day.confidence,
      level: day.level
    }));

    await CycleDay.insertMany(cycleDays);

    // Schedule notifications
    await NotificationService.scheduleNotifications(req.user.id, predictions);

    res.json({
      message: 'Cycle initialized successfully',
      predictions: predictions.length,
      userProfile,
      notificationsScheduled: true
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Enhanced prediction generation with learning
function generateCyclePredictions(startDate, userProfile, cyclesAhead = 3) {
  const predictions = [];
  const params = userProfile;
  
  // Use learned data if available
  const avgCycleLength = params.learningData?.cycleLengths?.length > 0 
    ? Math.round(params.learningData.cycleLengths.reduce((a, b) => a + b, 0) / params.learningData.cycleLengths.length)
    : params.cycleLength;

  const avgPeriodLength = params.learningData?.periodLengths?.length > 0
    ? Math.round(params.learningData.periodLengths.reduce((a, b) => a + b, 0) / params.learningData.periodLengths.length)
    : params.periodLength;

  const avgOvulationDay = params.learningData?.ovulationDays?.length > 0
    ? Math.round(params.learningData.ovulationDays.reduce((a, b) => a + b, 0) / params.learningData.ovulationDays.length)
    : (avgCycleLength - params.lutealPhaseLength);

  for (let cycle = 0; cycle < cyclesAhead; cycle++) {
    const cycleStartDate = new Date(startDate);
    cycleStartDate.setDate(startDate.getDate() + (cycle * avgCycleLength));

    const cyclePredictions = generateSingleCyclePredictions(
      cycleStartDate, 
      {
        ...params,
        cycleLength: avgCycleLength,
        periodLength: avgPeriodLength,
        ovulationDay: avgOvulationDay
      },
      cycle === 0, // First cycle has higher confidence
      params.learningData?.totalCycles || 0
    );
    
    predictions.push(...cyclePredictions);
  }

  return predictions;
}

function generateSingleCyclePredictions(startDate, params, isCurrentCycle, totalCycles) {
  const predictions = [];
  
  // Confidence increases with more learning data
  const learningFactor = Math.min(totalCycles / 6, 1); // Max confidence after 6 cycles
  const baseConfidence = isCurrentCycle ? 0.9 : 0.7;
  const adjustedConfidence = baseConfidence + (learningFactor * 0.1);

  // Calculate key dates with variance
  const ovulationDay = params.ovulationDay || (params.cycleLength - params.lutealPhaseLength);
  const ovulationVariance = Math.max(1, Math.floor(learningFactor * params.ovulationVariance));
  
  const fertileStartDay = Math.max(1, ovulationDay - 5);
  const fertileEndDay = Math.min(params.cycleLength, ovulationDay + 1);

  // Generate each day of the cycle
  for (let day = 1; day <= params.cycleLength; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + (day - 1));
    
    const prediction = {
      date: currentDate.toISOString().split('T')[0],
      cycleDay: day,
      confidence: adjustedConfidence
    };

    // Determine phase and type based on cycle day
    if (day <= params.periodLength) {
      // Menstrual phase
      prediction.type = 'period';
      prediction.phase = 'menstrual';
      prediction.flow = getPredictedFlow(day, params.periodLength, params.learningData);
      prediction.confidence = Math.min(0.95, adjustedConfidence + 0.05); // Period predictions are most reliable
    } 
    else if (day >= fertileStartDay && day <= fertileEndDay) {
      // Fertile window
      if (Math.abs(day - ovulationDay) <= ovulationVariance) {
        prediction.type = 'ovulation';
        prediction.phase = 'ovulation';
        prediction.confidence = adjustedConfidence * 0.8; // Ovulation timing can vary
      } else {
        prediction.type = 'fertile';
        prediction.phase = 'follicular';
        prediction.level = getFertileLevel(day, ovulationDay);
        prediction.confidence = adjustedConfidence * 0.75;
      }
    }
    else if (day > ovulationDay) {
      // Luteal phase
      prediction.type = 'luteal';
      prediction.phase = 'luteal';
      prediction.confidence = adjustedConfidence * 0.7;
    }
    else {
      // Follicular phase (after period, before fertile window)
      prediction.type = 'follicular';
      prediction.phase = 'follicular';
      prediction.confidence = adjustedConfidence * 0.6;
    }

    predictions.push(prediction);
  }

  return predictions;
}

function getPredictedFlow(dayOfPeriod, totalPeriodDays, learningData) {
  // Use learned patterns if available
  if (learningData?.flowPatterns) {
    const patterns = learningData.flowPatterns[dayOfPeriod];
    if (patterns) {
      // Return most common flow for this day
      return Object.keys(patterns).reduce((a, b) => patterns[a] > patterns[b] ? a : b);
    }
  }

  // Default pattern
  if (dayOfPeriod === 1) return 'light';
  if (dayOfPeriod === 2 || dayOfPeriod === 3) return 'heavy';
  if (dayOfPeriod === totalPeriodDays) return 'spotting';
  return 'medium';
}

function getFertileLevel(cycleDay, ovulationDay) {
  const daysFromOvulation = Math.abs(cycleDay - ovulationDay);
  if (daysFromOvulation === 0) return 'peak';
  if (daysFromOvulation === 1) return 'high';
  if (daysFromOvulation === 2) return 'medium';
  return 'low';
}

// POST /api/cycle-days/confirm - Enhanced confirmation with learning
exports.confirmCycleDay = async (req, res) => {
  const { date, type, flow, symptoms, notes, actualData } = req.body;

  try {
    // Update the day with actual data
    const updated = await CycleDay.findOneAndUpdate(
      { userId: req.user.id, date },
      {
        $set: {
          type,
          flow,
          symptoms,
          notes,
          isPrediction: false,
          isConfirmed: true,
          actualData: actualData || true,
          confirmedAt: new Date()
        },
      },
      { upsert: true, new: true }
    );

    // Learn from this data and update predictions
    await enhancedLearningUpdate(req.user.id, date, updated);

    res.json(updated);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Enhanced learning system
async function enhancedLearningUpdate(userId, date, dayData) {
  try {
    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) return;

    // Get all confirmed cycle data (last 12 months for better learning)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const confirmedData = await CycleDay.find({
      userId,
      isConfirmed: true,
      date: { $gte: twelveMonthsAgo.toISOString().split('T')[0] }
    }).sort({ date: 1 });

    if (confirmedData.length < 15) return; // Need enough data points

    // Group into complete cycles
    const cycles = groupIntoCycles(confirmedData);
    const completeCycles = cycles.filter(cycle => cycle.length > 21); // Only reasonably complete cycles

    if (completeCycles.length >= 2) {
      // Learn cycle lengths
      const cycleLengths = completeCycles.map(cycle => cycle.length);
      
      // Learn period lengths
      const periodLengths = completeCycles.map(cycle => {
        const periodDays = cycle.filter(day => day.type === 'period');
        return periodDays.length;
      }).filter(length => length > 0);

      // Learn ovulation timing
      const ovulationDays = completeCycles.map(cycle => {
        const ovulationDay = cycle.find(day => day.type === 'ovulation');
        if (ovulationDay) {
          return cycle.indexOf(ovulationDay) + 1;
        }
        
        // Estimate from fertile days
        const fertileDays = cycle.filter(day => day.type === 'fertile' || day.type === 'ovulation');
        if (fertileDays.length > 0) {
          const midFertile = Math.floor(fertileDays.length / 2);
          return cycle.indexOf(fertileDays[midFertile]) + 1;
        }
        
        return null;
      }).filter(day => day !== null);

      // Learn flow patterns
      const flowPatterns = {};
      completeCycles.forEach(cycle => {
        const periodDays = cycle.filter(day => day.type === 'period');
        periodDays.forEach((day, index) => {
          const dayNum = index + 1;
          if (!flowPatterns[dayNum]) flowPatterns[dayNum] = {};
          if (!flowPatterns[dayNum][day.flow]) flowPatterns[dayNum][day.flow] = 0;
          flowPatterns[dayNum][day.flow]++;
        });
      });

      // Calculate cycle regularity
      const cycleVariance = calculateVariance(cycleLengths);
      const regularity = cycleVariance < 3 ? 'regular' : cycleVariance < 7 ? 'somewhat_regular' : 'irregular';

      // Update user profile with enhanced learning data
      const updatedLearningData = {
        cycleLengths: cycleLengths.slice(-12), // Keep last 12 cycles
        periodLengths: periodLengths.slice(-12),
        ovulationDays: ovulationDays.slice(-12),
        flowPatterns,
        totalCycles: completeCycles.length,
        cycleRegularity: regularity,
        lastLearningUpdate: new Date(),
        averages: {
          cycleLength: Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length),
          periodLength: Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length),
          ovulationDay: ovulationDays.length > 0 ? Math.round(ovulationDays.reduce((a, b) => a + b, 0) / ovulationDays.length) : null
        }
      };

      // Update profile
      userProfile.learningData = updatedLearningData;
      userProfile.cycleLength = updatedLearningData.averages.cycleLength;
      userProfile.periodLength = updatedLearningData.averages.periodLength;
      userProfile.lastUpdated = new Date();
      userProfile.dataPoints = confirmedData.length;

      await userProfile.save();

      // Regenerate all future predictions based on new learning
      await regenerateAllPredictions(userId, userProfile);

      console.log(`Learning update completed for user ${userId}:`, {
        cycles: completeCycles.length,
        avgCycleLength: updatedLearningData.averages.cycleLength,
        avgPeriodLength: updatedLearningData.averages.periodLength,
        regularity
      });
    }

  } catch (err) {
    console.error('Error in enhanced learning update:', err);
  }
}

function groupIntoCycles(cycleDays) {
  const cycles = [];
  let currentCycle = [];

  cycleDays.forEach((day, index) => {
    if (day.type === 'period' && currentCycle.length > 0) {
      // Check if this is likely a new cycle (more than 20 days since last period start)
      const lastPeriodInCycle = currentCycle.find(d => d.type === 'period');
      if (lastPeriodInCycle) {
        const daysDiff = Math.abs(new Date(day.date) - new Date(lastPeriodInCycle.date)) / (1000 * 60 * 60 * 24);
        if (daysDiff > 20) {
          cycles.push(currentCycle);
          currentCycle = [day];
        } else {
          currentCycle.push(day);
        }
      } else {
        cycles.push(currentCycle);
        currentCycle = [day];
      }
    } else {
      currentCycle.push(day);
    }
  });

  if (currentCycle.length > 0) {
    cycles.push(currentCycle);
  }

  return cycles.filter(cycle => cycle.length > 15); // Only reasonably complete cycles
}

async function regenerateAllPredictions(userId, userProfile) {
  try {
    // Find the most recent confirmed period start
    const lastConfirmedPeriod = await CycleDay.findOne({
      userId,
      type: 'period',
      isConfirmed: true
    }).sort({ date: -1 });

    if (!lastConfirmedPeriod) return;

    // Clear all future predictions (keep confirmed data)
    const today = new Date().toISOString().split('T')[0];
    await CycleDay.deleteMany({
      userId,
      isPrediction: true,
      date: { $gte: today }
    });

    // Generate new predictions based on learned patterns
    const predictions = generateCyclePredictions(
      new Date(lastConfirmedPeriod.date), 
      userProfile, 
      4 // Generate 4 cycles ahead with learned data
    );

    // Only insert future predictions
    const futurePredictions = predictions.filter(p => p.date >= today);

    if (futurePredictions.length > 0) {
      const cycleDays = futurePredictions.map(day => ({
        userId,
        date: day.date,
        type: day.type,
        flow: day.flow,
        phase: day.phase,
        cycleDay: day.cycleDay,
        isPrediction: true,
        confidence: day.confidence,
        level: day.level,
        generatedAt: new Date()
      }));

      await CycleDay.insertMany(cycleDays);

      // Update notifications with new predictions
      await NotificationService.updateNotifications(userId, futurePredictions);
    }

    console.log(`Regenerated ${futurePredictions.length} predictions for user ${userId}`);

  } catch (err) {
    console.error('Error regenerating predictions:', err);
  }
}

// GET /api/cycles/insights - Enhanced insights
exports.getCycleInsights = async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ userId: req.user.id });
    
    const recentData = await CycleDay.find({
      userId: req.user.id,
      isConfirmed: true,
      date: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } // Last 6 months
    }).sort({ date: 1 });

    const learningData = userProfile?.learningData || {};
    
    const insights = {
      cycleLength: learningData.averages?.cycleLength || userProfile?.cycleLength || DEFAULT_CYCLE_PARAMS.cycleLength,
      periodLength: learningData.averages?.periodLength || userProfile?.periodLength || DEFAULT_CYCLE_PARAMS.periodLength,
      ovulationDay: learningData.averages?.ovulationDay,
      dataPoints: recentData.length,
      totalCycles: learningData.totalCycles || 0,
      cycleRegularity: learningData.cycleRegularity || calculateCycleRegularity(recentData),
      predictionAccuracy: await calculatePredictionAccuracy(req.user.id),
      commonSymptoms: getCommonSymptoms(recentData),
      learningStats: {
        cycleLengthVariance: learningData.cycleLengths ? calculateVariance(learningData.cycleLengths) : 0,
        isLearning: learningData.totalCycles >= 2,
        confidenceLevel: Math.min(learningData.totalCycles / 6, 1) * 100
      },
      nextPredictions: await getUpcomingPredictions(req.user.id)
    };

    res.json(insights);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

async function calculatePredictionAccuracy(userId) {
  try {
    // Get predictions that were later confirmed
    const confirmedDays = await CycleDay.find({
      userId,
      isConfirmed: true,
      confirmedAt: { $exists: true }
    });

    let totalPredictions = 0;
    let correctPredictions = 0;

    for (const day of confirmedDays) {
      // Check if there was a prediction for this date
      const prediction = await CycleDay.findOne({
        userId,
        date: day.date,
        isPrediction: true,
        generatedAt: { $lt: day.confirmedAt }
      });

      if (prediction) {
        totalPredictions++;
        
        // Check if prediction was accurate
        if (prediction.type === day.type) {
          correctPredictions++;
        }
      }
    }

    return totalPredictions > 0 ? (correctPredictions / totalPredictions) : 0;

  } catch (err) {
    console.error('Error calculating prediction accuracy:', err);
    return 0;
  }
}

async function getUpcomingPredictions(userId) {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const predictions = await CycleDay.find({
    userId,
    isPrediction: true,
    date: { $gte: today, $lte: nextMonth.toISOString().split('T')[0] }
  }).sort({ date: 1 });

  // Group by type for summary
  const summary = {
    nextPeriod: predictions.find(p => p.type === 'period'),
    nextOvulation: predictions.find(p => p.type === 'ovulation'),
    fertileWindow: predictions.filter(p => p.type === 'fertile' || p.type === 'ovulation')
  };

  return summary;
}

function getCommonSymptoms(cycleDays) {
  const symptomCounts = {};
  
  cycleDays.forEach(day => {
    if (day.symptoms && day.symptoms.length > 0) {
      day.symptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    }
  });

  return Object.entries(symptomCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([symptom, count]) => ({ 
      symptom, 
      frequency: count,
      percentage: Math.round((count / cycleDays.length) * 100)
    }));
}

function calculateCycleRegularity(cycleDays) {
  const cycles = groupIntoCycles(cycleDays);
  if (cycles.length < 2) return 'insufficient_data';
  
  const lengths = cycles.map(cycle => cycle.length);
  const variance = calculateVariance(lengths);
  
  if (variance < 2) return 'very_regular';
  if (variance < 4) return 'regular';
  if (variance < 8) return 'somewhat_irregular';
  return 'irregular';
}

function calculateVariance(numbers) {
  if (numbers.length === 0) return 0;
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const squareDiffs = numbers.map(num => Math.pow(num - mean, 2));
  return squareDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
}

module.exports = exports;