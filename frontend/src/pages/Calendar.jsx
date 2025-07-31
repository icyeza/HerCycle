import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Heart,
  Droplets,
  Moon,
  Sun,
  Plus,
  Settings,
  Bell,
  Trash2,
  Target,
  Brain,
  TrendingUp,
} from "lucide-react";
import axios from "../api/axios";
import { toast } from "react-toastify";

const PeriodTrackerCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [cycleDays, setCycleDays] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInitModal, setShowInitModal] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [modalData, setModalData] = useState({
    type: "period",
    flow: "medium",
    symptoms: [],
    notes: "",
  });
  const [initData, setInitData] = useState({
    lastPeriodStart: "",
  });
  const [confirmedCount, setConfirmedCount] = useState(0);

  useEffect(() => {
    fetchCycleDays();
    fetchInsights();
  }, []);

  const fetchCycleDays = async () => {
    try {
      const response = await axios.get("/cycle-days");
      const daysData = {};
      let confirmedCount = 0;

      response.data.days.forEach((entry) => {
        daysData[entry.date] = {
          ...entry,
          isPrediction: entry.isPrediction || false,
          isConfirmed: entry.isConfirmed || false,
          confidence: entry.confidence || 1,
          phase: entry.phase,
          cycleDay: entry.cycleDay,
        };

        if (entry.isConfirmed) {
          confirmedCount++;
        }
      });

      setCycleDays(daysData);

      setConfirmedCount(confirmedCount);
      // Check if user has any confirmed data to determine if initialized
      setIsInitialized(response.data.days.length > 0);
    } catch (err) {
      console.error("Failed to fetch cycle data", err);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await axios.get("/cycles/insights");
      setInsights(response.data);
    } catch (err) {
      console.error("Failed to fetch insights", err);
    }
  };

  const initializeCycle = async () => {
    if (!initData.lastPeriodStart) return;

    try {
      await axios.post("/cycles/initialize", {
        lastPeriodStart: initData.lastPeriodStart,
      });

      setShowInitModal(false);
      setIsInitialized(true);
      await fetchCycleDays();
      await fetchInsights();
    } catch (error) {
      console.error("Error initializing cycle:", error);
      toast.error("Failed to initialize cycle. Please try again.");
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const symptoms = [
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

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getDayStyle = (dayData) => {
    if (!dayData) return "bg-white/5 hover:bg-white/10 text-black/70";

    const baseStyle = dayData.isPrediction ? "border-2 border-dashed" : "";
    const opacity = dayData.isPrediction ? "opacity-70" : "";

    switch (dayData.type) {
      case "period":
        const flowColors = {
          heavy: `bg-gradient-to-br from-[#f50561] to-red-600 text-white shadow-lg shadow-[#f50561]/30 ${baseStyle} ${opacity}`,
          medium: `bg-gradient-to-br from-[#f50561] to-pink-500 text-white shadow-lg shadow-[#f50561]/20 ${baseStyle} ${opacity}`,
          light: `bg-gradient-to-br from-pink-400 to-pink-500 text-white shadow-md shadow-pink-400/20 ${baseStyle} ${opacity}`,
          spotting: `bg-gradient-to-br from-pink-300 to-pink-400 text-black shadow-sm shadow-pink-300/20 ${baseStyle} ${opacity}`,
        };
        return flowColors[dayData.flow] || flowColors.medium;

      case "fertile":
        const fertileColors = {
          low: `bg-gradient-to-br from-green-300 to-green-400 text-black shadow-sm shadow-green-300/20 ${baseStyle} ${opacity}`,
          medium: `bg-gradient-to-br from-green-400 to-green-500 text-white shadow-md shadow-green-400/20 ${baseStyle} ${opacity}`,
          high: `bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 ${baseStyle} ${opacity}`,
          peak: `bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/30 ${baseStyle} ${opacity}`,
        };
        return fertileColors[dayData.level] || fertileColors.medium;

      case "ovulation":
        return `bg-gradient-to-br from-yellow-400 to-orange-500 text-black shadow-lg shadow-yellow-400/30 ring-2 ring-yellow-300/50 ${baseStyle} ${opacity}`;

      case "luteal":
        return `bg-gradient-to-br from-purple-400 to-purple-500 text-white shadow-md shadow-purple-400/20 ${baseStyle} ${opacity}`;

      case "follicular":
        return `bg-gradient-to-br from-blue-300 to-blue-400 text-black shadow-sm shadow-blue-300/20 ${baseStyle} ${opacity}`;

      default:
        return "bg-white/5 hover:bg-white/10 text-black/70";
    }
  };

  const handleDayClick = (day) => {
    if (!isInitialized) {
      toast.error("Initialize your cycle before adding more data points.")
      return
    }
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    // Don't allow future dates to be selected
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (clickedDate > today) {
      toast.error("Cannot select future dates");
      return;
    }

    setSelectedDate(clickedDate);
    setShowAddModal(true);

    const dateKey = formatDateKey(clickedDate);
    const existingData = cycleDays[dateKey];

    if (existingData) {
      setModalData({
        type: existingData.type,
        flow: existingData.flow || "medium",
        symptoms: existingData.symptoms || [],
        notes: existingData.notes || "",
        level: existingData.level || "medium",
      });
    } else {
      setModalData({
        type: "period",
        flow: "medium",
        symptoms: [],
        notes: "",
        level: "medium",
      });
    }
  };
  const saveData = async () => {
    if (!selectedDate) return;

    const dateKey = formatDateKey(selectedDate);
    console.log(selectedDate);
    const dataToSave = {
      date: dateKey,
      ...modalData,
      actualData: true,
    };

    try {
      let response;
      const existingData = cycleDays[dateKey];

      if (existingData && existingData.isPrediction) {
        // Confirming a prediction
        response = await axios.post("/cycles/cycle-days/confirm", dataToSave);
      } else {
        // Creating new entry
        response = await axios.post("/cycle-days", dataToSave);
      }

      // Update frontend state
      setCycleDays((prev) => ({
        ...prev,
        [dateKey]: {
          ...response.data,
          isPrediction: false,
          isConfirmed: true,
        },
      }));

      setShowAddModal(false);
      setSelectedDate(null);

      // Refresh insights and data after saving
      await fetchInsights();
      setTimeout(() => fetchCycleDays(), 1000); // Refresh after prediction updates
    } catch (error) {
      console.error("Error saving day:", error);
      toast.error("Failed to save. Please try again.");
    }
  };

  const deleteData = async () => {
    if (!selectedDate) return;

    const dateKey = formatDateKey(selectedDate);

    try {
      setCycleDays((prev) => {
        const newData = { ...prev };
        delete newData[dateKey];
        return newData;
      });

      await axios.delete(`/cycle-days/${dateKey}`);

      setShowAddModal(false);
      setSelectedDate(null);
    } catch (error) {
      console.error("Error deleting day:", error);
      toast.error("Delete failed.");
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear();

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 sm:h-16"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dateKey = formatDateKey(date);
      const dayData = cycleDays[dateKey];
      const isToday = isCurrentMonth && day === today.getDate();

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(day)}
          className={`
            h-12 sm:h-16 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative group
            ${getDayStyle(dayData)}
            ${isToday ? "ring-2 ring-white/70" : ""}
            hover:scale-105 hover:shadow-xl
          `}
        >
          <span className="font-semibold text-sm sm:text-base">{day}</span>

          {/* Prediction indicator */}
          {dayData?.isPrediction && (
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 opacity-80 flex items-center justify-center">
              <Brain className="w-2 h-2 text-black" />
            </div>
          )}

          {/* Confirmed data indicator */}
          {dayData?.isConfirmed && (
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 opacity-80 flex items-center justify-center">
              <Target className="w-2 h-2 text-black" />
            </div>
          )}

          {/* Confidence indicator for predictions */}
          {dayData?.isPrediction && dayData?.confidence && (
            <div
              className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                dayData.confidence > 0.8
                  ? "bg-green-400"
                  : dayData.confidence > 0.6
                  ? "bg-yellow-400"
                  : "bg-orange-400"
              }`}
            ></div>
          )}

          {/* Symptoms indicator */}
          {dayData?.symptoms?.length > 0 && (
            <div className="absolute -bottom-1 right-1 w-1 h-1 bg-white/80 rounded-full"></div>
          )}

          {/* Cycle day number */}
          {dayData?.cycleDay && (
            <span className="absolute top-0 left-0 text-[8px] opacity-60 font-mono">
              {dayData.cycleDay}
            </span>
          )}
        </div>
      );
    }

    return days;
  };

  const getPhaseInfo = () => {
    const today = new Date();
    const todayKey = formatDateKey(today);
    const todayData = cycleDays[todayKey];

    if (todayData) {
      switch (todayData.type) {
        case "period":
          return {
            // phase: "Menstrual Phase",
            icon: Droplets,
            color: "text-[#f50561]",
            message: "Take care of yourself today",
            cycleDay: todayData.cycleDay,
            phase: todayData.phase,
          };
        case "fertile":
          return {
            // phase: "Fertile Window",
            icon: Heart,
            color: "text-green-500",
            message: "Peak fertility time",
            cycleDay: todayData.cycleDay,
            phase: todayData.phase,
          };
        case "ovulation":
          return {
            // phase: "Ovulation",
            icon: Sun,
            color: "text-yellow-500",
            message: "Ovulation day",
            cycleDay: todayData.cycleDay,
            phase: todayData.phase,
          };
        case "luteal":
          return {
            // phase: "Luteal Phase",
            icon: Moon,
            color: "text-purple-400",
            message: "Post-ovulation phase",
            cycleDay: todayData.cycleDay,
            phase: todayData.phase,
          };
        default:
          return {
            // phase: "Follicular Phase",
            icon: Moon,
            color: "text-blue-400",
            message: "Energy building phase",
            cycleDay: todayData.cycleDay,
            phase: todayData.phase,
          };
      }
    }

    return {
      // phase: "Tracking Phase",
      icon: Calendar,
      color: "text-gray-400",
      message: "Start tracking your cycle",
      cycleDay: null,
      phase: null,
    };
  };

  const phaseInfo = getPhaseInfo();

  // Calculate next period prediction
  const getNextPeriodInfo = () => {
    const futurePeriodDays = Object.entries(cycleDays)
      .filter(([date, data]) => {
        const dayDate = new Date(date);
        const today = new Date();
        return dayDate > today && data.type === "period" && data.isPrediction;
      })
      .sort(([a], [b]) => new Date(a) - new Date(b));

    if (futurePeriodDays.length > 0) {
      const nextPeriodDate = new Date(futurePeriodDays[0][0]);
      const today = new Date();
      const daysUntil = Math.ceil(
        (nextPeriodDate - today) / (1000 * 60 * 60 * 24)
      );
      return { daysUntil, date: nextPeriodDate };
    }

    return null;
  };

  const nextPeriodInfo = getNextPeriodInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-pink-800/30"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#f50561]/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 p-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center space-x-2 text-white/80 mb-2">
            <phaseInfo.icon className={`w-5 h-5 ${phaseInfo.color}`} />
            <span className="text-lg">{phaseInfo.phase}</span>
            {phaseInfo.cycleDay && (
              <span className="text-sm opacity-70">
                • Day {phaseInfo.cycleDay}
              </span>
            )}
          </div>
          <p className="text-white/60 text-sm">{phaseInfo.message}</p>

          {!isInitialized && (
            <button
              onClick={() => setShowInitModal(true)}
              className="mt-4 bg-gradient-to-r from-[#f50561] to-pink-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-[#d4044f] hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Initialize Your Cycle
            </button>
          )}
        </div>

        {/* Calendar Card */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#f50561] to-pink-500 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 text-black/70 hover:text-black hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-black">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>

              <button
                onClick={() => navigateMonth(1)}
                className="p-2 text-black/70 hover:text-black hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="text-center text-black/60 font-medium py-2 text-sm"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {renderCalendarDays()}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-br from-[#f50561] to-red-600 rounded"></div>
                <span className="text-black/80">Period</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded"></div>
                <span className="text-black/80">Fertile</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded"></div>
                <span className="text-black/80">Ovulation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-500 rounded"></div>
                <span className="text-black/80">Luteal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Brain className="w-2 h-2 text-black" />
                </div>
                <span className="text-black/80">Predicted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {[
            {
              label: "Cycle Day",
              value: phaseInfo.cycleDay || "—",
              icon: Calendar,
              color: "from-purple-500 to-pink-500",
            },
            {
              label: "Days to Period",
              value: nextPeriodInfo ? `${nextPeriodInfo.daysUntil}` : "—",
              icon: Droplets,
              color: "from-[#f50561] to-pink-500",
            },
            {
              label: "Avg Cycle",
              value: insights ? `${insights.cycleLength}d` : "—",
              icon: Moon,
              color: "from-blue-500 to-purple-500",
            },
            {
              label: "Data Points",
              value: confirmedCount ?? "—",
              icon: TrendingUp,
              color: "from-green-500 to-emerald-500",
            },
          ].map((stat, index) => (
            <div key={index} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 text-center">
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r ${stat.color} rounded-full mb-2 shadow-lg`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/70">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cycle Regularity Info */}
        {insights && (
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Cycle Regularity</h3>
                <p className="text-white/70 text-sm capitalize">
                  {insights.cycleRegularity?.replace("_", " ") ||
                    "Calculating..."}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-xs">Average Period Length</p>
                <p className="text-white font-semibold">
                  {insights.periodLength} days
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Initialize Cycle Modal */}
      {showInitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#f50561] to-pink-500 rounded-3xl blur opacity-30"></div>
            <div className="relative bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Initialize Your Cycle
                </h3>
                <button
                  onClick={() => setShowInitModal(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    When did your last period start?
                  </label>
                  <input
                    type="date"
                    value={initData.lastPeriodStart}
                    onChange={(e) =>
                      setInitData((prev) => ({
                        ...prev,
                        lastPeriodStart: e.target.value,
                      }))
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#f50561] focus:border-transparent"
                  />
                  <p className="text-white/60 text-xs mt-1">
                    This will help us predict your upcoming cycles
                  </p>
                </div>

                <button
                  onClick={initializeCycle}
                  disabled={!initData.lastPeriodStart}
                  className="w-full bg-gradient-to-r from-[#f50561] to-pink-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-[#d4044f] hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Initialize Cycle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#f50561] to-pink-500 rounded-3xl blur opacity-30"></div>
            <div className="relative bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedDate?.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  {cycleDays[formatDateKey(selectedDate)]?.isPrediction && (
                    <p className="text-yellow-300 text-sm">
                      Predicted • Confirm or adjust
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {cycleDays[formatDateKey(selectedDate)] && (
                    <button
                      onClick={deleteData}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Type
                  </label>
                  <select
                    value={modalData.type}
                    onChange={(e) =>
                      setModalData((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 focus:text-black text-white focus:ring-2 focus:ring-[#f50561] focus:border-transparent"
                  >
                    <option value="period">Period</option>
                    <option value="fertile">Fertile</option>
                    <option value="ovulation">Ovulation</option>
                    <option value="luteal">Luteal</option>
                    <option value="follicular">Follicular</option>
                  </select>
                </div>

                {/* Flow Level (for period) */}
                {modalData.type === "period" && (
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Flow
                    </label>
                    <select
                      value={modalData.flow}
                      onChange={(e) =>
                        setModalData((prev) => ({
                          ...prev,
                          flow: e.target.value,
                        }))
                      }
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 focus:text-black text-white focus:ring-2 focus:ring-[#f50561] focus:border-transparent"
                    >
                      <option value="spotting">Spotting</option>
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  </div>
                )}

                {/* Fertile Level (for fertile) */}
                {modalData.type === "fertile" && (
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Fertility Level
                    </label>
                    <select
                      value={modalData.level}
                      onChange={(e) =>
                        setModalData((prev) => ({
                          ...prev,
                          level: e.target.value,
                        }))
                      }
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 focus:text-black text-white focus:ring-2 focus:ring-[#f50561] focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="peak">Peak</option>
                    </select>
                  </div>
                )}

                {/* Symptoms */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Symptoms
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {symptoms.map((symptom) => (
                      <label
                        key={symptom}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={modalData.symptoms.includes(symptom)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setModalData((prev) => ({
                                ...prev,
                                symptoms: [...prev.symptoms, symptom],
                              }));
                            } else {
                              setModalData((prev) => ({
                                ...prev,
                                symptoms: prev.symptoms.filter(
                                  (s) => s !== symptom
                                ),
                              }));
                            }
                          }}
                          className="w-4 h-4 text-[#f50561] bg-white/10 border-white/30 rounded focus:ring-[#f50561]"
                        />
                        <span className="text-white/80 text-sm capitalize">
                          {symptom}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Notes
                  </label>
                  <textarea
                    value={modalData.notes}
                    onChange={(e) =>
                      setModalData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:ring-2 focus:ring-[#f50561] focus:border-transparent resize-none"
                    rows="3"
                    placeholder="Add any notes..."
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={saveData}
                  className="w-full bg-gradient-to-r from-[#f50561] to-pink-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-[#d4044f] hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  {cycleDays[formatDateKey(selectedDate)]?.isPrediction
                    ? "Confirm"
                    : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodTrackerCalendar;
