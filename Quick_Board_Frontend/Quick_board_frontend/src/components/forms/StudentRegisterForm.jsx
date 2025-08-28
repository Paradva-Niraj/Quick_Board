import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
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
    <div className="min-h-100 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="mx-auto h-12 w-12 bg-gradient-to-r from-green-600 to-lime-600 rounded-lg flex items-center justify-center mb-4">
          <div className="h-6 w-6 bg-white rounded-sm"></div>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Student Registration</h2>
          <p className="mt-2 text-gray-600">Create your student account here</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {(message && !Object.keys(errors).length) && (
            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-green-700 text-sm">{message}</span>
            </div>
          )}
          {Object.keys(errors).length > 0 && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
              <span className="text-red-700 text-sm">Please fix the errors above</span>
            </div>
          )}

          <InputField
            label="Name"
            value={formData.StudentName}
            onChange={(e) => setFormData({ ...formData, StudentName: e.target.value })}
            error={errors.StudentName}
            disabled={isLoading}
          />
          <InputField
            label="Email"
            type="email"
            value={formData.StudentMail}
            onChange={(e) => setFormData({ ...formData, StudentMail: e.target.value })}
            error={errors.StudentMail}
            disabled={isLoading}
          />
          <InputField
            label="Password"
            type="password"
            value={formData.StudentPassword}
            onChange={(e) => setFormData({ ...formData, StudentPassword: e.target.value })}
            error={errors.StudentPassword}
            disabled={isLoading}
          />

          {/* Course Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Course</label>
            <select
              value={formData.StudentCourseId}
              onChange={(e) => setFormData({ ...formData, StudentCourseId: e.target.value })}
              className={`mt-1 block w-full rounded-xl border p-2 focus:ring-2 focus:ring-green-500 shadow-sm ${
                errors.StudentCourseId ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading}
            >
              <option value="">-- Select Course --</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.courseName}
                </option>
              ))}
            </select>
            {errors.StudentCourseId && (
              <p className="text-red-500 text-sm mt-1">{errors.StudentCourseId}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white ${
              isLoading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            } transition-all duration-200`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Have an account?{" "}
              <a
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in here
              </a>
            </p>
          </div>

          
        </form>
      </div>
    </div>
  );
}
