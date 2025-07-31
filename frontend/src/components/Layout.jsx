import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Calendar,
  BarChart3,
  ShoppingBag,
  User,
  Menu,
  X,
  Heart,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  MessageSquareQuote,
  Accessibility,
  Minus,
  Plus,
  Text,
  Globe,
} from "lucide-react";
import Logo from "../assets/chalice-heartwrencher.gif";
import NotificationButton from "./NotificationButton";
import { useTranslation } from "react-i18next";

function Layout() {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAccessibilityMenuOpen, setIsAccessibilityMenuOpen] = useState(false);
  const location = useLocation();
  const [userDetails, setUserDetails] = useState({});
  const [fontSize, setFontSize] = useState(16);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (accessibilityMode) {
      html.classList.add("accessibility-mode");
    } else {
      html.classList.remove("accessibility-mode");
    }
  }, [accessibilityMode]);

  useEffect(() => {
    // Apply font size to the root HTML element
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const navigationItems = [
    {
      path: "/dashboard",
      label: t("dashboard"),
      icon: BarChart3,
      description: "Overview & insights",
    },
    {
      path: "/period-tracker",
      label: t("periodTracker"),
      icon: Calendar,
      description: "Track your cycle",
    },
    {
      path: "/shop",
      label: t("productShop"),
      icon: ShoppingBag,
      description: "Period care products",
    },
    {
      path: "/blog",
      label: t("blogs"),
      icon: MessageSquareQuote,
      description: "Period care blogs",
    },
  ];

  useEffect(() => {
    localStorage.getItem("userDetails") &&
      setUserDetails(JSON.parse(localStorage.getItem("userDetails")));
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleAccessibilityMenu = () => {
    setIsAccessibilityMenuOpen(!isAccessibilityMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("userDetails");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 24)); // Max size 24px
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 12)); // Min size 12px
  };

  const resetFontSize = () => {
    setFontSize(16); // Reset to default
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center gap-4">
              {/* <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hidden md:block">
                  HerCycle
                </h1>
              </div> */}

              <div
                onClick={() => (window.location.href = "/")}
                className="flex-shrink-0 flex items-center cursor-pointer"
              >
                {/* <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hidden md:block">
                  HerCycle
                </h1> */}
                <div className="w-10 h-10 border-1 border-pink-500 bg-transparent from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <img className="" src={Logo} alt="" />
                </div>
                <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hidden md:block">
                  HerCycle
                </h1>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:ml-8 md:flex md:space-x-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                        ${
                          isActive
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }
                      `}
                    >
                      <Icon
                        className={`w-5 h-5 mr-2 ${
                          isActive ? "text-white" : "text-gray-500"
                        }`}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User Menu and Mobile Menu Button */}
            <div className="flex items-center w-[30%]">
              {/* Accessibility Menu */}
              <div className="relative mr-4">
                <button
                  onClick={toggleAccessibilityMenu}
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  aria-label="Accessibility options"
                >
                  <Accessibility className="w-5 h-5" />
                </button>

                {isAccessibilityMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="flex items-center font-medium">
                        <Text className="w-4 h-4 mr-2" />
                        Text Size
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2">
                      <button
                        onClick={decreaseFontSize}
                        className="p-1 rounded-full hover:bg-gray-100"
                        aria-label="Decrease font size"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm">{fontSize}px</span>
                      <button
                        onClick={increaseFontSize}
                        className="p-1 rounded-full hover:bg-gray-100"
                        aria-label="Increase font size"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={resetFontSize}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                    >
                      Reset to Default
                    </button>
                  </div>
                )}
              </div>

              <div className="relative mr-4">
                <button
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  aria-label="Language options"
                >
                  <Globe className="w-5 h-5" />
                </button>

                {isLanguageMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="flex items-center font-medium">
                        <Globe className="w-4 h-4 mr-2" />
                        Select Language
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        i18n.changeLanguage("en");
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        i18n.language === "en"
                          ? "bg-pink-50 text-pink-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        i18n.changeLanguage("fr");
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        i18n.language === "es"
                          ? "bg-pink-50 text-pink-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      French
                    </button>
                    <button
                      onClick={() => {
                        i18n.changeLanguage("ki");
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        i18n.language === "es"
                          ? "bg-pink-50 text-pink-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Kinyarwanda
                    </button>
                    {/* Add more languages as needed */}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={toggleUserMenu}
                    className="flex p-1 items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {(userDetails.name && userDetails.name[0]) || "U"}
                      </span>
                    </div>
                    <span className="ml-2  text-gray-700 font-medium hidden md:inline">
                      {userDetails.name || "User"}
                    </span>
                    {isUserMenuOpen ? (
                      <ChevronUp
                        className="ml-1 text-gray-500 hidden md:inline"
                        size={16}
                      />
                    ) : (
                      <ChevronDown
                        className="ml-1 text-gray-500 hidden md:inline"
                        size={16}
                      />
                    )}
                  </button>
                </div>

                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <NotificationButton />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden ml-4 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1 px-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center px-3 py-3 rounded-lg transition-colors duration-200 group
                      ${
                        isActive
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 mr-3 ${
                        isActive
                          ? "text-white"
                          : "text-gray-500 group-hover:text-gray-700"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div
                        className={`text-xs ${
                          isActive ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 pb-3 border-t border-gray-200 px-4">
              <div className="flex items-center px-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    User Name
                  </div>
                  <div className="text-xs text-gray-500">Premium Plan</div>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <Link
                  to="/settings"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 mr-3 text-gray-500" />
                    Settings
                  </div>
                </Link>

                <button className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <LogOut className="w-5 h-5 mr-3 text-gray-500" />
                    Logout
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
