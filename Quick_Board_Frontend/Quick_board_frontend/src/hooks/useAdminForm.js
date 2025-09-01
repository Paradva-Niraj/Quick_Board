import { useState, useCallback } from 'react';

const useAdminForm = (initialState = {
  AdminName: '',
  AdminMail: '',
  AdminPassword: ''
}) => {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setError('');
  }, [initialState]);

  const setForm = useCallback((data) => {
    setFormData(data);
  }, []);

  return {
    formData,
    error,
    setError,
    handleChange,
    resetForm,
    setForm
  };
};

export default useAdminForm;
