// src/api/facultyApi.js
import { authAPI } from "./authApi";

const facultyApi = {
  getAll: async () => {
    try {
      return await authAPI.apiCall("/Faculty", { method: "GET" });
    } catch (error) {
      console.error("Error fetching faculty:", error);
      return { success: false, error: error.message };
    }
  },

  approve: async (facultyId, adminId) => {
    try {
      return await authAPI.apiCall(`/Faculty/approve/${facultyId}`, {
        method: "PUT",
        body: JSON.stringify({ AdminId: adminId }),
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error approving faculty:", error);
      return { success: false, error: error.message };
    }
  },

  delete: async (facultyId) => {
    try {
      return await authAPI.apiCall(`/Faculty/${facultyId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting faculty:", error);
      return { success: false, error: error.message };
    }
  },

  update: async (facultyId, payload) => {
    try {
      console.log("facultyApi.update called with:", { facultyId, payload });
      
      const response = await authAPI.apiCall(`/Faculty/${facultyId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      console.log("facultyApi.update response:", response);

      // Handle different response formats from the backend
      if (response) {
        // If response has explicit success field
        if (response.success === true || response.Success === true) {
          return { success: true, data: response.data || response };
        }
        
        // If response has error field, it's likely an error
        if (response.error || response.Error) {
          return { 
            success: false, 
            error: response.error || response.Error,
            message: response.message || response.Message 
          };
        }
        
        // If response is truthy but no explicit success/error fields,
        // assume success (some APIs just return the updated data)
        if (typeof response === 'object' && response !== null) {
          return { success: true, data: response };
        }
        
        // If response is a string (like "Updated successfully")
        if (typeof response === 'string') {
          return { success: true, message: response };
        }
      }

      // If we get here, assume success if no explicit error
      return { success: true, data: response };
      
    } catch (error) {
      console.error("Error updating faculty:", error);
      
      // Handle different types of errors
      if (error.message.includes('404')) {
        return { success: false, error: "Faculty not found" };
      } else if (error.message.includes('401')) {
        return { success: false, error: "Unauthorized access" };
      } else if (error.message.includes('403')) {
        return { success: false, error: "Permission denied" };
      } else if (error.message.includes('500')) {
        return { success: false, error: "Server error. Please try again." };
      } else {
        return { success: false, error: error.message || "Failed to update faculty" };
      }
    }
  },

  // Helper method to get current faculty details
  getById: async (facultyId) => {
    try {
      return await authAPI.apiCall(`/Faculty/${facultyId}`, { method: "GET" });
    } catch (error) {
      console.error("Error fetching faculty by ID:", error);
      return { success: false, error: error.message };
    }
  },
};

export default facultyApi;