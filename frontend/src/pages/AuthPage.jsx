import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Calendar, Heart, Shield, User, Mail, Lock, Sparkles, Moon, Sun } from 'lucide-react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = 'Please agree to the terms and conditions';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function decodeJWT(token) {
    const [headerB64, payloadB64, signatureB64] = token.split('.');

    const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

    return {
        header,
        payload
    };
}

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const endpoint = isLogin ? '/auth/login' : '/auth/register';
  const payload = isLogin
    ? {
        email: formData.email,
        password: formData.password
      }
    : {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        agreeTerms: formData.agreeTerms,
        languagePreference: 'en',
      };

  try {
    const response = await axios.post(endpoint, payload);

    // Handle success (e.g., store token, redirect, notify)
    toast.success(isLogin ? 'Login successful!' : 'Account created successfully!');
    if (isLogin) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userDetails', JSON.stringify(decodeJWT(response.data.token).payload?.user));
      navigate('/dashboard');
    }
    else {
      setIsLogin(true);
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      const serverErrors = {};
      error.response.data.errors.forEach(err => {
        if (err.param) serverErrors[err.param] = err.msg;
      });
      setErrors(serverErrors);
    } else {
      toast.error('Something went wrong. Please try again.');
    }
  }
};


  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-pink-800/30"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#f50561]/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        
        {/* Sparkle Animation */}
        <div className="absolute top-1/4 left-1/4 text-white/20 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="absolute top-3/4 right-1/4 text-white/20 animate-pulse delay-700">
          <Moon className="w-8 h-8" />
        </div>
        <div className="absolute top-1/3 right-1/3 text-white/20 animate-pulse delay-300">
          <Sun className="w-5 h-5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-[#f50561] to-pink-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-r from-[#f50561] to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                <Calendar className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Her<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f50561] to-pink-400">Cycle</span>
            </h1>
            <p className="text-white/80 text-lg">Your intimate wellness companion</p>
          </div>

          {/* Form Card */}
          <div className="relative">
            {/* Card Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#f50561] to-pink-500 rounded-3xl blur opacity-25"></div>
            
            <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              {/* Mode Toggle */}
              <div className="flex mb-8 p-1 bg-white/5 rounded-2xl border border-white/10">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 text-center font-semibold transition-all duration-500 rounded-xl ${
                    isLogin
                      ? 'text-black bg-gradient-to-r from-[#f50561] to-pink-500 shadow-lg transform scale-105'
                      : 'text-black/70 hover:text-black/90 hover:bg-black/5'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 text-center font-semibold transition-all duration-500 rounded-xl ${
                    !isLogin
                      ? 'text-black bg-gradient-to-r from-[#f50561] to-pink-500 shadow-lg transform scale-105'
                      : 'text-black/70 hover:text-black/90 hover:bg-black/5'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <div className="space-y-6">
                {/* Name Field (Sign Up Only) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-black/90">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#f50561]/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black/60 w-5 h-5 z-10" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border rounded-xl text-black placeholder-black/50 focus:ring-2 focus:ring-[#f50561] focus:border-transparent transition-all duration-300 ${
                            errors.name ? 'border-red-400' : 'border-white/20 focus:bg-white/15'
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>
                    {errors.name && (
                      <p className="text-red-300 text-sm flex items-center">
                        <span className="w-1 h-1 bg-red-300 rounded-full mr-2"></span>
                        {errors.name}
                      </p>
                    )}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black/90">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#f50561]/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black/60 w-5 h-5 z-10" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border rounded-xl text-black placeholder-black/50 focus:ring-2 focus:ring-[#f50561] focus:border-transparent transition-all duration-300 ${
                          errors.email ? 'border-red-400' : 'border-white/20 focus:bg-white/15'
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-red-300 text-sm flex items-center">
                      <span className="w-1 h-1 bg-red-300 rounded-full mr-2"></span>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black/90">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#f50561]/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black/60 w-5 h-5 z-10" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-14 py-4 bg-white/10 backdrop-blur-sm border rounded-xl text-black placeholder-black/50 focus:ring-2 focus:ring-[#f50561] focus:border-transparent transition-all duration-300 ${
                          errors.password ? 'border-red-400' : 'border-white/20 focus:bg-white/15'
                        }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black/60 hover:text-black/90 transition-colors duration-200 z-10"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-red-300 text-sm flex items-center">
                      <span className="w-1 h-1 bg-red-300 rounded-full mr-2"></span>
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field (Sign Up Only) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-black/90">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#f50561]/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5 z-10" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-14 py-4 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-black/50 focus:ring-2 focus:ring-[#f50561] focus:border-transparent transition-all duration-300 ${
                            errors.confirmPassword ? 'border-red-400' : 'border-white/20 focus:bg-white/15'
                          }`}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors duration-200 z-10"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-300 text-sm flex items-center">
                        <span className="w-1 h-1 bg-red-300 rounded-full mr-2"></span>
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}

                {/* Terms & Conditions (Sign Up Only) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="agreeTerms"
                          checked={formData.agreeTerms}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-[#f50561] bg-white/10 border-white/30 rounded focus:ring-[#f50561] focus:ring-2"
                        />
                      </div>
                      <span className="text-sm text-white/80 group-hover:text-white/90 transition-colors">
                        I agree to the{' '}
                        <a href="#" className="text-[#f50561] hover:text-pink-400 underline transition-colors">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-[#f50561] hover:text-pink-400 underline transition-colors">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                    {errors.agreeTerms && (
                      <p className="text-red-300 text-sm flex items-center">
                        <span className="w-1 h-1 bg-red-300 rounded-full mr-2"></span>
                        {errors.agreeTerms}
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#f50561] to-pink-500 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-200"></div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="relative w-full bg-gradient-to-r from-[#f50561] to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-[#d4044f] hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                  >
                    <span className="relative text-black z-10">{isLogin ? 'Sign In' : 'Create Account'}</span>
                  </button>
                </div>

                {/* Forgot Password (Login Only) */}
                {isLogin && (
                  <div className="text-center">
                    <a href="#" className="text-white/70 hover:text-[#f50561] text-sm transition-colors duration-200 hover:underline">
                      Forgot your password?
                    </a>
                  </div>
                )}
              </div>

              {/* Switch Mode */}
              <div className="mt-8 text-center">
                <p className="text-white/70">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    onClick={toggleMode}
                    className="ml-2 text-[#f50561] hover:text-pink-400 font-semibold transition-colors duration-200 hover:underline"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { icon: Calendar, text: 'Smart Tracking', color: 'from-purple-500 to-pink-500' },
              { icon: Heart, text: 'Health Insights', color: 'from-pink-500 to-rose-500' },
              { icon: Shield, text: 'Private & Secure', color: 'from-rose-500 to-red-500' }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 text-center">
                    <div className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r ${feature.color} rounded-full mb-3 shadow-lg`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs text-white/80 font-medium">{feature.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;