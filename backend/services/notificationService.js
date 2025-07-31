const webpush = require("web-push");
const CycleDay = require("../models/CycleDay");
const UserProfile = require("../models/UserProfile");
const Notification = require("../models/Notification"); // New model needed

// Configure web-push (you'll need to generate VAPID keys)
webpush.setVapidDetails(
  "mailto:l.icyeza@alustudent.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

class NotificationService {
  // Schedule notifications based on predictions
  static async scheduleNotifications(userId, predictions) {
    try {
      // Clear existing scheduled notifications
      await Notification.deleteMany({
        userId,
        status: "scheduled",
        scheduledFor: { $gte: new Date() },
      });

      const userProfile = await UserProfile.findOne({ userId });
      if (!userProfile?.notificationSettings?.enabled) return;

      const settings = userProfile.notificationSettings;
      const notifications = [];

      // Generate notifications based on predictions
      predictions.forEach((prediction) => {
        const predictionDate = new Date(prediction.date);

        // Period reminders
        if (prediction.type === "period" && settings.periodReminders) {
          // 2 days before period
          if (settings.periodAdvanceNotice >= 2) {
            notifications.push({
              userId,
              type: "period_reminder",
              title: "🩸 Period Coming Soon",
              message: `Your period is expected in 2 days. Don't forget to prepare!`,
              scheduledFor: new Date(
                predictionDate.getTime() - 2 * 24 * 60 * 60 * 1000
              ),
              relatedDate: prediction.date,
              confidence: prediction.confidence,
            });
          }

          // Day before period
          if (settings.periodAdvanceNotice >= 1) {
            notifications.push({
              userId,
              type: "period_reminder",
              title: "🩸 Period Tomorrow",
              message: `Your period is expected tomorrow. Time to get ready! Grab a pad or painkiller in case.`,
              scheduledFor: new Date(
                predictionDate.getTime() - 1 * 24 * 60 * 60 * 1000
              ),
              relatedDate: prediction.date,
              confidence: prediction.confidence,
            });
          }

          // Day of period
          notifications.push({
            userId,
            type: "period_start",
            title: "🩸 Period Day",
            message: `Your period is expected to start today. Track it in the app! Buy pads/tampons and painkillers if needed.`,
            scheduledFor: predictionDate,
            relatedDate: prediction.date,
            confidence: prediction.confidence,
          });
        }

        // Fertile window reminders
        if (
          (prediction.type === "fertile" || prediction.type === "ovulation") &&
          settings.fertileReminders
        ) {
          if (prediction.type === "fertile" && prediction.level === "high") {
            notifications.push({
              userId,
              type: "fertile_window",
              title: "💚 High Fertility",
              message: `You're in your fertile window with high fertility today! Remember to buy protection if any activity is planned.`,
              scheduledFor: predictionDate,
              relatedDate: prediction.date,
              confidence: prediction.confidence,
            });
          }

          if (prediction.type === "ovulation") {
            notifications.push({
              userId,
              type: "ovulation",
              title: "🌟 Ovulation Day",
              message: `Today is your predicted ovulation day - peak fertility! Remember to buy protection if any activity is planned.`,
              scheduledFor: predictionDate,
              relatedDate: prediction.date,
              confidence: prediction.confidence,
            });
          }
        }

        // Cycle insights
        if (prediction.cycleDay === 1 && settings.cycleInsights) {
          notifications.push({
            userId,
            type: "cycle_start",
            title: "🔄 New Cycle Beginning",
            message: `Starting cycle day 1. Track your symptoms and mood!`,
            scheduledFor: predictionDate,
            relatedDate: prediction.date,
            confidence: prediction.confidence,
          });
        }
      });

      // Filter notifications to only future dates
      const futureNotifications = notifications.filter(
        (n) => n.scheduledFor > new Date()
      );

      // Save scheduled notifications
      if (futureNotifications.length > 0) {
        await Notification.insertMany(
          futureNotifications.map((notif) => ({
            ...notif,
            status: "scheduled",
            createdAt: new Date(),
          }))
        );
      }

      return futureNotifications.length;
    } catch (error) {
      console.error("Error scheduling notifications:", error);
      throw error;
    }
  }

  // Update notifications when predictions change
  static async updateNotifications(userId, newPredictions) {
    return await this.scheduleNotifications(userId, newPredictions);
  }

  // Send due notifications (run this in a cron job)
  static async sendDueNotifications() {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      // Find notifications that are due
      const dueNotifications = await Notification.find({
        status: "scheduled",
        scheduledFor: {
          $gte: fiveMinutesAgo,
          $lte: now,
        },
      }).populate("userId", "pushSubscriptions notificationSettings");

      for (const notification of dueNotifications) {
        await this.sendPushNotification(notification);

        // Mark as sent
        notification.status = "sent";
        notification.sentAt = new Date();
        await notification.save();
      }

      return dueNotifications.length;
    } catch (error) {
      console.error("Error sending due notifications:", error);
      throw error;
    }
  }

  // Send individual push notification
  static async sendPushNotification(notification) {
    try {
      const userId = notification.userId;
      const user = await UserProfile.findOne({ userId });
      console.log(user);

      if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) {
        console.log(`No push subscriptions for user ${user._id}`);
        return;
      }

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.message,
        icon: "/Hercycle_logo-removebg-preview-2.png",
        badge: "/Hercycle_logo-removebg-preview-2.png",
        tag: notification.type,
        data: {
          type: notification.type,
          relatedDate: notification.relatedDate,
          confidence: notification.confidence,
          url: "/", // or specific URL to open
        },
        actions: [
          {
            action: "track",
            title: "Track Now",
          },
          {
            action: "dismiss",
            title: "Dismiss",
          },
        ],
      });

      // Send to all user's subscriptions
      const sendPromises = user.pushSubscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(subscription, payload);
          return { success: true, subscription: subscription.endpoint };
        } catch (error) {
          console.error("Error sending to subscription:", error);

          // Remove invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            await this.removeInvalidSubscription(user._id, subscription);
          }

          return { success: false, error: error.message };
        }
      });

      const results = await Promise.all(sendPromises);
      const successful = results.filter((r) => r.success).length;

      console.log(
        `Sent notification to ${successful}/${results.length} subscriptions for user ${user._id}`
      );
    } catch (error) {
      console.error("Error in sendPushNotification:", error);
      throw error;
    }
  }

  // Remove invalid push subscription
  static async removeInvalidSubscription(userId, invalidSubscription) {
    try {
      await UserProfile.updateOne(
        { userId },
        {
          $pull: {
            pushSubscriptions: { endpoint: invalidSubscription.endpoint },
          },
        }
      );
      console.log(`Removed invalid subscription for user ${userId}`);
    } catch (error) {
      console.error("Error removing invalid subscription:", error);
    }
  }

  // Subscribe user to push notifications
  static async subscribeToPush(userId, subscription) {
    try {
      const userProfile = await UserProfile.findOne({ userId });
      if (!userProfile) return false;
      const daysToPeriod = Math.ceil(
        (new Date(userProfile.getNextPredictedPeriod()) - new Date()) /
          (1000 * 60 * 60 * 24)
      );

      // Check if subscription already exists
      const existingSubscription = userProfile.pushSubscriptions?.find(
        (sub) => sub.endpoint === subscription.endpoint
      );

      if (!existingSubscription) {
        if (!userProfile.pushSubscriptions) {
          userProfile.pushSubscriptions = [];
        }

        userProfile.pushSubscriptions.push({
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          subscribedAt: new Date(),
        });

        await userProfile.save();

        // Send welcome notification
        await this.sendCustomNotification(
          userId,
          "HerCycle Notifications Enabled",
          "You've successfully subscribed to HerCycle notifications. We'll keep you updated!"
        );
        await this.sendCustomNotification(
          userId,
          "Period Notification",
          `Your next period is in ${daysToPeriod} days.`
        );
      }

      return true;
    } catch (error) {
      console.log("Error subscribing to push:", error);
      return false;
    }
  }

  // Unsubscribe from push notifications
  static async unsubscribeFromPush(userId, endpoint) {
    try {
      await UserProfile.updateOne(
        { userId },
        { $pull: { pushSubscriptions: { endpoint } } }
      );
      return true;
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      return false;
    }
  }

  // Update notification settings
  static async updateNotificationSettings(userId, settings) {
    try {
      const userProfile = await UserProfile.findOne({ userId });
      if (!userProfile) return false;

      userProfile.notificationSettings = {
        ...userProfile.notificationSettings,
        ...settings,
        updatedAt: new Date(),
      };

      await userProfile.save();

      // Reschedule notifications if settings changed
      if (
        settings.enabled !== undefined ||
        settings.periodReminders !== undefined ||
        settings.fertileReminders !== undefined ||
        settings.cycleInsights !== undefined
      ) {
        const today = new Date().toISOString().split("T")[0];
        const predictions = await CycleDay.find({
          userId,
          isPrediction: true,
          date: { $gte: today },
        }).sort({ date: 1 });

        await this.scheduleNotifications(userId, predictions);
      }

      return true;
    } catch (error) {
      console.error("Error updating notification settings:", error);
      return false;
    }
  }

  // Get notification history
  static async getNotificationHistory(userId, limit = 50) {
    try {
      return await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("type title message scheduledFor sentAt status confidence");
    } catch (error) {
      console.error("Error getting notification history:", error);
      return [];
    }
  }

  // Send custom notification
  static async sendCustomNotification(userId, title, message, type = "custom") {
    try {
      const user = await UserProfile.findOne({ userId });
      if (!user?.pushSubscriptions?.length) return false;

      const notification = {
        userId,
        type,
        title,
        message,
        scheduledFor: new Date(),
        status: "scheduled",
      };

      // Save notification
      const savedNotification = await Notification.create(notification);

      // Send immediately
      await this.sendPushNotification(savedNotification);

      // Update status
      savedNotification.status = "sent";
      savedNotification.sentAt = new Date();
      await savedNotification.save();

      return true;
    } catch (error) {
      console.log("Error sending custom notification:", error);
      return false;
    }
  }

  // Daily summary notification
  static async sendDailySummary(userId) {
    try {
      const today = new Date().toISOString().split("T")[0];
      const todayData = await CycleDay.findOne({ userId, date: today });
      const userProfile = await UserProfile.findOne({ userId });

      if (!userProfile?.notificationSettings?.dailySummary) return;

      let title = "📅 Daily Cycle Summary";
      let message = "Good morning! ";

      if (todayData) {
        switch (todayData.type) {
          case "period":
            message += `Today is day ${todayData.cycleDay} of your cycle (period day).`;
            break;
          case "fertile":
            message += `You're in your fertile window today (day ${todayData.cycleDay}).`;
            break;
          case "ovulation":
            message += `Today is ovulation day (day ${todayData.cycleDay})!`;
            break;
          default:
            message += `Today is day ${todayData.cycleDay} of your cycle.`;
        }
      } else {
        message += "Don't forget to track your cycle today!";
      }

      return await this.sendCustomNotification(
        userId,
        title,
        message,
        "daily_summary"
      );
    } catch (error) {
      console.error("Error sending daily summary:", error);
      return false;
    }
  }

  // Reminder to track missed days
  static async sendMissedTrackingReminder(userId) {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const recentEntries = await CycleDay.find({
        userId,
        isConfirmed: true,
        date: { $gte: threeDaysAgo.toISOString().split("T")[0] },
      });

      if (recentEntries.length === 0) {
        return await this.sendCustomNotification(
          userId,
          "📝 Don't Forget to Track",
          "You haven't tracked your cycle in a few days. Keep your predictions accurate by logging daily!",
          "tracking_reminder"
        );
      }

      return false;
    } catch (error) {
      console.error("Error sending missed tracking reminder:", error);
      return false;
    }
  }
}

module.exports = NotificationService;
