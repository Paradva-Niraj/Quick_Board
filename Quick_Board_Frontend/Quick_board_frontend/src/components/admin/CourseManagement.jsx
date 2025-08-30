// src/components/admin/CourseManagement.jsx
import React, { useState, useEffect } from 'react';
import { courseApi } from '../../api/adminApi';
import DataTable from '../ui/DataTable';
import Modal from '../ui/Modal';
import InputField from '../ui/InputField';
import SearchBar from '../ui/SearchBar';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ CourseName: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.CourseName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [courses, searchTerm]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseApi.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCourse(null);
    setFormData({ CourseName: '' });
    setIsModalOpen(true);
    setError('');
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({ CourseName: course.CourseName });
    setIsModalOpen(true);
    setError('');
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Are you sure you want to delete "${course.CourseName}"?`)) {
      return;
    }

    try {
      await courseApi.deleteCourse(course.CourseId);
      setCourses(courses.filter(c => c.CourseId !== course.CourseId));
    } catch (error) {
      console.error('Error deleting course:', error);
      setError('Failed to delete course');
    }
  };

  const handleSubmit = async () => {
    if (!formData.CourseName.trim()) {
      setError('Course name is required');
      return;
    }

    try {
      if (editingCourse) {
        await courseApi.updateCourse(editingCourse.CourseId, formData);
        setCourses(courses.map(c => 
          c.CourseId === editingCourse.CourseId 
            ? { ...c, CourseName: formData.CourseName }
            : c
        ));
      } else {
        const newCourse = await courseApi.addCourse(formData);
        setCourses([...courses, newCourse]);
      }
      setIsModalOpen(false);
      setError('');
    } catch (error) {
      console.error('Error saving course:', error);
      setError('Failed to save course');
    }
  };

  const columns = [
    {
      header: 'Course ID',
      key: 'CourseId',
      render: (row) => (
        <span className="text-sm font-medium text-gray-900">
          #{row.CourseId}
        </span>
      )
    },
    {
      header: 'Course Name',
      key: 'CourseName',
      render: (row) => (
        <span className="text-sm text-gray-900 font-medium">
          {row.CourseName}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: handleEdit,
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    },
    {
      label: 'Delete',
      onClick: handleDelete,
      className: 'bg-red-100 text-red-800 hover:bg-red-200'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Course
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search courses..."
          className="w-full sm:w-96"
        />
        <span className="text-sm text-gray-500">
          {filteredCourses.length} of {courses.length} courses
        </span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={filteredCourses}
          loading={loading}
          actions={actions}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
        onConfirm={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <InputField
            label="Course Name"
            type="text"
            value={formData.CourseName}
            onChange={(e) => setFormData({ ...formData, CourseName: e.target.value })}
            placeholder="Enter course name"
            required
          />
        </div>
      </Modal>
    </div>
  );
};

export default CourseManagement;