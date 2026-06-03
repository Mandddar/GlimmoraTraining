import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import api from "../services/api";

function CreateStudentPanel({ isOpen, onClose, onStudentAdded }) {
  const panelRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      formRef.current?.focus();
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      course: formData.get("course"),
    };

    try {
      await api.post("/student", data);
      onStudentAdded("Student created successfully");
      e.target.reset();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create student.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="create-panel" ref={panelRef} onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h2>New Student</h2>
          <button className="panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="panel-content">
          <form className="create-form" onSubmit={handleSubmit} ref={formRef}>
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Student name"
                required
                autoFocus
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="student@email.com"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="course">Course</label>
              <input
                id="course"
                name="course"
                type="text"
                placeholder="e.g., Computer Science"
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Create Student
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateStudentPanel;
