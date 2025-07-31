import {
  Calendar,
  Heart,
  Droplets,
  Moon,
  Sun,
  TrendingUp,
  Activity,
  Bell,
  Target,
  Sparkles,
  Zap,
  Thermometer,
  Brain,
  Apple,
  Dumbbell,
  ChevronRight,
  ArrowRight,
  Coffee,
  Smile,
  AlertCircle,
  Star,
  Plus,
  Edit3,
  BarChart3,
  Calendar as CalendarIcon,
} from "lucide-react";
import axiosInstance from "../api/axios";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cycleData, setCycleData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [todaysMetrics, setTodaysMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextPeriodInfo, setNextPeriodInfo] = useState(null);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const todayData = await axiosInstance("/cycle-days/today");
        setCycleData(todayData.data || todayData);

        const insightsData = await axiosInstance("/cycles/insights");
        setInsights(insightsData.data);

        const today = formatDateKey(new Date());
        const metricsData = await axiosInstance(`/cycle-days?date=${today}`);
        setTodaysMetrics(metricsData.days?.[0] || metricsData.data);

        if (insightsData.nextPredictions?.nextPeriod) {
          const nextPeriod = insightsData.nextPredictions.nextPeriod;
          const nextDate = new Date(nextPeriod.date);
          const today = new Date();
          nextDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          const diffTime = nextDate - today;
          const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setNextPeriodInfo({
            daysUntil: daysUntil,
            date: nextDate,
            confidence: nextPeriod.confidence,
          });
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQuickLogSubmit = async (logData) => {
    try {
      const today = formatDateKey(new Date());

      // Prepare the data based on the selected metric
      let submitData = {
        date: today,
        isConfirmed: true,
      };

      // Add specific data based on the metric type
      if (selectedMetric?.label === t("period")) {
        submitData.flow = logData.flow;
        submitData.type = "period";
        // Determine phase based on cycle day or default to menstrual for period
        submitData.phase = "menstrual";
      } else if (selectedMetric?.label === t("mood")) {
        // Convert numeric mood (1-10) to enum values
        const moodValue = parseInt(logData.mood);
        if (moodValue >= 9) submitData.mood = "great";
        else if (moodValue >= 7) submitData.mood = "good";
        else if (moodValue >= 5) submitData.mood = "okay";
        else if (moodValue >= 3) submitData.mood = "low";
        else submitData.mood = "terrible";

        submitData.type = "luteal"; // Default type when logging mood
        submitData.phase = cycleData?.phase || "luteal";
      } else if (selectedMetric?.label === t("symptoms")) {
        submitData.symptoms = logData.symptoms;
        submitData.type = cycleData?.type || "luteal";
        submitData.phase = cycleData?.phase || "luteal";
      } else if (selectedMetric?.label === t("wellness")) {
        // Handle energy and sleep tracking
        if (logData.energy) {
          submitData.energy = logData.energy;
        }
        if (logData.sleep) {
          submitData.sleep = logData.sleep;
        }
        submitData.type = cycleData?.type || "luteal";
        submitData.phase = cycleData?.phase || "luteal";
      }

      // Always include notes if they exist
      if (logData.notes && logData.notes.trim()) {
        submitData.notes = logData.notes.trim();
      }

      // Always include symptoms if they exist (for any type of log)
      if (logData.symptoms && logData.symptoms.length > 0) {
        submitData.symptoms = logData.symptoms;
      }

      console.log("Submitting data:", submitData);
      const response = await axiosInstance.post("/cycle-days", submitData);

      // Update local state based on what was logged
      if (selectedMetric?.label === t("mood")) {
        setTodaysMetrics((prev) => ({
          ...prev,
          mood: submitData.mood,
          notes: logData.notes,
        }));
      } else if (selectedMetric?.label === t("period")) {
        setTodaysMetrics((prev) => ({
          ...prev,
          flow: logData.flow,
          type: "period",
          notes: logData.notes,
        }));
      } else if (selectedMetric?.label === t("symptoms")) {
        setTodaysMetrics((prev) => ({
          ...prev,
          symptoms: logData.symptoms,
          notes: logData.notes,
        }));
      } else if (selectedMetric?.label === t("wellness")) {
        setTodaysMetrics((prev) => ({
          ...prev,
          energy: logData.energy,
          sleep: logData.sleep,
          notes: logData.notes,
        }));
      }

      // Refresh cycle data if it's period related
      if (selectedMetric?.label === t("period")) {
        const todayData = await axiosInstance.get("/cycle-days/today");
        setCycleData(todayData.data || todayData);
      }

      setSuccessMessage(t("dataSaved") || "Data saved successfully!");
      setShowQuickLog(false);
      setSelectedMetric(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error saving cycle data:", err);
      setError(err.response?.data?.message || err.message || t("saveError"));
    }
  };

  const getPhaseInfo = () => {
    if (!cycleData)
      return {
        name: t("loading"),
        icon: Moon,
        color: "text-purple-500",
        bgColor: "from-slate-500/20 to-purple-500/20",
        description: t("loadingPhaseData"),
        tips: "",
      };

    const phases = {
      menstrual: {
        name: t("menstrual"),
        icon: Droplets,
        color: "text-rose-500",
        bgColor: "from-rose-500/20 to-pink-500/20",
        description: t("restAndRecharge"),
        tips: t("selfCareTips"),
      },
      follicular: {
        name: t("follicular"),
        icon: Sun,
        color: "text-yellow-500",
        bgColor: "from-yellow-500/20 to-orange-500/20",
        description: t("energyBuilding"),
        tips: t("newProjects"),
      },
      ovulation: {
        name: t("ovulation"),
        icon: Star,
        color: "text-green-500",
        bgColor: "from-green-500/20 to-emerald-500/20",
        description: t("peakFertilityDesc"),
        tips: t("socialConfidence"),
      },
      luteal: {
        name: t("luteal"),
        icon: Moon,
        color: "text-purple-500",
        bgColor: "from-purple-500/20 to-indigo-500/20",
        description: t("preparationPhase"),
        tips: t("reflectionTime"),
      },
    };

    return phases[cycleData.phase] || phases.luteal;
  };

  const handleQuickLog = (type) => {
    setSelectedMetric(type);
    setShowQuickLog(true);
    setError(null);
  };

  const [modalError, setModalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const QuickLogModal = () => {
    const [logData, setLogData] = useState({
      flow: "medium",
      mood: todaysMetrics?.mood || 5,
      energy: todaysMetrics?.energy || "",
      sleep: todaysMetrics?.sleep || "",
      symptoms: todaysMetrics?.symptoms || [],
      notes: todaysMetrics?.notes || "",
    });

    // Reset form data when modal opens or metric changes
    useEffect(() => {
      if (showQuickLog && selectedMetric) {
        setLogData({
          flow: todaysMetrics?.flow || "medium",
          mood: todaysMetrics?.mood || 5,
          energy: todaysMetrics?.energy || "",
          sleep: todaysMetrics?.sleep || "",
          symptoms: todaysMetrics?.symptoms || [],
          notes: todaysMetrics?.notes || "",
        });
        setModalError(null);
      }
    }, [showQuickLog, selectedMetric, todaysMetrics]);

    const symptomOptions = [
      "cramps",
      "bloating",
      "headache",
      "mood swings",
      "fatigue",
      "tender breasts",
      "acne",
      "nausea",
      "back pain",
      "cravings",
      "irritability",
      "anxiety",
    ];

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setModalError(null);

      try {
        await handleQuickLogSubmit(logData);
      } catch (error) {
        console.error("Error submitting log:", error);
        setModalError(error.message || t("saveError"));
      } finally {
        setIsSubmitting(false);
      }
    };

    if (!showQuickLog) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              {t("log")} {selectedMetric?.label || t("data")}
            </h3>
            <button
              onClick={() => {
                setShowQuickLog(false);
                setSelectedMetric(null);
                setModalError(null);
                setError(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {modalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {modalError}
              </div>
            )}
            {selectedMetric?.label === t("period") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("flowLevel")}
                </label>
                <select
                  value={logData.flow}
                  onChange={(e) =>
                    setLogData({ ...logData, flow: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="spotting">{t("spotting")}</option>
                  <option value="light">{t("light")}</option>
                  <option value="medium">{t("medium")}</option>
                  <option value="heavy">{t("heavy")}</option>
                </select>
              </div>
            )}

            {selectedMetric?.label === t("mood") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("mood")} (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={logData.mood}
                  onChange={(e) =>
                    setLogData({ ...logData, mood: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">
                  {logData.mood}/10
                </div>
              </div>
            )}

            {selectedMetric?.label === t("wellness") && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("energy")}
                  </label>
                  <select
                    value={logData.energy}
                    onChange={(e) =>
                      setLogData({ ...logData, energy: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">{t("selectEnergyLevel")}</option>
                    <option value="very_high">{t("veryHigh")}</option>
                    <option value="high">{t("high")}</option>
                    <option value="normal">{t("normal")}</option>
                    <option value="low">{t("low")}</option>
                    <option value="very_low">{t("veryLow")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("sleep")}
                  </label>
                  <select
                    value={logData.sleep}
                    onChange={(e) =>
                      setLogData({ ...logData, sleep: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">{t("selectSleepQuality")}</option>
                    <option value="excellent">{t("excellent")}</option>
                    <option value="good">{t("good")}</option>
                    <option value="fair">{t("fair")}</option>
                    <option value="poor">{t("poor")}</option>
                    <option value="terrible">{t("terrible")}</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("symptoms")} ({t("optional")})
              </label>
              <div className="grid grid-cols-2 gap-2">
                {symptomOptions.map((symptom) => (
                  <label key={symptom} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={logData.symptoms.includes(symptom)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLogData({
                            ...logData,
                            symptoms: [...logData.symptoms, symptom],
                          });
                        } else {
                          setLogData({
                            ...logData,
                            symptoms: logData.symptoms.filter(
                              (s) => s !== symptom
                            ),
                          });
                        }
                      }}
                      className="text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm capitalize">
                      {t(symptom.replace(/\s+/g, "_")) ||
                        symptom.replace(/\s+/g, " ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("notes")} ({t("optional")})
              </label>
              <textarea
                value={logData.notes}
                onChange={(e) =>
                  setLogData({ ...logData, notes: e.target.value })
                }
                placeholder={t("additionalNotes")}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows="3"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("saving") || "Saving..." : t("saveEntry")}
            </button>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">{t("loadingDashboard")}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <div className="text-white text-xl mb-2">{t("errorOccurred")}</div>
          <div className="text-white/70">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            {t("tryAgain")}
          </button>
        </div>
      </div>
    );
  }

  if (!cycleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center">
        <div className="text-center">
          <CalendarIcon className="w-16 h-16 text-white/60 mx-auto mb-4" />
          <div className="text-white text-xl mb-2">{t("welcomeToTracker")}</div>
          <div className="text-white/70 mb-6">{t("startByLogging")}</div>
          <button
            onClick={() => setShowQuickLog(true)}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            {t("getStarted")}
          </button>
        </div>
      </div>
    );
  }

  const currentPhase = getPhaseInfo();

  const quickActions = [
    { icon: Droplets, label: t("period"), color: "from-rose-500 to-pink-500" },
    { icon: Brain, label: t("mood"), color: "from-purple-500 to-indigo-500" },
    {
      icon: Activity,
      label: t("symptoms"),
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Apple,
      label: t("wellness"),
      color: "from-green-500 to-emerald-500",
    },
  ];

  const healthMetrics = [
    {
      icon: Heart,
      label: t("cycleRegularityTitle"),
      value: insights?.cycleRegularity
        ? t(insights.cycleRegularity)
        : t("regular"),
      trend: "up",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Target,
      label: t("predictionAccuracy"),
      value: `${Math.round((insights?.predictionAccuracy || 0.87) * 100)}%`,
      trend: "up",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendingUp,
      label: t("confidenceLevel"),
      value: `${Math.round(insights?.learningStats?.confidenceLevel || 75)}%`,
      trend: "stable",
      color: "from-purple-500 to-indigo-500",
    },
  ];

  const recommendations = [
    {
      icon: Apple,
      title: t("nutritionFocus"),
      description:
        currentPhase.name === t("menstrual")
          ? t("increaseIron")
          : t("focusProtein"),
      category: "nutrition",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Dumbbell,
      title: t("exerciseTip"),
      description:
        currentPhase.name === t("menstrual")
          ? t("lightYoga")
          : t("highIntensity"),
      category: "fitness",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Coffee,
      title: t("wellness"),
      description:
        currentPhase.name === t("luteal")
          ? t("reduceCaffeine")
          : t("stayHydrated"),
      category: "lifestyle",
      color: "from-purple-500 to-indigo-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-pink-800/30"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 p-4 max-w-6xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="fixed top-4 left-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t("gmorning")}! ✨
          </h1>
          <p className="text-white/80 text-lg">
            {t("cycleDay")} {cycleData.currentCycleDay || cycleData.cycleDay}
          </p>
        </div>

        {/* Current Phase Card */}
        <div className="relative mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-white to-white/10 rounded-3xl blur opacity-50"></div>
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <currentPhase.icon
                    className={`w-8 h-8 ${currentPhase.color}`}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {currentPhase.name} {t("phase")}
                  </h2>
                  <p className="text-slate-600">{currentPhase.description}</p>
                  <p className="text-slate-500 text-sm mt-1">
                    {currentPhase.tips}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-800">
                  {nextPeriodInfo?.daysUntil ||
                    insights?.cycleLength -
                      (cycleData.currentCycleDay || cycleData.cycleDay)}
                </div>
                <div className="text-slate-600 text-sm">
                  {t("daysUntilPeriod")}
                </div>
                {nextPeriodInfo?.confidence && (
                  <div className="text-xs text-slate-500 mt-1">
                    {Math.round(nextPeriodInfo.confidence * 100)}%{" "}
                    {t("confident")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: Calendar,
              label: t("cycleDay"),
              value: cycleData.currentCycleDay || cycleData.cycleDay,
              subtitle: `${t("cycleDayOf")} ${insights?.cycleLength || 28}`,
              color: "from-purple-500 to-pink-500",
            },
            {
              icon: Droplets,
              label: t("nextPeriod"),
              value:
                nextPeriodInfo?.daysUntil ||
                insights?.cycleLength -
                  (cycleData.currentCycleDay || cycleData.cycleDay),
              subtitle: t("days"),
              color: "from-rose-500 to-pink-500",
            },
            {
              icon: Heart,
              label: t("fertility"),
              value:
                cycleData.type === "ovulation"
                  ? t("peak")
                  : cycleData.type === "fertile"
                  ? t("high")
                  : t("low"),
              subtitle:
                cycleData.type === "ovulation"
                  ? t("ovulatingToday")
                  : cycleData.type === "fertile"
                  ? t("fertileWindow")
                  : t("lowFertility"),
              color: "from-green-500 to-emerald-500",
            },
            {
              icon: TrendingUp,
              label: t("dataPoints"),
              value: insights?.dataPoints || 0,
              subtitle: t("daysTracked"),
              color: "from-blue-500 to-cyan-500",
            },
          ].map((stat, index) => (
            <div key={index} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-white to-white/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/95 transition-all duration-300">
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r ${stat.color} rounded-full mb-3 shadow-lg`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {stat.value}
                </div>
                <div className="text-slate-600 text-sm">{stat.subtitle}</div>
                <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Insights Card */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-3xl blur opacity-50"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">
                  {t("todaysInsights")}
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      id: 1,
                      icon: Activity,
                      title: t("cycleAccuracy"),
                      message: `${t("predictionAccuracy")}: ${Math.round(
                        (insights?.predictionAccuracy || 0.87) * 100
                      )}%`,
                      color: "from-blue-500 to-cyan-500",
                      priority:
                        (insights?.predictionAccuracy || 0.87) > 0.8
                          ? "high"
                          : "medium",
                    },
                    {
                      id: 2,
                      icon: Heart,
                      title: t("cycleRegularity"),
                      message:
                        insights?.cycleRegularity === "insufficient_data"
                          ? t("trackMoreCycles")
                          : `${t("yourCyclesAre")} ${t(
                              insights?.cycleRegularity || "regular"
                            )}`,
                      color:
                        insights?.cycleRegularity === "insufficient_data"
                          ? "from-yellow-500 to-amber-500"
                          : "from-green-500 to-emerald-500",
                      priority: "medium",
                    },
                    {
                      id: 3,
                      icon: Calendar,
                      title: t("cycleDetails"),
                      message: `${t("average")}: ${
                        insights?.cycleLength || 28
                      } ${t("days")} | ${t("period")}: ${
                        insights?.periodLength || 5
                      } ${t("days")}`,
                      color: "from-purple-500 to-indigo-500",
                      priority: "low",
                    },
                    ...(insights?.commonSymptoms &&
                    insights.commonSymptoms.length > 0
                      ? [
                          {
                            id: 4,
                            icon: AlertCircle,
                            title: t("commonSymptoms"),
                            message: `${t(
                              "mostReported"
                            )}: ${insights.commonSymptoms
                              .slice(0, 3)
                              .map((s) => t(s.symptom || s))
                              .join(", ")}`,
                            color: "from-rose-500 to-pink-500",
                            priority: "medium",
                          },
                        ]
                      : []),
                  ].map((insight) => (
                    <div
                      key={insight.id}
                      className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200"
                    >
                      <div
                        className={`p-2 bg-gradient-to-r ${insight.color} rounded-lg`}
                      >
                        <insight.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm">
                          {insight.title}
                        </h4>
                        <p className="text-white/70 text-sm">
                          {insight.message}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Health Metrics */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-3xl blur opacity-50"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">
                  {t("healthMetrics")}
                </h3>
                <div className="grid gap-4">
                  {healthMetrics.map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 bg-gradient-to-r ${metric.color} rounded-lg`}
                        >
                          <metric.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-medium">
                          {metric.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">
                          {metric.value}
                        </span>
                        <TrendingUp
                          className={`w-4 h-4 ${
                            metric.trend === "up"
                              ? "text-green-400"
                              : "text-white/40"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <QuickLogModal />
            {/* Quick Actions */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-3xl blur opacity-50"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">
                  {t("quickLog")}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickLog(action)}
                      className={`p-4 bg-gradient-to-r ${action.color} rounded-xl text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex flex-col items-center space-y-2`}
                    >
                      <action.icon className="w-6 h-6" />
                      <span className="text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Today's Mood */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-3xl blur opacity-50"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">
                  {t("todaysMood")}
                </h3>
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {typeof todaysMetrics?.mood === "string"
                      ? todaysMetrics.mood === "great"
                        ? "😊"
                        : todaysMetrics.mood === "good"
                        ? "🙂"
                        : todaysMetrics.mood === "okay"
                        ? "😐"
                        : todaysMetrics.mood === "low"
                        ? "😔"
                        : "😢"
                      : todaysMetrics?.mood >= 8
                      ? "�"
                      : todaysMetrics?.mood >= 6
                      ? "🙂"
                      : todaysMetrics?.mood >= 4
                      ? "�"
                      : "😔"}
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {typeof todaysMetrics?.mood === "string"
                      ? todaysMetrics.mood === "great"
                        ? t("great")
                        : todaysMetrics.mood === "good"
                        ? t("good")
                        : todaysMetrics.mood === "okay"
                        ? t("okay")
                        : todaysMetrics.mood === "low"
                        ? t("low")
                        : t("terrible")
                      : `${todaysMetrics?.mood || 7}/10`}
                  </div>
                  <div className="text-white/70 text-sm">
                    {(
                      typeof todaysMetrics?.mood === "string"
                        ? ["great", "good"].includes(todaysMetrics.mood)
                        : todaysMetrics?.mood >= 7
                    )
                      ? t("feelingGood")
                      : (
                          typeof todaysMetrics?.mood === "string"
                            ? todaysMetrics.mood === "okay"
                            : todaysMetrics?.mood >= 5
                        )
                      ? t("okayDay")
                      : t("selfCare")}
                  </div>
                </div>
                <div className="mt-4 flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const currentMood =
                      typeof todaysMetrics?.mood === "string"
                        ? todaysMetrics.mood === "great"
                          ? 10
                          : todaysMetrics.mood === "good"
                          ? 8
                          : todaysMetrics.mood === "okay"
                          ? 6
                          : todaysMetrics.mood === "low"
                          ? 4
                          : 2
                        : todaysMetrics?.mood || 7;

                    return (
                      <div
                        key={num}
                        className={`w-3 h-3 rounded-full transition-all ${
                          num <= currentMood
                            ? "bg-gradient-to-r from-green-400 to-blue-500"
                            : "bg-white/20"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-3xl blur opacity-50"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">
                  {t("upcoming")}
                </h3>
                <div className="space-y-3">
                  {insights?.nextPredictions?.nextOvulation && (
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                      <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                        <Sun className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">
                          {t("ovulation")}
                        </div>
                        <div className="text-white/70 text-xs">
                          {new Date(
                            insights.nextPredictions.nextOvulation.date
                          ).toLocaleDateString(i18n.language)}
                        </div>
                      </div>
                      <div className="ml-auto text-white/60 text-xs">
                        {insights.nextPredictions.nextOvulation.daysUntil}{" "}
                        {t("days")}
                      </div>
                    </div>
                  )}

                  {insights?.nextPredictions?.nextPeriod && (
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                      <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg">
                        <Droplets className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">
                          {t("nextPeriod")}
                        </div>
                        <div className="text-white/70 text-xs">
                          {new Date(
                            insights.nextPredictions.nextPeriod.date
                          ).toLocaleDateString(i18n.language)}
                        </div>
                      </div>
                      <div className="ml-auto text-white/60 text-xs">
                        {insights.nextPredictions.nextPeriod.daysUntil}{" "}
                        {t("days")}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">
                        {t("reminder")}
                      </div>
                      <div className="text-white/70 text-xs">
                        {t("takeVitamins")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cycle Progress */}
        <div className="relative mt-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-3xl blur opacity-50"></div>
          <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">
              {t("cycleProgress")}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">
                  {t("day")} {cycleData.currentCycleDay || cycleData.cycleDay}{" "}
                  {t("cycleDayOf")} {insights?.cycleLength || 28}
                </span>
                <span className="text-white font-medium">
                  {Math.round(
                    ((cycleData.currentCycleDay || cycleData.cycleDay) /
                      (insights?.cycleLength || 28)) *
                      100
                  )}
                  %
                </span>
              </div>

              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${
                      ((cycleData.currentCycleDay || cycleData.cycleDay) /
                        (insights?.cycleLength || 28)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                {["menstrual", "follicular", "ovulation", "luteal"].map(
                  (phase) => (
                    <div
                      key={phase}
                      className={`text-center p-2 rounded ${
                        currentPhase.name === t(phase)
                          ? `bg-${
                              phase === "menstrual"
                                ? "rose"
                                : phase === "follicular"
                                ? "yellow"
                                : phase === "ovulation"
                                ? "green"
                                : "purple"
                            }-500/30 text-white`
                          : "text-white/60"
                      }`}
                    >
                      {t(phase)}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Learning Progress Banner */}
        {insights?.learningStats?.isLearning && (
          <div className="mt-8 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl blur"></div>
            <div className="relative bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold">
                    {t("learningProgress")}
                  </h4>
                  <p className="text-white/80 text-sm">
                    {t("gettingMoreAccurate")} {t("confidenceLevel")}:{" "}
                    {Math.round(insights.learningStats.confidenceLevel)}%
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {insights.totalCycles}
                  </div>
                  <div className="text-white/70 text-xs">
                    {t("cyclesLearned")}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm text-white/80 mb-1">
                  <span>{t("learningProgress")}</span>
                  <span>
                    {Math.round(insights.learningStats.confidenceLevel)}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-1000"
                    style={{
                      width: `${insights.learningStats.confidenceLevel}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Today's Summary Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-white">
              {cycleData.type === "ovulation" &&
                "Peak fertility day - stay hydrated!"}
              {cycleData.type === "period" &&
                "Self-care time - be gentle with yourself"}
              {cycleData.type === "fertile" &&
                "Fertile window - high energy ahead!"}
              {cycleData.type === "luteal" &&
                "Reflection phase - great for planning"}
              {!["ovulation", "period", "fertile", "luteal"].includes(
                cycleData.type
              ) && "Keep tracking - every data point helps!"}
            </span>
          </div>

          {/* Recommendations */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-3xl blur opacity-50"></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Tips</h3>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer"
                  >
                    <div
                      className={`p-2 bg-gradient-to-r ${rec.color} rounded-lg flex-shrink-0`}
                    >
                      <rec.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{rec.title}</h4>
                      <p className="text-white/70 text-sm">{rec.description}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-white/10 rounded-full text-xs text-white/80 capitalize">
                        {rec.category}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40 flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
