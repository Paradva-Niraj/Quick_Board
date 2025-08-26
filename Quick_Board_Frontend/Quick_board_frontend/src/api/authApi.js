import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Faculty registration
export const registerFaculty = async (data) => {
  return await api.post("/Faculty/register", data);
};

// Student registration
export const registerStudent = async (data) => {
  return await api.post("/Student/register", data);
};

// Get all courses
export const getCourses = async () => {
  return await api.get("/Course");
};
