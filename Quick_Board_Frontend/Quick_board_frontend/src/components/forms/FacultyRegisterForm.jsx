import { useState } from "react";
import { registerFaculty } from "../../api/authApi";
import InputField from "../ui/InputField";

export default function FacultyRegisterForm() {
  const [formData, setFormData] = useState({
    FacultyName: "",
    FacultyMail: "",
    FacultyPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!formData.FacultyName) newErrors.FacultyName = "Name is required";
    if (!formData.FacultyMail.includes("@")) newErrors.FacultyMail = "Valid email required";
    if (formData.FacultyPassword.length < 6)
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
    try {
      const res = await registerFaculty(formData);
      setMessage(res.data.message);
      setFormData({ FacultyName: "", FacultyMail: "", FacultyPassword: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Faculty Registration</h2>
      <InputField
        label="Name"
        value={formData.FacultyName}
        onChange={(e) => setFormData({ ...formData, FacultyName: e.target.value })}
        error={errors.FacultyName}
      />
      <InputField
        label="Email"
        type="email"
        value={formData.FacultyMail}
        onChange={(e) => setFormData({ ...formData, FacultyMail: e.target.value })}
        error={errors.FacultyMail}
      />
      <InputField
        label="Password"
        type="password"
        value={formData.FacultyPassword}
        onChange={(e) => setFormData({ ...formData, FacultyPassword: e.target.value })}
        error={errors.FacultyPassword}
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
      >
        Register
      </button>
      {message && <p className="mt-3 text-green-600">{message}</p>}
    </form>
  );
}
