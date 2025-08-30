// src/api/adminApi.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Admin Management APIs
export const adminApi = {
  // Get all admins
  getAllAdmins: async () => {
    const response = await fetch(`${API_BASE_URL}/Admin`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch admins: ${response.status}`);
    }
    return await response.json();
  },

  // Get admin by ID
  getAdmin: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Admin/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch admin: ${response.status}`);
    }
    return await response.json();
  },

  // Add new admin
  addAdmin: async (adminData) => {
    const response = await fetch(`${API_BASE_URL}/Admin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(adminData)
    });
    if (!response.ok) {
      throw new Error(`Failed to add admin: ${response.status}`);
    }
    return await response.json();
  },

  // Update admin
  updateAdmin: async (id, adminData) => {
    const response = await fetch(`${API_BASE_URL}/Admin/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(adminData)
    });
    if (!response.ok) {
      throw new Error(`Failed to update admin: ${response.status}`);
    }
    return await response.json();
  },

  // Delete admin
  deleteAdmin: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Admin/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to delete admin: ${response.status}`);
    }
    return await response.json();
  }
};

// Course Management APIs
export const courseApi = {
  // Get all courses
  getAllCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/Course`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      if (response.status === 204) {
        return []; // Return empty array for no content
      }
      throw new Error(`Failed to fetch courses: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  // Get course by ID
  getCourse: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Course/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch course: ${response.status}`);
    }
    return await response.json();
  },

  // Add new course
  addCourse: async (courseData) => {
    const response = await fetch(`${API_BASE_URL}/Course`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    if (!response.ok) {
      throw new Error(`Failed to add course: ${response.status}`);
    }
    return await response.json();
  },

  // Update course
  updateCourse: async (id, courseData) => {
    const response = await fetch(`${API_BASE_URL}/Course/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    if (!response.ok) {
      throw new Error(`Failed to update course: ${response.status}`);
    }
    return await response.json();
  },

  // Delete course
  deleteCourse: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Course/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to delete course: ${response.status}`);
    }
    return await response.json();
  }
};

// Faculty Management APIs
export const facultyApi = {
  // Get all faculty
  getAllFaculty: async () => {
    const response = await fetch(`${API_BASE_URL}/Faculty`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      if (response.status === 204) {
        return []; // Return empty array for no content
      }
      throw new Error(`Failed to fetch faculty: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  // Approve faculty
  approveFaculty: async (facultyId, adminId) => {
    const response = await fetch(`${API_BASE_URL}/Faculty/approve/${facultyId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ AdminId: adminId })
    });
    if (!response.ok) {
      throw new Error(`Failed to approve faculty: ${response.status}`);
    }
    return await response.json();
  },

  // Delete faculty
  deleteFaculty: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Faculty/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to delete faculty: ${response.status}`);
    }
    return await response.json();
  }
};

// Student Management APIs
export const studentApi = {
  // Get all students
  getAllStudents: async () => {
    const response = await fetch(`${API_BASE_URL}/Student`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      if (response.status === 204) {
        return []; // Return empty array for no content
      }
      throw new Error(`Failed to fetch students: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  // Delete student
  deleteStudent: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Student/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to delete student: ${response.status}`);
    }
    return await response.json();
  }
};

// Notice Management APIs
export const noticeApi = {
  // Get all notices
  getAllNotices: async () => {
    const response = await fetch(`${API_BASE_URL}/Notice`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch notices: ${response.status}`);
    }
    return await response.json();
  },

  // Delete notice
  deleteNotice: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Notice/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to delete notice: ${response.status}`);
    }
    return await response.json();
  }
};