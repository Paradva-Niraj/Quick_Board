import { useState, useEffect } from "react";
import { registerStudent, getCourses } from "../../api/authApi";
import InputField from "../ui/InputField";

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

  // Fetch courses from API
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
    if (!formData.StudentMail.includes("@")) newErrors.StudentMail = "Valid email required";
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
    try {
      const res = await registerStudent(formData);
      setMessage(res.data.message);
      setFormData({ StudentName: "", StudentMail: "", StudentPassword: "", StudentCourseId: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Student Registration</h2>
      
      <InputField
        label="Name"
        value={formData.StudentName}
        onChange={(e) => setFormData({ ...formData, StudentName: e.target.value })}
        error={errors.StudentName}
      />
      <InputField
        label="Email"
        type="email"
        value={formData.StudentMail}
        onChange={(e) => setFormData({ ...formData, StudentMail: e.target.value })}
        error={errors.StudentMail}
      />
      <InputField
        label="Password"
        type="password"
        value={formData.StudentPassword}
        onChange={(e) => setFormData({ ...formData, StudentPassword: e.target.value })}
        error={errors.StudentPassword}
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
        className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition"
      >
        Register
      </button>

      {message && <p className="mt-3 text-green-600">{message}</p>}
    </form>
  );
}
