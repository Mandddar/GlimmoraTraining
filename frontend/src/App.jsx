import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateStudentPanel from "./components/CreateStudentPanel";
import StudentCard from "./components/StudentCard";
import StudentForm from "./components/StudentForm";
import RecommendationPanel from "./components/RecommendationPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Register from "./components/Register";
import api from "./services/api";
import "./App.css";

function StudentDashboard() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);
  const [recommendationText, setRecommendationText] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  const navigate = useNavigate();

  // Retrieve current user details from localStorage
  const userJson = localStorage.getItem("user");
  const currentUser = userJson ? JSON.parse(userJson) : { username: "User", email: "" };

  const fetchStudents = async () => {
    try {
      const response = await api.get("/students");
      setStudents(response.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status !== 401) {
        toast.error("Failed to load students.");
      }
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.info("Logged out successfully");
    navigate("/login");
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
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", textAlign: "right" }}>
              Logged in as: <strong style={{ color: "var(--text-primary)" }}>{currentUser.username}</strong>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{currentUser.email}</div>
            </div>
            <button 
              className="btn-gray" 
              onClick={handleLogout} 
              style={{ 
                padding: "6px 12px", 
                borderRadius: "6px", 
                fontSize: "0.85rem", 
                cursor: "pointer",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <span>🚪</span> Logout
            </button>
          </div>
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
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer
        theme="colored"
        position="bottom-right"
        autoClose={2800}
        hideProgressBar={false}
      />
    </>
  );
}

export default App;
