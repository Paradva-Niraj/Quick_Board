// src/components/forms/FacultyRegisterForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import InputField from "../ui/InputField";
import { registerFaculty } from "../../api/authApi";

export default function FacultyRegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    FacultyName: "",
    FacultyMail: "",
    FacultyPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const validate = () => {
    const newErrors = {};
    if (!formData.FacultyName) newErrors.FacultyName = "Name is required";
    if (!formData.FacultyMail || !formData.FacultyMail.includes("@"))
      newErrors.FacultyMail = "Valid email required";
    if (!formData.FacultyPassword || formData.FacultyPassword.length < 6)
      newErrors.FacultyPassword = "Password must be at least 6 characters";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setIsLoading(true);
    setErrors({});
    setMessage("");

    try {
      const res = await registerFaculty({
        FacultyName: formData.FacultyName,
        FacultyMail: formData.FacultyMail,
        FacultyPassword: formData.FacultyPassword,
      });

      const respData = res?.data ?? res;
      setMessage(respData?.message || "Registration successful. Waiting for approval.");
      setFormData({ FacultyName: "", FacultyMail: "", FacultyPassword: "" });
    } catch (err) {
      console.error("Faculty registration error:", err);

      const friendly =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";

      setMessage(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform hover:scale-105 transition-transform">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Join as Faculty</h2>
          <p className="text-gray-600">Create your faculty account and get started</p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Success/Error Messages */}
          {message && Object.keys(errors).length === 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-green-700 text-sm font-medium">{message}</span>
              </div>
            </div>
          )}

          {message && Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-red-700 text-sm font-medium">{message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.FacultyName}
                  onChange={(e) => setFormData({ ...formData, FacultyName: e.target.value })}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 placeholder-gray-400 ${
                    errors.FacultyName ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.FacultyName && (
                <p className="text-red-500 text-sm ml-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.FacultyName}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.FacultyMail}
                  onChange={(e) => setFormData({ ...formData, FacultyMail: e.target.value })}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 placeholder-gray-400 ${
                    errors.FacultyMail ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.FacultyMail && (
                <p className="text-red-500 text-sm ml-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.FacultyMail}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.FacultyPassword}
                  onChange={(e) => setFormData({ ...formData, FacultyPassword: e.target.value })}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 placeholder-gray-400 ${
                    errors.FacultyPassword ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.FacultyPassword && (
                <p className="text-red-500 text-sm ml-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.FacultyPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-semibold text-white shadow-lg transform transition-all duration-300 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:scale-105 hover:shadow-xl active:scale-95"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                "Create Faculty Account"
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-6 border-t border-gray-100">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}