const mongoose = require("mongoose");

const UserProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  // Cycle parameters (learned from user's actual data)
  cycleLength: {
    type: Number,
    default: 28,
    min: 21,
    max: 35,
  },

  periodLength: {
    type: Number,
    default: 5,
    min: 2,
    max: 8,
  },

  lutealPhaseLength: {
    type: Number,
    default: 14,
    min: 10,
    max: 16,
  },

  // Personalized flow patterns
  typicalFlowPattern: [
    {
      day: Number, // Day of period (1, 2, 3, etc.)
      flow: {
        type: String,
        enum: ["spotting", "light", "medium", "heavy"],
      },
    },
  ],

  // Common symptoms and their frequency
  commonSymptoms: [
    {
      symptom: String,
      frequency: Number, // How often this symptom occurs (0-1)
      phase: {
        type: String,
        enum: ["menstrual", "follicular", "ovulation", "luteal"],
      },
    },
  ],

  // Data quality metrics
  dataPoints: {
    type: Number,
    default: 0,
  },

  accuracyScore: {
    type: Number,
    default: 0.5,
    min: 0,
    max: 1,
  },

  // Tracking preferences
  preferences: {
    reminderDays: {
      type: Number,
      default: 2, // Days before period to send reminder
    },

    ovulationReminder: {
      type: Boolean,
      default: true,
    },

    symptomReminders: {
      type: Boolean,
      default: false,
    },
  },

  pushSubscriptions: [
    {
      endpoint: {
        type: String,
        required: true,
      },
      keys: {
        p256dh: {
          type: String,
          required: true,
        },
        auth: {
          type: String,
          required: true,
        },
      },
      subscribedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // Timestamps
  lastPeriodStart: Date,
  lastUpdated: {
    type: Date,
    default: Date.now,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate next predicted period start
UserProfileSchema.methods.getNextPredictedPeriod = function () {
  if (!this.lastPeriodStart) return null;

  const nextDate = new Date(this.lastPeriodStart);
  nextDate.setDate(nextDate.getDate() + this.cycleLength);
  return nextDate;
};

// Calculate current cycle day
UserProfileSchema.methods.getCurrentCycleDay = function () {
  if (!this.lastPeriodStart) return null;

  const today = new Date();
  const daysDiff = Math.floor(
    (today - this.lastPeriodStart) / (1000 * 60 * 60 * 24)
  );
  return (daysDiff % this.cycleLength) + 1;
};

// Get current phase
UserProfileSchema.methods.getCurrentPhase = function () {
  const cycleDay = this.getCurrentCycleDay();
  if (!cycleDay) return "unknown";

  if (cycleDay <= this.periodLength) {
    return "menstrual";
  } else if (cycleDay <= this.cycleLength - this.lutealPhaseLength - 6) {
    return "follicular";
  } else if (cycleDay <= this.cycleLength - this.lutealPhaseLength + 1) {
    return "ovulation";
  } else {
    return "luteal";
  }
};

// Update cycle parameters based on new data
UserProfileSchema.methods.updateFromCycleData = async function (cycleDays) {
  const periods = cycleDays.filter((day) => day.type === "period");
  const cycles = this.groupIntoCycles(cycleDays);

  if (cycles.length >= 2) {
    // Update cycle length
    const cycleLengths = cycles.map((cycle) => cycle.length);
    this.cycleLength = Math.round(
      cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length
    );

    // Update period length
    const periodLengths = cycles.map(
      (cycle) => cycle.filter((day) => day.type === "period").length
    );
    this.periodLength = Math.round(
      periodLengths.reduce((sum, len) => sum + len, 0) / periodLengths.length
    );

    // Update flow patterns
    this.updateFlowPattern(periods);

    // Update common symptoms
    this.updateCommonSymptoms(cycleDays);

    this.dataPoints = cycleDays.length;
    this.lastUpdated = new Date();
  }
};

UserProfileSchema.methods.groupIntoCycles = function (cycleDays) {
  const cycles = [];
  let currentCycle = [];

  cycleDays.forEach((day) => {
    if (day.type === "period" && currentCycle.length > 0) {
      cycles.push(currentCycle);
      currentCycle = [day];
    } else {
      currentCycle.push(day);
    }
  });

  if (currentCycle.length > 0) {
    cycles.push(currentCycle);
  }

  return cycles.filter((cycle) => cycle.length > 20);
};

UserProfileSchema.methods.updateFlowPattern = function (periodDays) {
  const flowPattern = {};

  periodDays.forEach((day) => {
    if (day.flow && day.cycleDay) {
      if (!flowPattern[day.cycleDay]) {
        flowPattern[day.cycleDay] = [];
      }
      flowPattern[day.cycleDay].push(day.flow);
    }
  });

  // Calculate most common flow for each day
  this.typicalFlowPattern = Object.entries(flowPattern).map(([day, flows]) => {
    const flowCounts = {};
    flows.forEach((flow) => {
      flowCounts[flow] = (flowCounts[flow] || 0) + 1;
    });

    const mostCommonFlow = Object.entries(flowCounts).sort(
      ([, a], [, b]) => b - a
    )[0][0];

    return {
      day: parseInt(day),
      flow: mostCommonFlow,
    };
  });
};

UserProfileSchema.methods.updateCommonSymptoms = function (cycleDays) {
  const symptomData = {};

  cycleDays.forEach((day) => {
    if (day.symptoms && day.symptoms.length > 0) {
      day.symptoms.forEach((symptom) => {
        if (!symptomData[symptom]) {
          symptomData[symptom] = { count: 0, phases: {} };
        }
        symptomData[symptom].count++;

        if (day.phase) {
          if (!symptomData[symptom].phases[day.phase]) {
            symptomData[symptom].phases[day.phase] = 0;
          }
          symptomData[symptom].phases[day.phase]++;
        }
      });
    }
  });

  const totalDays = cycleDays.length;

  this.commonSymptoms = Object.entries(symptomData)
    .map(([symptom, data]) => {
      const mostCommonPhase = Object.entries(data.phases).sort(
        ([, a], [, b]) => b - a
      )[0];

      return {
        symptom,
        frequency: data.count / totalDays,
        phase: mostCommonPhase ? mostCommonPhase[0] : "unknown",
      };
    })
    .filter((s) => s.frequency > 0.1); // Only include symptoms that occur in >10% of days
};

module.exports = mongoose.model("UserProfile", UserProfileSchema);
