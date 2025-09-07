import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Eye, EyeOff, User, Mail, Lock, BookOpen } from "lucide-react";
import InputField from "../ui/InputField";
import { registerStudent, getCourses } from "../../api/authApi";

export default function StudentRegisterForm() {
  const [formData, setFormData] = useState({
    StudentName: "",
    StudentMail: "",
    StudentPassword: "",
    StudentCourseId: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getCourses();
        setCourses(res.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.StudentName) newErrors.StudentName = "Name is required";
    if (!formData.StudentMail.includes("@"))
      newErrors.StudentMail = "Valid email required";
    if (formData.StudentPassword.length < 6)
      newErrors.StudentPassword = "Password must be at least 6 characters";
    if (!formData.StudentCourseId) newErrors.StudentCourseId = "Course is required";
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
    try {
      const res = await registerStudent(formData);
      setMessage(res.data.message);
      setFormData({ StudentName: "", StudentMail: "", StudentPassword: "", StudentCourseId: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform hover:scale-105 transition-transform">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Join as Student</h2>
          <p className="text-gray-600">Create your student account and start learning</p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Success/Error Messages */}
          {message && !Object.keys(errors).length && (
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
                  value={formData.StudentName}
                  onChange={(e) => setFormData({ ...formData, StudentName: e.target.value })}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400 ${
                    errors.StudentName ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.StudentName && (
                <p className="text-red-500 text-sm ml-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.StudentName}
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
                  value={formData.StudentMail}
                  onChange={(e) => setFormData({ ...formData, StudentMail: e.target.value })}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400 ${
                    errors.StudentMail ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.StudentMail && (
                <p className="text-red-500 text-sm ml-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.StudentMail}
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
                  value={formData.StudentPassword}
                  onChange={(e) => setFormData({ ...formData, StudentPassword: e.target.value })}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400 ${
                    errors.StudentPassword ? "border-red-300 bg-red-50" : "border-gray-200"
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
              {errors.StudentPassword && (
                <p className="text-red-500 text-sm ml-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.StudentPassword}
                </p>
              )}
            </div>

            {/* Course Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Select Course
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  value={formData.StudentCourseId}
                  onChange={(e) => setFormData({ ...formData, StudentCourseId: e.target.value })}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 appearance-none ${
                    errors.StudentCourseId ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                >
                  <option value="">Choose your course</option>
                  {courses.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.courseName}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.StudentCourseId && (
                <p className="text-red-500 text-sm ml-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.StudentCourseId}
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
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-xl active:scale-95"
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
                "Create Student Account"
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-6 border-t border-gray-100">
              <p className="text-gray-600">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors hover:underline"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}