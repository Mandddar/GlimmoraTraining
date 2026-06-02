
import { useState, useEffect } from "react";
import api from "../services/api";

function StudentForm({ onStudentAdded, editingStudent, onEditCancelled }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: "",
  });

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name,
        email: editingStudent.email,
        course: editingStudent.course,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        course: "",
      });
    }
  }, [editingStudent]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingStudent) {
        // Update existing student
        await api.put(`/student/${editingStudent.id}`, formData);
        alert("Student Updated");
      } else {
        // Create new student
        await api.post("/student", formData);
        alert("Student Added");
      }

      setFormData({
        name: "",
        email: "",
        course: "",
      });

      onStudentAdded();

      if (editingStudent) {
        onEditCancelled();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      email: "",
      course: "",
    });
    onEditCancelled();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        name="course"
        placeholder="Course"
        value={formData.course}
        onChange={handleChange}
        required
      />

      <button type="submit">
        {editingStudent ? "Update Student" : "Add Student"}
      </button>

      {editingStudent && (
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}

export default StudentForm;