import { useState } from "react";
import FacultyRegisterForm from "../components/forms/FacultyRegisterForm";
import StudentRegisterForm from "../components/forms/StudentRegisterForm";

export default function Register() {
  const [role, setRole] = useState("student");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-6">
          <button
            className={`px-4 py-2 rounded-l-xl ${
              role === "student" ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setRole("student")}
          >
            Student
          </button>
          <button
            className={`px-4 py-2 rounded-r-xl ${
              role === "faculty" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setRole("faculty")}
          >
            Faculty
          </button>
        </div>
        {role === "student" ? <StudentRegisterForm /> : <FacultyRegisterForm />}
        <div>
          <span></span>
        </div>
      </div>
    </div>
  );
}
