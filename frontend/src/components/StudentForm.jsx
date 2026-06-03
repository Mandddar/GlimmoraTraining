import { useState, useEffect } from "react";
import { toast } from "react-toastify";
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
        await api.put(`/student/${editingStudent.id}`, formData);
        onStudentAdded("Student updated successfully");
      } else {
        await api.post("/student", formData);
        onStudentAdded("Student added successfully");
      }

      setFormData({
        name: "",
        email: "",
        course: "",
      });

      if (editingStudent) {
        onEditCancelled();
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to save student. Please try again.");
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
    <section className="card card-form">
      <div className="card-header">
        <div>
          <p className="eyebrow">Student Profile</p>
          <h2>{editingStudent ? "Update Student" : "Add Student"}</h2>
          <p className="form-copy">
            {editingStudent
              ? "Edit student details and save changes."
              : "Add a new student record to the dashboard."}
          </p>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="field-group">
          <span>Name</span>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter student name"
            required
          />
        </label>

        <label className="field-group">
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter student email"
            required
          />
        </label>

        <label className="field-group">
          <span>Course</span>
          <input
            name="course"
            value={formData.course}
            onChange={handleChange}
            placeholder="Enter course name"
            required
          />
        </label>

        <div className="form-actions">
          <button type="submit" className={editingStudent ? "btn-green" : "btn-blue"}>
            {editingStudent ? "Update Student" : "Add Student"}
          </button>
          {editingStudent && (
            <button type="button" className="btn-gray" onClick={handleCancel}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default StudentForm;
