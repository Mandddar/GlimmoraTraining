import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateStudentPanel from "./components/CreateStudentPanel";
import StudentCard from "./components/StudentCard";
import StudentForm from "./components/StudentForm";
import RecommendationPanel from "./components/RecommendationPanel";
import api from "./services/api";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);
  const [recommendationText, setRecommendationText] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const fetchStudents = async () => {
    try {
      const response = await api.get("/students");
      setStudents(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load students.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStudentAdded = (message) => {
    fetchStudents();
    setEditingStudent(null);
    if (message) {
      toast.success(message, { position: "top-right" });
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
  };

  const handleEditCancelled = () => {
    setEditingStudent(null);
  };

  const handleDeleteStudent = async (id) => {
    try {
      await api.delete(`/student/${id}`);
      await fetchStudents();
      toast.success("Student deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete student.");
    }
  };

  const handleRecommendation = async (id) => {
    setLoadingId(id);
    const student = students.find((s) => s.id === id);

    try {
      const response = await api.post(`/student/${id}/recommendation`);
      setRecommendationText(response.data.recommendation);
      setSelectedStudent(student);
      setIsRecommendationOpen(true);
      toast.success("Recommendation generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate recommendation.");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="workspace">
      <div className="workspace-container">
        <header className="workspace-header">
          <div>
            <h1>Student Workspace</h1>
            <p>Manage records, generate AI insights, and track student growth.</p>
          </div>
          <button
            className="theme-toggle-btn"
            onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙 " : "☀️ "}
          </button>
        </header>

        <div className="workspace-controls">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="search"
              className="search-input"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="new-student-btn" onClick={() => setIsCreateOpen(true)}>
            + New Student
          </button>
        </div>

        {editingStudent && (
          <StudentForm
            editingStudent={editingStudent}
            onStudentAdded={handleStudentAdded}
            onEditCancelled={handleEditCancelled}
          />
        )}

        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <h2>No students yet</h2>
            <p>Create your first student profile to begin generating AI insights.</p>
            <button className="empty-cta" onClick={() => setIsCreateOpen(true)}>
              Create First Student
            </button>
          </div>
        ) : (
          <div className="students-grid">
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onEdit={() => handleEditStudent(student)}
                onRecommendation={handleRecommendation}
                onDelete={handleDeleteStudent}
                isLoading={loadingId === student.id}
              />
            ))}
          </div>
        )}
      </div>

      <CreateStudentPanel
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onStudentAdded={handleStudentAdded}
      />

      <RecommendationPanel
        isOpen={isRecommendationOpen}
        onClose={() => setIsRecommendationOpen(false)}
        recommendation={recommendationText}
        studentName={selectedStudent?.name}
      />

      <ToastContainer
        theme="colored"
        position="bottom-right"
        autoClose={2800}
        hideProgressBar={false}
      />
    </div>
  );
}

export default App;
