// src/components/forms/FacultyRegisterForm.jsx
import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import InputField from "../ui/InputField";
// <-- MISSING import: registerFaculty from api
import { registerFaculty } from "../../api/authApi";

export default function FacultyRegisterForm() {
  const [formData, setFormData] = useState({
    FacultyName: "",
    FacultyMail: "",
    FacultyPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      // registerFaculty is implemented in src/api/authApi.js (axios-based)
      const res = await registerFaculty({
        FacultyName: formData.FacultyName,
        FacultyMail: formData.FacultyMail,
        FacultyPassword: formData.FacultyPassword,
      });

      // axios returns { data: { message, faculty } }
      const respData = res?.data ?? res;
      setMessage(respData?.message || "Registration successful. Waiting for approval.");
      setFormData({ FacultyName: "", FacultyMail: "", FacultyPassword: "" });
    } catch (err) {
      console.error("Faculty registration error:", err);

      // try many shapes: axios -> err.response.data.message, fetch wrapper -> err.message or err.data
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
    <div className="min-h-120 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
          <div className="h-6 w-6 bg-white rounded-sm"></div>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Faculty Registration</h2>
          <p className="mt-2 text-gray-600">Create your faculty account here</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {message && Object.keys(errors).length === 0 && (
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
            value={formData.FacultyName}
            onChange={(e) => setFormData({ ...formData, FacultyName: e.target.value })}
            error={errors.FacultyName}
            disabled={isLoading}
          />
          <InputField
            label="Email"
            type="email"
            value={formData.FacultyMail}
            onChange={(e) => setFormData({ ...formData, FacultyMail: e.target.value })}
            error={errors.FacultyMail}
            disabled={isLoading}
          />
          <InputField
            label="Password"
            type="password"
            value={formData.FacultyPassword}
            onChange={(e) => setFormData({ ...formData, FacultyPassword: e.target.value })}
            error={errors.FacultyPassword}
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white ${isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              } transition-all duration-200`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
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
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}